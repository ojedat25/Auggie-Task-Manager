from datetime import datetime, timedelta
from unittest.mock import patch

import pytz
from moodle.models import Task
from moodle.serializers import TaskSerializer
from tests.calendar_fixtures import make_course

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone


class CalendarViewSerializerUnitTests(TestCase):
    """
    Unit tests for TaskSerializer with focus on is_imported field

    Tests the serializer logic in isolation to ensure Moodle imports
    are correctly identified through the is_imported computed field.
    """

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
        now = timezone.now()

        self.manual_task = Task.objects.create(
            user=self.user,
            title='Manual Task',
            description='User created task',
            due_date=now + timedelta(days=5),
            source='manual',
            completed=False
        )

        self.moodle_task = Task.objects.create(
            user=self.user,
            title='Moodle Task',
            description='Imported from Moodle',
            due_date=now + timedelta(days=10),
            source='moodle',
            course=make_course('CSC101'),
            completed=False
        )

    # ==================== HAPPY PATHS ====================

    def test_serializer_is_imported_field_for_moodle_task(self):
        """
        Test that is_imported field is True for Moodle tasks

        Verifies the computed field correctly identifies Moodle imports.
        """
        # GIVEN: A Moodle task

        # WHEN: Task is serialized
        serializer = TaskSerializer(self.moodle_task)
        data = serializer.data

        # THEN: is_imported field is True
        self.assertTrue(data['is_imported'])
        self.assertEqual(data['source'], 'moodle')
        self.assertEqual(data['course'], 'CSC101')

    def test_serializer_is_imported_field_for_manual_task(self):
        """
        Test that is_imported field is False for manual tasks

        Verifies the computed field correctly identifies manual tasks.
        """
        # GIVEN: A manual task

        # WHEN: Task is serialized
        serializer = TaskSerializer(self.manual_task)
        data = serializer.data

        # THEN: is_imported field is False
        self.assertFalse(data['is_imported'])
        self.assertEqual(data['source'], 'manual')

    def test_serializer_includes_all_required_fields(self):
        """
        Test that serializer includes all required fields

        Verifies that the serializer output contains all expected fields
        for client consumption.
        """
        # GIVEN: A task with all fields populated

        # WHEN: Task is serialized
        serializer = TaskSerializer(self.moodle_task)
        data = serializer.data

        # THEN: All required fields are present
        required_fields = ['id', 'title', 'description', 'due_date', 'course', 'semester',
                          'source', 'is_imported', 'completed', 'created_at', 'updated_at']
        for field in required_fields:
            self.assertIn(field, data)

    def test_serializer_multiple_tasks_with_mixed_sources(self):
        """
        Test serializer with multiple tasks of different sources

        Verifies that is_imported field is correctly computed for each task
        in a queryset.
        """
        # GIVEN: Multiple tasks with different sources
        tasks = Task.objects.filter(user=self.user).order_by('id')

        # WHEN: Tasks are serialized
        serializer = TaskSerializer(tasks, many=True)
        data = serializer.data

        # THEN: Each task has correct is_imported value
        self.assertEqual(len(data), 2)

        manual_tasks = [t for t in data if t['source'] == 'manual']
        moodle_tasks = [t for t in data if t['source'] == 'moodle']

        self.assertEqual(len(manual_tasks), 1)
        self.assertEqual(len(moodle_tasks), 1)

        self.assertFalse(manual_tasks[0]['is_imported'])
        self.assertTrue(moodle_tasks[0]['is_imported'])

    def test_serializer_creates_course_for_new_manual_course(self):
        """
        Test that a manual task can be created with a new course string.

        Verifies that the serializer will create the Course record if it does not exist.
        """
        # GIVEN: A new course value that is not already in the Course table
        now = timezone.now()
        payload = {
            'title': 'New manual course task',
            'description': 'Task with a course that was not imported',
            'due_date': now,
            'source': 'manual',
            'completed': False,
            'course': 'NEWCOURSE101',
        }

        serializer = TaskSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        task = serializer.save(user=self.user)

        self.assertEqual(task.course.courseID, 'NEWCOURSE101')
        self.assertEqual(task.course.name, 'NEWCOURSE101')
        self.assertEqual(task.source, 'manual')

    def test_serializer_updates_task_with_new_manual_course(self):
        """
        Test that updating a task with a new course string works.

        Verifies that the serializer will create the Course record when updating an existing task.
        """
        task = Task.objects.create(
            user=self.user,
            title='Manual Task Without Course',
            description='A task that starts without a course',
            due_date=timezone.now() + timedelta(days=1),
            source='manual',
            completed=False,
        )

        serializer = TaskSerializer(task, data={'course': 'NEWCOURSE202'}, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_task = serializer.save()

        self.assertEqual(updated_task.course.courseID, 'NEWCOURSE202')
        self.assertEqual(updated_task.course.name, 'NEWCOURSE202')


class CalendarViewModelUnitTests(TestCase):
    """
    Unit tests for Task model

    Tests the Task model's fields and behavior in isolation.
    """

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')

    # ==================== HAPPY PATHS ====================

    def test_task_creation_with_moodle_source(self):
        """
        Test creating a task with Moodle source

        Verifies that Moodle tasks can be created with all required fields.
        """
        # GIVEN: Task data with Moodle source
        now = timezone.now()

        # WHEN: Task is created
        task = Task.objects.create(
            user=self.user,
            title='CSC 101: Assignment 1',
            description='Complete homework',
            due_date=now + timedelta(days=7),
            source='moodle',
            course=make_course('CSC101'),
            completed=False
        )

        # THEN: Task is created with correct fields
        self.assertEqual(task.source, 'moodle')
        self.assertEqual(task.course.courseID, 'CSC101')
        self.assertFalse(task.completed)
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

    def test_task_creation_with_manual_source(self):
        """
        Test creating a task with manual source

        Verifies that manual tasks can be created.
        """
        # GIVEN: Task data with manual source
        now = timezone.now()

        # WHEN: Task is created
        task = Task.objects.create(
            user=self.user,
            title='Personal Task',
            description='Buy groceries',
            due_date=now + timedelta(days=2),
            source='manual',
            completed=False
        )

        # THEN: Task is created with correct source
        self.assertEqual(task.source, 'manual')
        self.assertIsNone(task.course)

    def test_task_default_source_is_moodle(self):
        """
        Test that default source is moodle

        Verifies the model default value for source field.
        """
        # GIVEN: Task created without explicit source
        now = timezone.now()

        # WHEN: Task is created
        task = Task.objects.create(
            user=self.user,
            title='Default Source Task',
            due_date=now + timedelta(days=5)
        )

        # THEN: Source defaults to moodle
        self.assertEqual(task.source, 'moodle')

    def test_task_ordering_by_due_date(self):
        """
        Test that tasks are ordered by due_date

        Verifies the model Meta ordering configuration.
        """
        # GIVEN: Multiple tasks with different due dates
        now = timezone.now()
        task1 = Task.objects.create(
            user=self.user,
            title='Task 1',
            due_date=now + timedelta(days=10),
            source='manual'
        )
        task2 = Task.objects.create(
            user=self.user,
            title='Task 2',
            due_date=now + timedelta(days=5),
            source='moodle',
            course=make_course('CSC101')
        )
        task3 = Task.objects.create(
            user=self.user,
            title='Task 3',
            due_date=now + timedelta(days=15),
            source='manual'
        )

        # WHEN: Tasks are retrieved
        tasks = list(Task.objects.filter(user=self.user))

        # THEN: Tasks are ordered by due_date
        self.assertEqual(tasks[0].id, task2.id)  # Due in 5 days
        self.assertEqual(tasks[1].id, task1.id)  # Due in 10 days
        self.assertEqual(tasks[2].id, task3.id)  # Due in 15 days

    @patch('django.utils.timezone.now')
    def test_task_timestamps_auto_update(self, mock_now):
        """
        Test that created_at and updated_at timestamps work correctly

        Verifies auto_now_add and auto_now functionality.

        Args:
            mock_now (MagicMock): Mocked timezone.now function
        """
        # GIVEN: A specific timestamp
        fixed_time = datetime(2026, 3, 10, 12, 0, 0, tzinfo=pytz.UTC)
        mock_now.return_value = fixed_time

        # WHEN: Task is created
        task = Task.objects.create(
            user=self.user,
            title='Timestamp Test',
            due_date=fixed_time + timedelta(days=5),
            source='manual'
        )

        # THEN: Timestamps are set
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)


class CalendarViewQuerysetUnitTests(TestCase):
    """
    Unit tests for Task queryset filtering

    Tests the filtering and querying logic for tasks.
    """

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.user1 = User.objects.create_user('user1', 'user1@example.com', 'password')
        self.user2 = User.objects.create_user('user2', 'user2@example.com', 'password')

        now = timezone.now()

        # Create tasks for user1
        Task.objects.create(
            user=self.user1,
            title='User1 Manual Task',
            due_date=now + timedelta(days=5),
            source='manual'
        )
        Task.objects.create(
            user=self.user1,
            title='User1 Moodle Task',
            due_date=now + timedelta(days=10),
            source='moodle',
            course=make_course('CSC101')
        )

        # Create tasks for user2
        Task.objects.create(
            user=self.user2,
            title='User2 Task',
            due_date=now + timedelta(days=5),
            source='moodle',
            course=make_course('MATH201')
        )

    # ==================== HAPPY PATHS ====================

    def test_filter_tasks_by_user(self):
        """
        Test filtering tasks by user

        Verifies that user isolation works at the queryset level.
        """
        # GIVEN: Multiple users with tasks

        # WHEN: Tasks are filtered by user
        user1_tasks = Task.objects.filter(user=self.user1)
        user2_tasks = Task.objects.filter(user=self.user2)

        # THEN: Each user's tasks are isolated
        self.assertEqual(user1_tasks.count(), 2)
        self.assertEqual(user2_tasks.count(), 1)

    def test_filter_tasks_by_source(self):
        """
        Test filtering tasks by source

        Verifies that tasks can be filtered by source type.
        """
        # GIVEN: Tasks with different sources

        # WHEN: Tasks are filtered by source
        moodle_tasks = Task.objects.filter(source='moodle')
        manual_tasks = Task.objects.filter(source='manual')

        # THEN: Tasks are correctly filtered
        self.assertEqual(moodle_tasks.count(), 2)
        self.assertEqual(manual_tasks.count(), 1)

    def test_filter_tasks_by_date_range(self):
        """
        Test filtering tasks by date range

        Verifies that date range filtering works correctly.
        """
        # GIVEN: Tasks with different due dates
        now = timezone.now()
        start = now
        end = now + timedelta(days=7)

        # WHEN: Tasks are filtered by date range
        tasks_in_range = Task.objects.filter(due_date__range=[start, end])

        # THEN: Only tasks in range are returned
        self.assertEqual(tasks_in_range.count(), 2)  # Both 5-day tasks

    def test_filter_moodle_tasks_for_specific_user(self):
        """
        Test filtering Moodle tasks for a specific user

        Verifies combining multiple filters.
        """
        # GIVEN: Multiple users with mixed task types

        # WHEN: Moodle tasks are filtered for user1
        user1_moodle_tasks = Task.objects.filter(user=self.user1, source='moodle')

        # THEN: Only user1's Moodle tasks are returned
        self.assertEqual(user1_moodle_tasks.count(), 1)
        task = user1_moodle_tasks.first()
        self.assertEqual(task.title, 'User1 Moodle Task')
        self.assertEqual(task.course.courseID, 'CSC101')



