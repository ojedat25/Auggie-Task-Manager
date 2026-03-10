from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from moodle.models import Task
from moodle.serializers import TaskSerializer


class CalendarViewMoodleImportIntegrationTests(TestCase):
    """
    Integration tests for calendar view with Moodle imports

    Tests realistic scenarios of Moodle calendar imports being displayed
    in the calendar view with proper identification.
    """

    def setUp(self):
        """Set up test fixtures before each test method"""
        self.user = User.objects.create_user('testuser', 'test@example.com', 'password')
        now = timezone.now()

        # Simulate imported Moodle tasks
        self.moodle_tasks = []
        for i in range(3):
            task = Task.objects.create(
                user=self.user,
                title=f'CSC {100+i}: Assignment {i+1}',
                description=f'Complete assignment {i+1}',
                due_date=now + timedelta(days=(i+1)*3),
                source='moodle',
                course=f'CSC {100+i}',
                completed=False
            )
            self.moodle_tasks.append(task)

        # Simulate manual tasks
        self.manual_tasks = []
        for i in range(2):
            task = Task.objects.create(
                user=self.user,
                title=f'Personal Task {i+1}',
                description=f'User created task {i+1}',
                due_date=now + timedelta(days=(i+1)*2),
                source='manual',
                completed=False
            )
            self.manual_tasks.append(task)

    # ==================== HAPPY PATHS ====================

    def test_realistic_semester_calendar_with_mixed_tasks(self):
        """
        Test realistic semester calendar with both Moodle and manual tasks

        Verifies that a typical student's calendar with mixed task sources
        displays all tasks with proper identification.
        """
        # GIVEN: A semester calendar with Moodle imports and manual tasks

        # WHEN: All tasks are retrieved and serialized
        all_tasks = Task.objects.filter(user=self.user).order_by('due_date')
        serializer = TaskSerializer(all_tasks, many=True)
        data = serializer.data

        # THEN: All tasks are present with correct identification
        self.assertEqual(len(data), 5)  # 3 Moodle + 2 manual

        # AND: Moodle tasks are properly identified
        moodle_tasks = [t for t in data if t['source'] == 'moodle']
        self.assertEqual(len(moodle_tasks), 3)
        for task in moodle_tasks:
            self.assertTrue(task['is_imported'])
            self.assertIsNotNone(task['course'])
            self.assertTrue(len(task['course']) > 0)

        # AND: Manual tasks are distinguishable
        manual_tasks = [t for t in data if t['source'] == 'manual']
        self.assertEqual(len(manual_tasks), 2)
        for task in manual_tasks:
            self.assertFalse(task['is_imported'])

    def test_multiple_courses_from_moodle_import(self):
        """
        Test calendar with Moodle imports from multiple courses

        Verifies that tasks from different Moodle courses are all properly
        identified and course information is preserved.
        """
        # GIVEN: Moodle tasks from different courses
        now = timezone.now()
        courses = ['MATH 301', 'PHYS 201', 'ENG 101', 'HIST 150']

        for i, course in enumerate(courses):
            Task.objects.create(
                user=self.user,
                title=f'{course}: Homework',
                due_date=now + timedelta(days=i+10),
                source='moodle',
                course=course,
                completed=False
            )

        # WHEN: Moodle tasks are retrieved
        moodle_tasks = Task.objects.filter(user=self.user, source='moodle')
        serializer = TaskSerializer(moodle_tasks, many=True)
        data = serializer.data

        # THEN: All courses are represented
        courses_in_data = {t['course'] for t in data}
        self.assertEqual(len(courses_in_data), 7)  # 3 from setUp + 4 new

        # AND: Each task has proper identification
        for task in data:
            self.assertTrue(task['is_imported'])
            self.assertEqual(task['source'], 'moodle')
            self.assertIn(task['course'], ['CSC 100', 'CSC 101', 'CSC 102',
                                           'MATH 301', 'PHYS 201', 'ENG 101', 'HIST 150'])

    def test_end_of_semester_with_many_moodle_deadlines(self):
        """
        Test calendar during end of semester with many concurrent Moodle deadlines

        Verifies that the system handles high volume of Moodle imports correctly.
        """
        # GIVEN: End of semester with many Moodle deadlines
        now = timezone.now()
        base_date = now + timedelta(days=60)  # End of semester

        # Create 20 Moodle tasks in final week
        for i in range(20):
            Task.objects.create(
                user=self.user,
                title=f'Final Assignment {i+1}',
                due_date=base_date + timedelta(hours=i*6),
                source='moodle',
                course=f'COURSE{i % 5}',  # 5 different courses
                completed=False
            )

        # WHEN: Tasks are retrieved for final week
        start = base_date - timedelta(days=1)
        end = base_date + timedelta(days=7)
        tasks = Task.objects.filter(
            user=self.user,
            source='moodle',
            due_date__range=[start, end]
        )
        serializer = TaskSerializer(tasks, many=True)
        data = serializer.data

        # THEN: All Moodle tasks are properly identified
        self.assertEqual(len(data), 20)
        for task in data:
            self.assertTrue(task['is_imported'])
            self.assertEqual(task['source'], 'moodle')

    def test_completed_and_incomplete_moodle_tasks(self):
        """
        Test calendar with both completed and incomplete Moodle tasks

        Verifies that completion status doesn't affect Moodle identification.
        """
        # GIVEN: Mix of completed and incomplete Moodle tasks
        now = timezone.now()

        # Mark some tasks as completed
        Task.objects.filter(user=self.user, source='moodle').first().completed = True
        Task.objects.filter(user=self.user, source='moodle').first().save()

        # Add more completed Moodle task
        Task.objects.create(
            user=self.user,
            title='Completed Moodle Task',
            due_date=now - timedelta(days=5),
            source='moodle',
            course='OLD 101',
            completed=True
        )

        # WHEN: All Moodle tasks are retrieved
        moodle_tasks = Task.objects.filter(user=self.user, source='moodle')
        serializer = TaskSerializer(moodle_tasks, many=True)
        data = serializer.data

        # THEN: All have proper Moodle identification regardless of completion
        completed = [t for t in data if t['completed']]
        incomplete = [t for t in data if not t['completed']]

        self.assertGreater(len(completed), 0)
        self.assertGreater(len(incomplete), 0)

        # AND: All are identified as imports
        for task in data:
            self.assertTrue(task['is_imported'])

    def test_user_isolation_with_moodle_imports(self):
        """
        Test that Moodle imports are properly isolated between users

        Verifies that each user only sees their own Moodle imports.
        """
        # GIVEN: Two users with their own Moodle imports
        user2 = User.objects.create_user('user2', 'user2@example.com', 'password')
        now = timezone.now()

        # User2 has different Moodle tasks
        Task.objects.create(
            user=user2,
            title='User2 Moodle Task',
            due_date=now + timedelta(days=5),
            source='moodle',
            course='PRIVATE 101',
            completed=False
        )

        # WHEN: Each user retrieves their tasks
        user1_tasks = Task.objects.filter(user=self.user)
        user2_tasks = Task.objects.filter(user=user2)

        user1_serializer = TaskSerializer(user1_tasks, many=True)
        user2_serializer = TaskSerializer(user2_tasks, many=True)

        user1_data = user1_serializer.data
        user2_data = user2_serializer.data

        # THEN: Each user only sees their own tasks
        self.assertEqual(len(user1_data), 5)  # Original 5 tasks
        self.assertEqual(len(user2_data), 1)

        # AND: No cross-user data leakage
        user1_titles = [t['title'] for t in user1_data]
        user2_titles = [t['title'] for t in user2_data]

        self.assertNotIn('User2 Moodle Task', user1_titles)
        self.assertNotIn('CSC 100: Assignment 1', user2_titles)

    def test_moodle_tasks_with_long_descriptions(self):
        """
        Test Moodle tasks with lengthy descriptions

        Verifies that long descriptions from Moodle are handled correctly.
        """
        # GIVEN: Moodle task with long description
        now = timezone.now()
        long_description = "Complete the following:\n" + "\n".join([f"{i}. Task item {i}" for i in range(50)])

        task = Task.objects.create(
            user=self.user,
            title='CSC 301: Final Project',
            description=long_description,
            due_date=now + timedelta(days=30),
            source='moodle',
            course='CSC 301',
            completed=False
        )

        # WHEN: Task is serialized
        serializer = TaskSerializer(task)
        data = serializer.data

        # THEN: All data is preserved including long description
        self.assertTrue(data['is_imported'])
        self.assertEqual(data['source'], 'moodle')
        self.assertEqual(len(data['description']), len(long_description))

    def test_date_range_filtering_with_moodle_imports(self):
        """
        Test date range filtering with Moodle imports

        Verifies that date filtering works correctly for Moodle tasks.
        """
        # GIVEN: Moodle tasks spread across different time periods
        now = timezone.now()

        # Past Moodle task
        Task.objects.create(
            user=self.user,
            title='Past Moodle Task',
            due_date=now - timedelta(days=30),
            source='moodle',
            course='OLD 100',
            completed=True
        )

        # Far future Moodle task
        Task.objects.create(
            user=self.user,
            title='Far Future Moodle Task',
            due_date=now + timedelta(days=365),
            source='moodle',
            course='FUTURE 500',
            completed=False
        )

        # WHEN: Tasks are filtered for next 30 days
        start = now
        end = now + timedelta(days=30)
        tasks = Task.objects.filter(
            user=self.user,
            source='moodle',
            due_date__range=[start, end]
        )
        serializer = TaskSerializer(tasks, many=True)
        data = serializer.data

        # THEN: Only tasks in range are returned
        task_titles = [t['title'] for t in data]
        self.assertNotIn('Past Moodle Task', task_titles)
        self.assertNotIn('Far Future Moodle Task', task_titles)

        # AND: All returned tasks are Moodle imports
        for task in data:
            self.assertTrue(task['is_imported'])

