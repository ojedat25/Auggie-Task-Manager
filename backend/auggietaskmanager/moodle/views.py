from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from moodle.models import Task
from moodle.serializers import TaskSerializer


@api_view(["GET"])
def api_root(request):
    # Moodle app API root. Add endpoints here as you build them.
    return Response({"moodle": "ok"})

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar_view(self, request):
        """Retrieve tasks for calendar display within a date range."""
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')

        queryset = self.get_queryset()

        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                queryset = queryset.filter(due_date__range=[start, end])
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use ISO 8601 format.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)