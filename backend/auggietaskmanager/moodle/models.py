from django.contrib.auth.models import User
from django.db import models


# This model represents a course in Moodle that can be associated with tasks and study groups.
class Course(models.Model):
    # The unique identifier for the course, represented as a string (e.g., "CSC101"). This field serves as the primary key for the model.
    courseID = models.CharField(max_length=20, primary_key=True)

    # Name of the course, such as "Introduction to Computer Science". This field is required and has a maximum length of 200 characters.
    name = models.CharField(max_length=200)

    # A brief description of the course, which can be left blank. This field is optional and can contain a longer text description of the course content or objectives.
    description = models.TextField(blank=True)

    # The name of the professor teaching the course, which can also be left blank. This field is optional and has a maximum length of 100 characters.
    professor = models.CharField(max_length=100, blank=True)


class Task(models.Model):

    SEMESTERS = [
        ("Spring", "Spring"),
        ("Fall", "Fall"),
    ]
    # Which user owns this task
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Assignment info
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Dates
    due_date = models.DateTimeField(null=True, blank=True)

    # Task status
    completed = models.BooleanField(default=False)

    # Indicates where the task came from (manual entry or Moodle import)
    source = models.CharField(
        max_length=20,
        choices=[("manual", "Manual"), ("moodle", "Moodle")],
        default="moodle"
    )

    # Automatically records when the task was created in the database
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    semester = models.CharField(max_length=200, blank=True, choices=SEMESTERS)
    external_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return self.title


