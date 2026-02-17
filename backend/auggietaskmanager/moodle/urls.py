from django.urls import path

from . import views

app_name = 'moodle'

urlpatterns = [
    path('', views.api_root),
]
