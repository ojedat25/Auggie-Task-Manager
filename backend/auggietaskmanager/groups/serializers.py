from rest_framework import serializers
from .models import StudyGroup

# Serializer for StudyGroup model
class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        # The StudyGroupSerializer converts StudyGroup model instances to JSON format and vice versa.
        model = StudyGroup
        # The fields attribute specifies which fields of the StudyGroup model should be included in the serialized output.
        fields = ['id', 'name', 'description', 'members', 'created_by', 'created_at']
    