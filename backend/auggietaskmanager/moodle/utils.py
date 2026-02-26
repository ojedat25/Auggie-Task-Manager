# Put all helper functions here
from datetime import date, datetime
import requests
from icalendar import Calendar
import pytz

from django.utils.dateparse import parse_datetime
from .models import Task

def extract_calendar_data(calendar_url):
    """Extracts the data from the calendar_url and puts into json format

    Args:
        calendar_url (String): moodle calendar url
    Returns:
        Calendar: calendar object containing all the events in the calendar
    """
    central_tz = pytz.timezone("America/Chicago")

    # Fetch the iCal feed; raises if the URL is bad or request fails
    response = requests.get(calendar_url)
    response.raise_for_status()

    # Parse raw iCal text into a Calendar we can iterate over
    calendar = Calendar.from_ical(response.content)
    calendar_events = []

    for calendar_event in calendar.walk("vevent"):
        # Due date: use dtend (event end time); safe so we don't crash on missing/all-day events
        dtend = calendar_event.get("dtend")
        due_date_str = None
        if dtend and dtend.dt:
            dt = dtend.dt
            if isinstance(dt, datetime):
                due_date_str = dt.astimezone(central_tz).isoformat()
            else:
                due_date_str = dt.isoformat()

        # Course: read from categories; safe so we don't crash when categories are missing
        course = ""
        cats = calendar_event.get("categories")
        if cats and getattr(cats, "cats", None):
            course = str(cats.cats[0].to_ical().decode("utf-8"))[:15]

        # One dict per event; empty string when summary/description are missing
        calendar_events.append(
            {
                "title": str(calendar_event.get("summary") or ""),
                "description": str(calendar_event.get("description") or ""),
                "due_date": due_date_str,
                "course": course,
            }
        )

    return calendar_events