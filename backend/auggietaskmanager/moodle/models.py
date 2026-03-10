from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
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
    course = models.CharField(max_length=200, blank=True)
    external_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self): 
        return self.title


