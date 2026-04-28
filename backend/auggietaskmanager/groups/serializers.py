from rest_framework import serializers

from django.contrib.auth.models import User

from .models import StudyGroup


# Serializer for StudyGroup model
class StudyGroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = StudyGroup
        fields = ['groupID','name', 'description', 'image', 'private', 'members', 'created_by', 'created_at']
        read_only_fields = ['groupID', 'created_by', 'created_at']
