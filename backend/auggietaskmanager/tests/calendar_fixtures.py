"""Shared helpers for calendar-related tests."""

from moodle.models import Course


def make_course(course_id: str, *, name: str | None = None) -> Course:
    """Return a Course row suitable for Task.course FK (course_id fits Course.courseID)."""
    obj, _ = Course.objects.get_or_create(
        courseID=course_id,
        defaults={
            "name": name or course_id,
            "description": "",
            "professor": "",
        },
    )
    return obj
