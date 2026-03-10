from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from moodle.models import Task


class CalendarViewEndpointSystemTests(TestCase):
    """
    System tests for calendar view endpoint

    Tests the calendar view API endpoint as a complete system,
    verifying end-to-end functionality including authentication,
    request handling, and response formatting.
    """

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.client = APIClient()
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
        self.client.force_authenticate(user=self.user)

        # Create test tasks with timezone-aware datetimes
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Manual Task',
            description='User created task',
            due_date=now + timedelta(days=5),
            source='manual'
        )
        Task.objects.create(
            user=self.user,
            title='Moodle Task',
            description='Imported from Moodle',
            due_date=now + timedelta(days=10),
            source='moodle',
            course='CSC 101'
        )

    # ==================== HAPPY PATHS ====================

    def test_calendar_endpoint_returns_moodle_imports_with_identification(self):
        """
        Test that calendar endpoint returns Moodle imports with proper identification

        Verifies the complete flow from HTTP request to response with
        correct identification of Moodle imports.
        """
        # GIVEN: Authenticated user with mixed tasks
        now = timezone.now()
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()

        # WHEN: User requests calendar view
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Response is successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # AND: Moodle tasks have proper identification
        moodle_tasks = [t for t in response.data if t['source'] == 'moodle']
        self.assertEqual(len(moodle_tasks), 1)

        moodle_task = moodle_tasks[0]
        self.assertTrue(moodle_task['is_imported'])
        self.assertEqual(moodle_task['source'], 'moodle')
        self.assertEqual(moodle_task['course'], 'CSC 101')

        # AND: Manual tasks are distinguishable
        manual_tasks = [t for t in response.data if t['source'] == 'manual']
        self.assertEqual(len(manual_tasks), 1)
        self.assertFalse(manual_tasks[0]['is_imported'])

    def test_calendar_endpoint_date_range_filtering(self):
        """
        Test calendar endpoint filters by date range correctly

        Verifies that the endpoint properly filters tasks based on
        start and end date parameters.
        """
        # GIVEN: Tasks both inside and outside target range
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Past Task',
            due_date=now - timedelta(days=30),
            source='manual'
        )
        Task.objects.create(
            user=self.user,
            title='Far Future Task',
            due_date=now + timedelta(days=100),
            source='moodle',
            course='FUTURE 101'
        )

        # WHEN: User requests calendar for next 30 days
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Only tasks in range are returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only original 2 tasks

        task_titles = [t['title'] for t in response.data]
        self.assertNotIn('Past Task', task_titles)
        self.assertNotIn('Far Future Task', task_titles)

    def test_calendar_endpoint_without_date_range(self):
        """
        Test calendar endpoint without date parameters

        Verifies that endpoint returns all user tasks when no date range specified.
        """
        # GIVEN: User with tasks

        # WHEN: User requests calendar without date parameters
        response = self.client.get('/api/moodle/tasks/calendar/')

        # THEN: All user tasks are returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    # ==================== SAD PATHS ====================

    def test_calendar_endpoint_authentication_required(self):
        """
        Test that calendar endpoint requires authentication

        Verifies that unauthenticated requests are rejected.
        """
        # GIVEN: Unauthenticated client
        unauthenticated_client = APIClient()

        # WHEN: Unauthenticated request is made
        response = unauthenticated_client.get('/api/moodle/tasks/calendar/')

        # THEN: Request is rejected
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_calendar_endpoint_invalid_date_format(self):
        """
        Test calendar endpoint with invalid date format

        Verifies that endpoint validates date format and returns error.
        """
        # GIVEN: Invalid date parameters

        # WHEN: User provides invalid date format
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': 'invalid-date', 'end': 'also-invalid'}
        )

        # THEN: Bad request error is returned
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_calendar_endpoint_malformed_start_date(self):
        """
        Test calendar endpoint with malformed start date only

        Verifies error handling for invalid start date.
        """
        # GIVEN: Valid end but invalid start date
        now = timezone.now()

        # WHEN: User provides malformed start date
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': 'not-a-date', 'end': (now + timedelta(days=30)).isoformat()}
        )

        # THEN: Bad request error is returned
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_calendar_endpoint_malformed_end_date(self):
        """
        Test calendar endpoint with malformed end date only

        Verifies error handling for invalid end date.
        """
        # GIVEN: Valid start but invalid end date
        now = timezone.now()

        # WHEN: User provides malformed end date
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': now.isoformat(), 'end': 'not-a-date'}
        )

        # THEN: Bad request error is returned
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_calendar_endpoint_empty_result_set(self):
        """
        Test calendar endpoint with date range containing no tasks

        Verifies that endpoint handles empty results gracefully.
        """
        # GIVEN: Date range with no tasks
        now = timezone.now()
        start = (now + timedelta(days=365)).isoformat()
        end = (now + timedelta(days=400)).isoformat()

        # WHEN: User requests calendar for empty range
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Empty list is returned successfully
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
        self.assertIsInstance(response.data, list)

    def test_calendar_endpoint_user_isolation(self):
        """
        Test that calendar endpoint isolates user data

        Verifies that users only receive their own tasks.
        """
        # GIVEN: Two users with separate tasks
        other_user = User.objects.create_user('otheruser', 'other@example.com', 'password')
        now = timezone.now()
        Task.objects.create(
            user=other_user,
            title='Other User Task',
            due_date=now + timedelta(days=5),
            source='moodle',
            course='PRIVATE 101'
        )

        # WHEN: First user requests calendar
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Only first user's tasks are returned
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task_titles = [t['title'] for t in response.data]
        self.assertNotIn('Other User Task', task_titles)

    def test_calendar_endpoint_response_structure(self):
        """
        Test that calendar endpoint response has correct structure

        Verifies that all required fields are present in response.
        """
        # GIVEN: User with tasks
        now = timezone.now()
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()

        # WHEN: User requests calendar
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Response has correct structure
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

        required_fields = ['id', 'title', 'description', 'due_date', 'course',
                          'source', 'is_imported', 'completed', 'created_at', 'updated_at']

        for task in response.data:
            for field in required_fields:
                self.assertIn(field, task, f"Field '{field}' missing from response")

    def test_calendar_endpoint_multiple_moodle_courses(self):
        """
        Test calendar endpoint with multiple Moodle courses

        Verifies endpoint correctly handles tasks from multiple courses.
        """
        # GIVEN: Multiple Moodle courses
        now = timezone.now()
        courses = ['MATH 301', 'PHYS 201', 'ENG 101']

        for i, course in enumerate(courses):
            Task.objects.create(
                user=self.user,
                title=f'{course}: Assignment',
                due_date=now + timedelta(days=i+3),
                source='moodle',
                course=course
            )

        # WHEN: User requests calendar
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: All courses are represented
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        moodle_tasks = [t for t in response.data if t['source'] == 'moodle']
        self.assertEqual(len(moodle_tasks), 4)  # 1 from setUp + 3 new

        # AND: All have proper identification
        for task in moodle_tasks:
            self.assertTrue(task['is_imported'])
            self.assertIsNotNone(task['course'])

    def test_calendar_endpoint_completed_and_incomplete_tasks(self):
        """
        Test calendar endpoint includes both completed and incomplete tasks

        Verifies that completion status doesn't filter results.
        """
        # GIVEN: Mix of completed and incomplete tasks
        now = timezone.now()
        Task.objects.create(
            user=self.user,
            title='Completed Task',
            due_date=now + timedelta(days=2),
            source='moodle',
            course='DONE 101',
            completed=True
        )

        # WHEN: User requests calendar
        start = now.isoformat()
        end = (now + timedelta(days=30)).isoformat()
        response = self.client.get(
            '/api/moodle/tasks/calendar/',
            {'start': start, 'end': end}
        )

        # THEN: Both completed and incomplete tasks are included
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        completed_tasks = [t for t in response.data if t['completed']]
        incomplete_tasks = [t for t in response.data if not t['completed']]

        self.assertGreater(len(completed_tasks), 0)
        self.assertGreater(len(incomplete_tasks), 0)


class HealthEndpointSystemTests(TestCase):
    """
    System tests for health check endpoint

    Tests the health endpoint functionality.
    """

    def test_health_endpoint_accessible_without_authentication(self):
        """
        Test that health endpoint is accessible without authentication

        Verifies the health check endpoint is publicly accessible.
        """
        # GIVEN: Unauthenticated client
        client = APIClient()

        # WHEN: Client requests health endpoint
        response = client.get('/api/moodle/health/')

        # THEN: Health check returns OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})

    def test_health_endpoint_with_authentication(self):
        """
        Test that health endpoint works with authentication

        Verifies authenticated users can also access health endpoint.
        """
        # GIVEN: Authenticated client
        client = APIClient()
        user = User.objects.create_user('testuser', 'test@example.com', 'password')
        client.force_authenticate(user=user)

        # WHEN: Authenticated client requests health endpoint
        response = client.get('/api/moodle/health/')

        # THEN: Health check returns OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})

