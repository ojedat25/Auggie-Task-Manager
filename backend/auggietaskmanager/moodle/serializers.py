from rest_framework import serializers

from .models import Course, Task


class CourseSlugRelatedField(serializers.SlugRelatedField):
    """Resolve course strings to Course instances and create missing courses."""

    def to_internal_value(self, data):
        if data in [None, '']:
            return None

        try:
            return self.get_queryset().get(**{self.slug_field: data})
        except Course.DoesNotExist:
            return self.get_queryset().create(
                **{self.slug_field: data, 'name': data}
            )


# Serializer for Task model
class TaskSerializer(serializers.ModelSerializer):
    course = CourseSlugRelatedField(
        queryset=Course.objects.all(),
        slug_field='courseID',
        allow_null=True,
        required=False,
    )
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
