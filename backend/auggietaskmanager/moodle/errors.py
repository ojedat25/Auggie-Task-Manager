"""
Defines custom exceptions for handling errors related to Moodle calendar imports.
"""

class MoodleCalendarError(Exception):
    """Base exception for Moodle calendar import errors."""

    error_code = "MOODLE_CALENDAR_ERROR"

    def __init__(self, message: str, *, error_code: str | None = None, details: dict | None = None):
        super().__init__(message)
        if error_code:
            self.error_code = error_code
        self.message = message
        self.details = details or {}


class MoodleCalendarInvalidUrlError(MoodleCalendarError):
    error_code = "MOODLE_CALENDAR_INVALID_URL"


class MoodleCalendarInaccessibleError(MoodleCalendarError):
    error_code = "MOODLE_CALENDAR_INACCESSIBLE"


class MoodleCalendarParseError(MoodleCalendarError):
    error_code = "MOODLE_CALENDAR_PARSE_ERROR"