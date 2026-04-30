from django.urls import path

from . import views

app_name = "groups"

urlpatterns = [
    path("", views.StudyGroupListCreateView.as_view(), name="groups"),
    path("all/", views.get_all_groups, name="allGroups"),
    path("<int:groupID>/join/", views.join_study_group, name="joinGroup"),
    path("<int:groupID>/leave/", views.leave_study_group, name="leaveGroup"),
    path("<int:groupID>/update_group/", views.update_group, name="updateGroup"),
    path("<int:groupID>/update_image/", views.update_image, name="updateImage"),
    path("<int:groupID>/delete/", views.delete_study_group, name="deleteGroup"),
]
