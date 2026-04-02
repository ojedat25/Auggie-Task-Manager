from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import StudyGroup
from .serializers import StudyGroupSerializer


class StudyGroupListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(request):
        """
        GET: Returns all groups the authenticated user is a member of
        """

        # When a GET request is made to this view, it retrieves all the study groups that the authenticated user is a member of using the related_name 'study_groups' defined in the StudyGroup model. It then serializes these groups using the StudyGroupSerializer and returns the serialized data in the response.
        groups = request.user.study_groups.all()

        # The many=True argument indicates that we are serializing a queryset (multiple instances) rather than a single instance.
        serializer = StudyGroupSerializer(groups, many = True)

        # The Response object is used to return the serialized data as an HTTP response. The data is typically returned in JSON format, which can be easily consumed by frontend applications or other clients.
        return Response(serializer.data)
        
    def post(request):
        """
        POST: Creates a new StudyGroup
        """

        # The data from the request is passed to the StudyGroupSerializer for validation and deserialization. The serializer checks if the provided data meets the requirements defined in the StudyGroup model (e.g., required fields, field types, etc.). If the data is valid, the save method is called to create a new StudyGroup instance. The created_by field is set to the authenticated user (request.user) to associate the new group with its creator. Finally, the serialized data of the newly created group is returned in the response with a status code of 201 (Created). If the data is invalid, the errors from the serializer are returned in the response.
        serializer = StudyGroupSerializer(data = request.data)

        # The is_valid() method checks if the data provided in the request meets the validation criteria defined in the StudyGroupSerializer. If the data is valid, it proceeds to save the new StudyGroup instance. If the data is invalid, it returns the errors encountered during validation in the response.
        if serializer.is_valid():

            # The save() method of the serializer is called to create a new StudyGroup instance based on the validated data. The created_by field is set to the authenticated user (request.user) to associate the new group with its creator. After saving the new group, the serialized data of the newly created group is returned in the response with a status code of 201 (Created).
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        # If the data provided in the request is invalid according to the validation rules defined in the StudyGroupSerializer, the errors encountered during validation are returned in the response. This allows the client to understand what went wrong with the data they submitted and make necessary corrections before trying again.
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
        group = StudyGroup.objects.get(id=groupID)
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
        group = StudyGroup.objects.get(id=groupID)
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
        group = StudyGroup.objects.get(id=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if group.created_by != request.user:
        return Response({"error" : "Only the creator of the group can update the group members."}, status = status.HTTP_403_FORBIDDEN)

    member_ids = request.data.get("members")
    if member_ids is not None:
        group.members.set(member_ids)
        group.save()

    return Response({"message": "Group members updated successfully."}, status = status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_private(request, groupID):
    """
    PATCH: updates the privacy setting of a study group. Only the creator of the group can update the privacy setting.
    """
    private = request.data.get("private")

    try:
        group = StudyGroup.objects.get(id=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if group.created_by != request.user:
        return Response({"error" : "Only the creator of the group can update the privacy setting."}, status = status.HTTP_403_FORBIDDEN)

    private = request.data.get("private")
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
        group = StudyGroup.objects.get(id=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)

    group.members.add(request.user)
    return Response({"message": "Joined study group successfully."}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_study_group(request, groupID):
    """
    POST: Removes the authenticated user from the specified study group
    """
    try:
        group = StudyGroup.objects.get(id=groupID)
    except StudyGroup.DoesNotExist:
        return Response({"error": "Study group not found."}, status=status.HTTP_404_NOT_FOUND)
    
    group.members.remove(request.user)
    return Response({"message": "Left study group successfully."}, status=status.HTTP_200_OK)