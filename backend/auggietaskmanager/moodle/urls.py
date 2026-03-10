from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

app_name = "moodle"

router = DefaultRouter()
router.register(r"tasks", views.TaskViewSet, basename="task")

urlpatterns = [
    path("", views.api_root),
    path("health/", views.health, name="health"),
    path("", include(router.urls)),
]
