from django.contrib.auth.models import User
from django.db import models


class StudyGroup(models.Model):
    groupID = models.AutoField(primary_key=True)
    
    name = models.CharField(max_length=100)

    description = models.TextField(max_length=500, blank=True)

    image = models.ImageField(upload_to='study_groups/', blank=True, null=True)

    private = models.BooleanField(default=False)

    members = models.ManyToManyField(User, related_name='study_groups')

    related_course = models.ManyToManyField('moodle.Course', related_name='study_groups')

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')

    created_at = models.DateTimeField(auto_now_add=True)

