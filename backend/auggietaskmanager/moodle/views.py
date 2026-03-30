from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from moodle.errors import *
from moodle.models import Task
from moodle.serializers import TaskSerializer
from moodle.utils import add_moodle_tasks, extract_calendar_data


@api_view(["GET"])
def api_root(request):
    # Moodle app API root. Add endpoints here as you build them.
    return Response({"moodle": "ok"})
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, source = 'manual')

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar_view(self, request):
        """Retrieve tasks for calendar display within a date range."""
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')

        queryset = self.get_queryset()

        # Validate and filter by date range if both start and end dates are provided
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

    @action(detail=False, methods=['post'], url_path='import_moodle_calendar')
    def import_moodle_calendar(self, request):
        """Import calendar events from Moodle and create tasks."""
        user_profile = request.user.userprofile
        moodle_url = request.data.get('moodle_url')

        # Validate that the Moodle URL is configured
        if not moodle_url:
            return Response(
                {
                    'error': 'Moodle calendar link is not set. Add it in your profile and try again.',
                    'error_code': 'MOODLE_URL_NOT_CONFIGURED',
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_profile.moodle_url != moodle_url:
            user_profile.moodle_url = moodle_url
            user_profile.save(update_fields=['moodle_url'])

        try:
            calendar_data = extract_calendar_data(moodle_url)
            tasks = add_moodle_tasks(calendar_data, request.user)

            serializer = self.get_serializer(tasks, many=True)
            return Response(
                {'message': f'Successfully imported {len(tasks)} tasks.', 'tasks': serializer.data},
                status=status.HTTP_201_CREATED
            )

        except MoodleCalendarInvalidUrlError as e:
            return Response(
                {'error': e.message, 'error_code': e.error_code, 'details': e.details},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except (MoodleCalendarInaccessibleError, MoodleCalendarParseError) as e:
            return Response(
                {'error': e.message, 'error_code': e.error_code, 'details': e.details},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except MoodleCalendarError as e:
            return Response(
                {'error': e.message, 'error_code': e.error_code, 'details': e.details},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                {
                    'error': 'Failed to import Moodle calendar due to an unexpected error.',
                    'error_code': 'MOODLE_CALENDAR_UNKNOWN_ERROR',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='filter')
    def filter_tasks(self, request):
        """Filter tasks based on query parameters."""
        queryset = self.get_queryset()
        status_param = request.query_params.get('status')
        priority_param = request.query_params.get('priority')
        source_param = request.query_params.get('source')

        # Validate source parameter
        allowed_sources = ['moodle', 'manual']
        if source_param and source_param not in allowed_sources:
            return Response(
                {'error': f'Invalid source. Allowed values: {", ".join(allowed_sources)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Apply filters based on query parameters
        if status_param:
            queryset = queryset.filter(status=status_param)
        if priority_param:
            queryset = queryset.filter(priority=priority_param)
        if source_param:
            queryset = queryset.filter(source=source_param)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
