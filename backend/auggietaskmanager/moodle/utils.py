# Put all helper functions here
import requests
from icalendar import Calendar
import pytz


def extract_calendar_data(calendar_url):
    """Extracts the data from the calendar_url and puts into json format

    Args:
        calendar_url (String): moodle calendar url
    Returns:
        Calendar: calendar object containing all the events in the calendar
    """
    central_tz = pytz.timezone("America/Chicago")

    response = requests.get(calendar_url)

    # Replace tab-based folded lines with space-based folded lines

    calendar = Calendar.from_ical(response.content)
    calendar_events = []
    for calendar_event in calendar.walk("vevent"):
        calendar_events.append(
            {
                "title": str(calendar_event.get("summary")),
                "description": str(calendar_event.get("description")),
                "due_date": calendar_event.get("dtend").dt.astimezone(central_tz).isoformat(),  # Convert to Central Time
                "course": str(calendar_event.get("categories").cats[0].to_ical().decode("utf-8"))[:15],
            }
        )

    return calendar_events
