from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import StudyGroup
from .serializers import StudyGroupSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def study_group_list(request):
    """
    GET: Returns all groups the authenticated user is a member of
    POST: Creates a new study group
    """

    # The study_group_list view handles both GET and POST requests for the StudyGroup model. It requires the user to be authenticated to access these endpoints.
    if request.method == 'GET':

        # When a GET request is made to this view, it retrieves all the study groups that the authenticated user is a member of using the related_name 'study_groups' defined in the StudyGroup model. It then serializes these groups using the StudyGroupSerializer and returns the serialized data in the response.
        groups = request.user.study_groups.all()

        # The many=True argument indicates that we are serializing a queryset (multiple instances) rather than a single instance.
        serializer = StudyGroupSerializer(groups, many = True)

        # The Response object is used to return the serialized data as an HTTP response. The data is typically returned in JSON format, which can be easily consumed by frontend applications or other clients.
        return Response(serializer.data)
    
    # When a POST request is made to this view, it attempts to create a new study group using the data provided in the request body. The StudyGroupSerializer is used to validate and deserialize the incoming data. If the data is valid, the serializer's save method is called to create a new StudyGroup instance, with the created_by field set to the authenticated user. The newly created group's data is then returned in the response with a status code of 201 (Created). If the data is invalid, the serializer's errors are returned in the response.
    elif request.method == 'POST':

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