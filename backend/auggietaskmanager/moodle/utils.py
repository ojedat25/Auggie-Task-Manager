# Put all helper functions here
import requests
from icalendar import Calendar
import pytz
from .errors import *
from .models import Task
from urllib.parse import urlparse


def validate_moodle_calendar_url(calendar_url: str) -> None:
    """Validate calendar URL format before making an outbound request.

    This helps catch common user errors (e.g., missing URL, pasting an HTML page instead of the .ics link)
    and provides more specific error messages without relying on request exceptions or HTTP status codes.

    Args:        calendar_url (str): The Moodle calendar URL to validate.
    Raises:        MoodleCalendarInvalidUrlError: If the URL is missing, not a string, or doesn't look like a valid HTTP/HTTPS URL.
    """
    if not calendar_url or not isinstance(calendar_url, str):
        raise MoodleCalendarInvalidUrlError(
            "Moodle calendar link is missing. Please add your Moodle calendar link in your profile."
        )

    parsed = urlparse(calendar_url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise MoodleCalendarInvalidUrlError(
            "Moodle calendar link must start with http:// or https://."
        )
    if not parsed.netloc:
        raise MoodleCalendarInvalidUrlError(
            "Moodle calendar link looks invalid. Please paste the full calendar link from Moodle."
        )


def _map_requests_error(exc: Exception) -> MoodleCalendarInaccessibleError:
    """Map requests exceptions to user-friendly MoodleCalendarInaccessibleError with specific messages.

    Args:
        exc (Exception): The original exception raised by the requests library.
    Returns:
        MoodleCalendarInaccessibleError: A more specific error with a user-friendly message and error code.
    """
    # Timeouts and connection issues
    if isinstance(exc, requests.exceptions.Timeout):
        return MoodleCalendarInaccessibleError(
            "Moodle calendar link timed out. Please try again later.",
            error_code="MOODLE_CALENDAR_TIMEOUT",
        )
    if isinstance(exc, requests.exceptions.ConnectionError):
        return MoodleCalendarInaccessibleError(
            "Couldn't reach Moodle. Check the link and your internet connection.",
            error_code="MOODLE_CALENDAR_CONNECTION_ERROR",
        )
    # Any other request-layer issue
    return MoodleCalendarInaccessibleError(
        "Couldn't fetch the Moodle calendar from the provided link.",
        error_code="MOODLE_CALENDAR_REQUEST_ERROR",
    )


def _map_http_status(status_code: int) -> MoodleCalendarInaccessibleError:
    """Map HTTP status codes to user-friendly MoodleCalendarInaccessibleError with specific messages.

    Args:
        status_code (int): The HTTP status code returned from the calendar URL request.
    Returns:
        MoodleCalendarInaccessibleError: A more specific error with a user-friendly message and error code based on the status code.
    """
    if status_code in {401, 403}:
        return MoodleCalendarInaccessibleError(
            "This Moodle calendar link isn't accessible. Make sure the link is public or includes a valid token.",
            error_code="MOODLE_CALENDAR_FORBIDDEN",
            details={"status_code": status_code},
        )
    if status_code == 404:
        return MoodleCalendarInaccessibleError(
            "Moodle calendar link wasn't found (404). Please re-copy the calendar link from Moodle.",
            error_code="MOODLE_CALENDAR_NOT_FOUND",
            details={"status_code": status_code},
        )
    if 400 <= status_code < 500:
        return MoodleCalendarInaccessibleError(
            "Moodle calendar link returned an error. Please check the link and try again.",
            error_code="MOODLE_CALENDAR_CLIENT_ERROR",
            details={"status_code": status_code},
        )
    return MoodleCalendarInaccessibleError(
        "Moodle is currently unavailable. Please try again later.",
        error_code="MOODLE_CALENDAR_SERVER_ERROR",
        details={"status_code": status_code},
    )


def extract_calendar_data(calendar_url):
    """Extracts the data from the calendar_url and puts into json format

    Args:
        calendar_url (String): moodle calendar url
    Returns:
        Calendar: calendar object containing all the events in the calendar
    """
    validate_moodle_calendar_url(calendar_url)

    central_tz = pytz.timezone("America/Chicago")

    try:
        # A small timeout prevents hanging requests when a link is inaccessible.
        response = requests.get(calendar_url, timeout=10)
    except requests.exceptions.RequestException as exc:
        raise _map_requests_error(exc) from exc

    # Some tests mock response objects without setting status_code.
    raw_status = getattr(response, "status_code", 200)
    try:
        status_code = int(raw_status)
    except Exception:
        status_code = 200

    if status_code >= 400:
        raise _map_http_status(status_code)

    try:
        calendar = Calendar.from_ical(response.content)
    except Exception as exc:
        # Usually means the link isn't an iCal feed (e.g., HTML login/404 body).
        raise MoodleCalendarParseError(
            "The link didn't return a valid calendar (.ics). Make sure you're using Moodle's iCalendar export link.",
            error_code="MOODLE_CALENDAR_INVALID_ICAL",
        ) from exc

    calendar_events = []
    for calendar_event in calendar.walk("vevent"):
        calendar_events.append(
            {
                "external_id": str(calendar_event.get("uid")),
                "title": str(calendar_event.get("summary")),
                "description": str(calendar_event.get("description")),
                "due_date": calendar_event.get("dtend")
                .dt.astimezone(central_tz)
                .isoformat(),  # Convert to Central Time
                "course": str(calendar_event.get("categories").cats[0].to_ical().decode("utf-8"))[:15],
            }
        )

    return calendar_events


def add_moodle_tasks(calendar_events, user):
    """adds the tasks to the database

    Args:
        calendar_events (List[Dict]): list of calendar events
    """
    # Add the tasks to the database in bulk
    created_tasks = Task.objects.bulk_create(
        [
            Task(
                user=user,
                external_id=calendar_event["external_id"],
                title=calendar_event["title"],
                description=calendar_event["description"],
                due_date=calendar_event["due_date"],
                course=calendar_event["course"],
                source="moodle",
            )
            for calendar_event in calendar_events
        ]
    )
    return created_tasks


def get_user_moodle_tasks(user_id):
    """gets the tasks for the user

    Args:
        user_id (int): user id
    Returns:
        List[Task]: list of moodle tasks
    """
    return Task.objects.filter(user_id=user_id, source="moodle")


def get_user_tasks(user_id):
    """get user manual tasks

    Args:
        user_id (int): user id
    Returns:
        List[Task]: list of manual tasks
    """
    return Task.objects.filter(user_id=user_id, source="manual")


def user_add_manual_task(manual_tasks):
    """adds a manual task to the database

    Args:
        user_id (int): user id
        title (str): task title
        description (str): task description
        due_date (datetime): task due date
    """
    for manual_task in manual_tasks:
        Task.objects.create(
            title=manual_task["title"],
            description=manual_task["description"],
            due_date=manual_task["due_date"],
            course=manual_task["course"],
            source="manual",
        )
