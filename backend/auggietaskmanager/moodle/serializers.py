from rest_framework import serializers

from .models import Task


# Serializer for Task model
class TaskSerializer(serializers.ModelSerializer):
    is_imported = serializers.SerializerMethodField()

    # Serializer method to determine if the task was imported from Moodle
    class Meta:
        # The TaskSerializer converts Task model instances to JSON format and vice versa.
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'course', 'semester',
                  'source', 'is_imported', 'completed', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    # Method to determine if the task was imported from Moodle
    def get_is_imported(self, obj):
        return obj.source == 'moodle'
