from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    # Each user has one profile, and each profile is linked to one user
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Year of study
    schoolYear = models.CharField(max_length=20, blank=True)

    # Majors can be stored as comma-separated values in a single field if a student has multiple majors.
    major = models.CharField(max_length=50, blank=True)

    # If a student has multiple minors, they can also be stored as comma-separated values in a single field.
    minor = models.CharField(max_length=50, blank=True)

    # A brief bio or description about the user
    bio = models.TextField(max_length = 250, blank=True)

    # Moodle calendar iCal URL (used for importing tasks)
    moodle_url = models.URLField(blank=True, default="")

    # The date and time when the profile was created, automatically set when the profile is first created.
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username
