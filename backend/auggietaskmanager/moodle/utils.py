# Put all helper functions here
import requests
from icalendar import Calendar
import pytz
from .models import Task
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

def add_moodle_tasks(calendar_events):
    """adds the tasks to the database

    Args:
        calendar_events (List[Dict]): list of calendar events
    """
    for calendar_event in calendar_events:
        Task.objects.create(
            title=calendar_event["title"],
            description=calendar_event["description"],
            due_date=calendar_event["due_date"],
            course=calendar_event["course"],
        )
    
def get_user_moodle_tasks(user_id):
    """gets the tasks for the user

    Args:
        user_id (int): user id
    Returns:
        List[Task]: list of moodle tasks
    """
    return Task.objects.filter(user_id=user_id, source = "moodle")

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