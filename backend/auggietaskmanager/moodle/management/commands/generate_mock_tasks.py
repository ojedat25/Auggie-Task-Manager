import random
import string
from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from moodle.models import Task


@dataclass(frozen=True)
class _Args:
    count: int
    days: int
    source: str
    username: str | None
    user_id: int | None
    seed: int | None
    course: str
    completed_rate: float


def _random_title(rng: random.Random) -> str:
    words = [
        "Read",
        "Finish",
        "Review",
        "Write",
        "Submit",
        "Study",
        "Prepare",
        "Draft",
        "Fix",
        "Plan",
    ]
    objects = [
        "assignment",
        "lab",
        "quiz",
        "project",
        "notes",
        "report",
        "slides",
        "chapter",
        "problem set",
    ]
    suffix = "".join(rng.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{rng.choice(words)} {rng.choice(objects)} ({suffix})"


def _pick_user(*, username: str | None, user_id: int | None):
    User = get_user_model()

    if username and user_id:
        raise CommandError("Pass only one of --username or --user-id")

    if user_id is not None:
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist as exc:
            raise CommandError(f"User with id={user_id} does not exist") from exc

    if username is not None:
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f"User '{username}' does not exist") from exc

    # Default: first user, or create one for convenience in dev.
    user = User.objects.order_by("id").first()
    if user is not None:
        return user

    # Create a dev user if nothing exists.
    return User.objects.create_user(username="mockuser", password="mockpass")


class Command(BaseCommand):
    help = "Create mock Task rows with due dates within the next N days (default: 7)."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=10, help="How many tasks to create (default: 10)")
        parser.add_argument("--days", type=int, default=7, help="Due dates will be between now and now+days")
        parser.add_argument(
            "--source",
            type=str,
            default="manual",
            choices=["manual", "moodle"],
            help="Task source value (default: manual)",
        )
        parser.add_argument("--username", type=str, default=None, help="Assign tasks to this username")
        parser.add_argument("--user-id", type=int, default=None, help="Assign tasks to this user id")
        parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducible generation")
        parser.add_argument("--course", type=str, default="", help="Course name (used when source=moodle)")
        parser.add_argument(
            "--completed-rate",
            type=float,
            default=0.2,
            help="Fraction in [0,1] of tasks marked completed (default: 0.2)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        parsed = _Args(
            count=options["count"],
            days=options["days"],
            source=options["source"],
            username=options["username"],
            user_id=options["user_id"],
            seed=options["seed"],
            course=options["course"],
            completed_rate=options["completed_rate"],
        )

        if parsed.count <= 0:
            raise CommandError("--count must be > 0")
        if parsed.days <= 0:
            raise CommandError("--days must be > 0")
        if not (0.0 <= parsed.completed_rate <= 1.0):
            raise CommandError("--completed-rate must be between 0 and 1")

        rng = random.Random(parsed.seed)
        user = _pick_user(username=parsed.username, user_id=parsed.user_id)

        now = timezone.now()
        end = now + timezone.timedelta(days=parsed.days)

        tasks: list[Task] = []
        for _ in range(parsed.count):
            # Random datetime within [now, end]
            seconds = rng.randint(0, int((end - now).total_seconds()))
            due_date = now + timezone.timedelta(seconds=seconds)

            completed = rng.random() < parsed.completed_rate

            task = Task(
                user=user,
                title=_random_title(rng),
                description="Mock task generated for development/testing.",
                due_date=due_date,
                completed=completed,
                source=parsed.source,
                course=(parsed.course if parsed.source == "moodle" else ""),
                external_id=(f"mock-{rng.randint(100000, 999999)}" if parsed.source == "moodle" else None),
            )
            tasks.append(task)

        Task.objects.bulk_create(tasks)

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(tasks)} mock tasks for user '{user.username}' with due dates between {now.isoformat()} and {end.isoformat()}."
            )
        )

