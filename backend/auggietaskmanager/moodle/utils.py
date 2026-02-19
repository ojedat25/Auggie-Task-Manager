# Put all helper functions here
import requests
from icalendar import Calendar


def extract_calendar_data():
    """Extracts the data from the calendar_url and puts into json format

    Args:
        calendar_url (String): moodle calendar url
    Returns:
        Calendar: calendar object containing all the events in the calendar
    """
    calendar_url = "https://moodle.augsburg.edu/moodle2021/calendar/export_execute.php?userid=12513&authtoken=79c6051c6291eedd78af084112b043c2a57532cc&preset_what=all&preset_time=custom"

    response = requests.get(calendar_url)

    # Replace tab-based folded lines with space-based folded lines

    calendar = Calendar.from_ical(response.content)

    return calendar
