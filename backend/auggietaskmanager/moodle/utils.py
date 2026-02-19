# Put all helper functions here
import requests


def extract_calendar_data():
    """Extracts the data from the calendar_url and puts into json format

    Args:
        calendar_url (String): moodle calendar url
    """
    calendar_url = "https://moodle.augsburg.edu/moodle2021/calendar/export_execute.php?userid=12513&authtoken=79c6051c6291eedd78af084112b043c2a57532cc&preset_what=all&preset_time=custom"
    response = requests.get(calendar_url)

    return response.text

