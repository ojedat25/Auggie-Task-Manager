from django.urls import path

from . import views

app_name = "groups"

urlpatterns = [
    path("groups/", views.StudyGroupListCreateView.as_view(), name="groups"),
    path("joinGroup/", views.join_study_group, name="joinGroup"),
    path("leaveGroup/", views.leave_study_group, name="leaveGroup"),
]