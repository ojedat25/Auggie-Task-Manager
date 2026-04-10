# This file contains integration tests for the extract_calendar_data function in moodle.utils.

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytz
from icalendar import Calendar, Event
from moodle.models import Course
from moodle.utils import extract_calendar_data

from django.test import TestCase


class TestExtractCalendarDataIntegration(TestCase):
    """
    Integration tests for extract_calendar_data function
    """

    def setUp(self):
        """Set up test fixtures"""
        self.calendar_url = "https://moodle.example.com/calendar.ics"
        self.central_tz = pytz.timezone("America/Chicago")

    # ==================== INTEGRATION TESTS - REAL-WORLD SCENARIOS ====================

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_realistic_semester_calendar(self, mock_get):
        """
        Test extraction of a realistic semester calendar with multiple courses and deadlines

        Args: mock_get (MagicMock): Mock for requests.get to simulate calendar retrieval
        """
        # GIVEN: a calendar with events from multiple courses and deadlines
        cal = Calendar()
        cal.add("prodid", "-//University//Semester Calendar//EN")
        cal.add("version", "2.0")

        # WHEN: we add multiple course events to the calendar
        courses = [
            ("CS101", "Data Structures", "Assignment 1", "2026-03-20T23:59:59"),
            ("CS101", "Data Structures", "Midterm Exam", "2026-04-15T14:00:00"),
            ("MATH102", "Calculus II", "Problem Set 3", "2026-03-18T23:59:59"),
            ("PHYS201", "Physics II", "Lab Report", "2026-03-25T17:00:00"),
            ("ENGL110", "English Comp", "Essay Due", "2026-03-22T23:59:59"),
        ]

        for course_code, title, assignment, due_date in courses:
            event = Event()
            event.add("summary", f"{course_code}: {assignment}")
            event.add("description", f"{title} - {assignment}")
            event.add("categories", course_code)
            end_time = pytz.UTC.localize(datetime.fromisoformat(due_date)).astimezone(self.central_tz)
            event.add("dtend", end_time)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all events to be extracted correctly
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 5)

        # Verify all courses are represented
        courses_found = set()
        for event in result:
            self.assertIn(":", event["title"])  # Course code included
            self.assertIsNotNone(event["description"])
            self.assertIsNotNone(event["due_date"])
            courses_found.add(str(event["course"].courseID)[:3])  # First 3 chars of course code

        self.assertGreaterEqual(len(courses_found), 3)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_high_volume_events(self, mock_get):
        """
        Test extraction of calendar with many events (high volume)

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with many events (high volume)
        cal = Calendar()
        cal.add("prodid", "-//Test//High Volume Calendar//EN")
        cal.add("version", "2.0")

        # WHEN: we add 50 events to the calendar
        base_date = self.central_tz.localize(datetime(2026, 3, 15))
        for i in range(50):
            event = Event()
            event.add("summary", f"Event {i+1}")
            event.add("description", f"Description for event {i+1}")
            event.add("categories", f"COURSE{i % 10}")
            due_date = base_date + timedelta(days=i)
            event.add("dtend", due_date)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all 50 events to be extracted correctly
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 50)
        self.assertEqual(result[0]["title"], "Event 1")
        self.assertEqual(result[49]["title"], "Event 50")

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_mixed_timezone_events(self, mock_get):
        """
        Test extraction of events created in different timezones

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with events created in different timezones
        cal = Calendar()
        cal.add("prodid", "-//Test//Mixed Timezone//EN")
        cal.add("version", "2.0")

        # WHEN: we add events in different timezones
        timezones = [
            (pytz.UTC, "UTC Event", "2026-03-15T12:00:00"),
            (pytz.timezone("US/Eastern"), "Eastern Event", "2026-03-15T12:00:00"),
            (pytz.timezone("US/Pacific"), "Pacific Event", "2026-03-15T12:00:00"),
        ]

        for tz, title, _time_str in timezones:
            event = Event()
            event.add("summary", title)
            event.add("description", f"Event in {tz}")
            event.add("categories", "MULTI")
            time_obj = datetime(2026, 3, 15, 12, 0, 0, tzinfo=tz)
            event.add("dtend", time_obj)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all events to be converted to Central Time
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 3)
        for event_result in result:
            self.assertIn("2026-03-15", event_result["due_date"])
            # Should all be in central time format
            self.assertRegex(event_result["due_date"], r"2026-03-15T\d{2}:\d{2}:\d{2}")

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_special_characters_in_content(self, mock_get):
        """
        Test extraction of events with special characters

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with events containing special characters
        cal = Calendar()
        cal.add("prodid", "-//Test//Special Chars//EN")
        cal.add("version", "2.0")

        # WHEN: we add events with special characters
        special_content = [
            ("Assignment #1: Intro to Python", "Write & debug code"),
            ("Quiz: Chapter 3–5 (Multi-part)", "Cover all topics"),
            ("Project 50% + Report 50% = 100%", "Full evaluation"),
            ("Group Work: A&B Components", "Team effort required"),
        ]

        for title, desc in special_content:
            event = Event()
            event.add("summary", title)
            event.add("description", desc)
            event.add("categories", "CS101")
            end_time = datetime(2026, 3, 20, 23, 59, 59, tzinfo=self.central_tz)
            event.add("dtend", end_time)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all special characters to be preserved
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 4)
        titles = [event["title"] for event in result]
        self.assertTrue(any("#" in title for title in titles))
        self.assertTrue(any("–" in title for title in titles))  # Em dash
        self.assertTrue(any("%" in title for title in titles))
        self.assertTrue(any("&" in title for title in titles))  # A&B Components has &

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_very_long_descriptions(self, mock_get):
        """
        Test extraction of events with very long descriptions

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event with a very long description
        cal = Calendar()
        cal.add("prodid", "-//Test//Long Descriptions//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event with a long description
        long_description = "This is a very long description. " * 50  # ~1500 characters

        event = Event()
        event.add("summary", "Complex Assignment")
        event.add("description", long_description)
        event.add("categories", "CS101")
        end_time = datetime(2026, 3, 20, 23, 59, 59, tzinfo=self.central_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect the long description to be preserved
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "Complex Assignment")
        self.assertGreater(len(result[0]["description"]), 1000)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_near_deadline_clustering(self, mock_get):
        """
        Test extraction when multiple deadlines are close together

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with multiple events clustered on the same day
        cal = Calendar()
        cal.add("prodid", "-//Test//Clustered Deadlines//EN")
        cal.add("version", "2.0")

        # WHEN: we create events clustered on same day
        base_date = datetime(2026, 3, 20, tzinfo=self.central_tz)
        for i in range(5):
            event = Event()
            event.add("summary", f"Assignment {i+1}")
            event.add("description", f"Assignment {i+1} description")
            event.add("categories", f"COURSE{i}")
            # All due on same day but different times
            due_date = base_date.replace(hour=12+i)
            event.add("dtend", due_date)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all events to be extracted
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 5)
        # All should be on the same date
        for event_result in result:
            self.assertIn("2026-03-20", event_result["due_date"])

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_duplicate_event_handling(self, mock_get):
        """
        Test extraction when calendar contains duplicate/similar events

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with duplicate events
        cal = Calendar()
        cal.add("prodid", "-//Test//Duplicates//EN")
        cal.add("version", "2.0")

        # WHEN: we add duplicate events (same course, different times)
        for _ in range(3):
            event = Event()
            event.add("summary", "CS101: Lecture 5")
            event.add("description", "Introduction to Algorithms")
            event.add("categories", "CS101")
            end_time = datetime(2026, 3, 20, 23, 59, 59, tzinfo=self.central_tz)
            event.add("dtend", end_time)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all duplicate events to be extracted
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 3)
        for event_result in result:
            self.assertEqual(event_result["title"], "CS101: Lecture 5")

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_request_called_with_url(self, mock_get):
        """Test that requests.get is called with the correct URL"""
        # GIVEN: a calendar with no events
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # WHEN: we call extract_calendar_data
        extract_calendar_data(self.calendar_url)

        # THEN: requests.get should have been called with the correct URL
        mock_get.assert_called_once_with(self.calendar_url, timeout=10)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_output_structure_consistency(self, mock_get):
        """Test that all output events have consistent structure"""
        # GIVEN: a calendar with diverse events
        cal = Calendar()
        cal.add("prodid", "-//Test//Consistency//EN")
        cal.add("version", "2.0")

        # WHEN: we add 10 diverse events
        for i in range(10):
            event = Event()
            event.add("summary", f"Event {i}")
            event.add("description", f"Description {i}")
            event.add("categories", f"COURSE{i}")
            due_date = datetime(2026, 3, 15 + i, 12, 0, 0, tzinfo=self.central_tz)
            event.add("dtend", due_date)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and check structure consistency
        result = extract_calendar_data(self.calendar_url)

        # All output events should have consistent structure
        required_keys = {"external_id", "title", "description", "due_date", "course", "semester"}
        for event_result in result:
            self.assertEqual(set(event_result.keys()), required_keys)
            # Check types
            self.assertIsInstance(event_result["external_id"], str)
            self.assertIsInstance(event_result["title"], str)
            self.assertIsInstance(event_result["description"], str)
            self.assertIsInstance(event_result["due_date"], str)
            self.assertIsInstance(event_result["course"], Course)
            self.assertIsInstance(event_result["semester"], str)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_end_of_semester_crunch(self, mock_get):
        """
        Test extraction during end-of-semester with many concurrent deadlines

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        cal = Calendar()
        cal.add("prodid", "-//Test//End of Semester//EN")
        cal.add("version", "2.0")

        # WHEN: we simulate end of semester - many assignments in final week
        base_date = datetime(2026, 5, 10, tzinfo=self.central_tz)  # Last week of semester

        for course_num in range(5):
            for assignment_num in range(4):  # 4 assignments per course
                event = Event()
                event.add("summary", f"CS{100+course_num}: Final {assignment_num+1}")
                event.add("description", f"Final assignment {assignment_num+1}")
                event.add("categories", f"CS{100+course_num}")
                due_date = base_date + timedelta(days=assignment_num, hours=course_num)
                event.add("dtend", due_date)
                cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all events to be extracted
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 20)  # 5 courses × 4 assignments

        # Verify all events are in final week
        for event_result in result:
            self.assertIn("2026-05", event_result["due_date"])

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_different_date_formats_handling(self, mock_get):
        """
        Test extraction with events spanning across date boundaries

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with events spanning across date boundaries
        cal = Calendar()
        cal.add("prodid", "-//Test//Date Formats//EN")
        cal.add("version", "2.0")

        # WHEN: we create events across month boundaries
        dates = [
            datetime(2026, 2, 28, 23, 59, 59, tzinfo=self.central_tz),
            datetime(2026, 3, 1, 0, 0, 0, tzinfo=self.central_tz),
            datetime(2026, 3, 31, 23, 59, 59, tzinfo=self.central_tz),
            datetime(2026, 4, 1, 0, 0, 0, tzinfo=self.central_tz),
        ]

        for idx, date in enumerate(dates):
            event = Event()
            event.add("summary", f"Boundary Event {idx+1}")
            event.add("description", "Event on boundary")
            event.add("categories", "MULTI")
            event.add("dtend", date)
            cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect all events to be extracted
        result = extract_calendar_data(self.calendar_url)

        self.assertEqual(len(result), 4)
        self.assertIn("2026-02-28", result[0]["due_date"])
        self.assertIn("2026-03-01", result[1]["due_date"])
        self.assertIn("2026-03-31", result[2]["due_date"])
        self.assertIn("2026-04-01", result[3]["due_date"])
