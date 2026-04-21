from rest_framework import status
from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth.models import User

from .models import StudyGroup
from .serializers import StudyGroupSerializer


class StudyGroupListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        """
        GET: Returns all groups the authenticated user is a member of
        """

        # When a GET request is made to this view, it retrieves all the study groups that the authenticated user is a member of using the related_name 'study_groups' defined in the StudyGroup model. It then serializes these groups using the StudyGroupSerializer and returns the serialized data in the response.
        groups = request.user.study_groups.all()

        # The many=True argument indicates that we are serializing a queryset (multiple instances) rather than a single instance.
        serializer = StudyGroupSerializer(groups, many = True)

        # The Response object is used to return the serialized data as an HTTP response. The data is typically returned in JSON format, which can be easily consumed by frontend applications or other clients.
        return Response(serializer.data)
        
    def post(self, request):
        
        
        serializer = StudyGroupSerializer(data=request.data)
        
        
        if serializer.is_valid():
            group = serializer.save(created_by=request.user)
            group.members.add(request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_groups(request):
    """
    GET: Returns all study groups in the system, public or private
    """
    groups = StudyGroup.objects.all()
    serializer = StudyGroupSerializer(groups, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_description(request, groupID):
    """
    PATCH: Updates the description of a study group. Only the creator of the group can update the description.
    """
    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if group.created_by != request.user:
        return Response({"error": "Only the creator of the group can update the description."}, status=status.HTTP_403_FORBIDDEN)
    
    group.description = request.data.get("description", group.description)
    group.save()
    return Response({"message": "Description updated successfully."}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_group_name(request, groupID):
    """
    PATCH: Updates the name of a study group. Only the creator of the group can update the name.
    """

    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.created_by != request.user:
        return Response({"error": "Only the creator of the group can update the group name."}, status=status.HTTP_403_FORBIDDEN)

    group.name = request.data.get("name",group.name)
    group.save()
    return Response({"message": "Group name updated successfully."}, status = status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_members(request, groupID):
    """
    PATCH: updates the members of a study group. Only the creator of the group can update the members.
    """

    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.created_by != request.user:
        return Response(
            {"error": "Only the creator of the group can update the group members."},
            status=status.HTTP_403_FORBIDDEN
        )

    member_ids = request.data.get("members")
    if not isinstance(member_ids, list):
        return Response({"error": "members must be a list of user IDs."}, status=status.HTTP_400_BAD_REQUEST)

    members = User.objects.filter(id__in=member_ids)
    if members.count() != len(member_ids):
        return Response({"error": "One or more users not found."}, status=status.HTTP_400_BAD_REQUEST)

    group.members.set(member_ids)

    return Response({"message": "Group members updated successfully."}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_private(request, groupID):
    """
    PATCH: updates the privacy setting of a study group. Only the creator of the group can update the privacy setting.
    """
    private = request.data.get("private")

    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if group.created_by != request.user:
        return Response({"error" : "Only the creator of the group can update the privacy setting."}, status = status.HTTP_403_FORBIDDEN)

    if private is  None:
        return Response({"error": "No privacy setting provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    if private not in [True, False]:
        return Response({"error": "Invalid privacy setting. Must be true or false."}, status=status.HTTP_400_BAD_REQUEST)
    
    
    group.private = private
    group.save()

    return Response({"message": "Group privacy updated successfully."}, status = status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_study_group(request, groupID):
    """
    POST: Adds the authenticated user to the specified study group
    """
    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.private:
        return Response({"error": "Cannot join private study group. You must be invited by the group creator."}, status=status.HTTP_403_FORBIDDEN)

    group.members.add(request.user)
    return Response({"message": "Joined study group successfully."}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_study_group(request, groupID):
    """
    POST: Removes the authenticated user from the specified study group
    """
    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    group.members.remove(request.user)
    return Response({"message": "Left study group successfully."}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_image(request, groupID):
    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.created_by != request.user:
        return Response({"error": "Only the creator can update the image."}, status=status.HTTP_403_FORBIDDEN)

    if 'image' not in request.FILES:
        return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

    group.image = request.FILES['image']
    group.save()
    return Response({"message": "Image updated successfully.", "image": group.image.url}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_study_group(request, groupID):
    try:
        group = StudyGroup.objects.get(groupID=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    if group.created_by != request.user:
        return Response({"error": "Only the creator can delete this group."}, status=status.HTTP_403_FORBIDDEN)

    group.delete()
    return Response({"message": "Study group deleted successfully."}, status=status.HTTP_200_OK)
