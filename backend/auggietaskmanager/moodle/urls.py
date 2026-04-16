from rest_framework.routers import DefaultRouter

from django.urls import include, path

from . import views

app_name = "moodle"

router = DefaultRouter()
router.register(r"", views.TaskViewSet, basename="task")

urlpatterns = [
    path("api/", views.api_root),
    path("", include(router.urls)),
]
