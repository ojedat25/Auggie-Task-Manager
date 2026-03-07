from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.models import User
from django.shortcuts import render

from .models import UserProfile

# Create your views here.


class UserSignUpView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        firstname = request.data.get("firstname")
        lastname = request.data.get("lastname")
        email = request.data.get("email")

        schoolyear = request.data.get("schoolyear")
        major = request.data.get("major", "")
        minor = request.data.get("minor", "")
        if not username or not password or not email:
            return Response({"error": "Username, password, and email are required."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=400)

        user = User.objects.create_user(
            username=username, password=password, email=email, first_name=firstname, last_name=lastname
        )
        UserProfile.objects.create(user=user, schoolYear=schoolyear, major=major, minor=minor)

        return Response({"message": "User created successfully."}, status=201)
