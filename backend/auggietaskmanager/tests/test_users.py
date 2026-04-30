from rest_framework.test import APIClient
from users.models import UserProfile

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


# Create your tests here.
class UserProfileModelTest(TestCase):
    def test_profile_created_with_user(self):
        user = User.objects.create_user(username="testuser", password="testpassword", email="testuser@test.com")
        profile = UserProfile.objects.create(user=user, schoolYear="Sophomore", major="CS", minor="Math")
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.schoolYear, "Sophomore")
    
    def test_profile_str_return_username(self):
        user = User.objects.create_user(username="jane", password="pass", email="j@ex.com")
        profile = UserProfile.objects.create(user=user)
        self.assertEqual(str(profile), "jane")

# API tests for signup endpoint
class UserSignUpViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse("users:signup")

    # Successful signup creates user and profile
    def test_signup_success_creates_user_and_profile(self):
        payload = {
            "username": "newuser",
            "password": "newpassword",
            "email": "newuser@test.com",
            "firstname": "New",
            "lastname": "User",
            "schoolyear": "Freshman",
            "major": "CS",
            "minor": "Math",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username="newuser")
        self.assertEqual(user.email, payload["email"])
        
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.schoolYear, payload["schoolyear"])
        self.assertEqual(profile.major, payload["major"])
        self.assertEqual(profile.minor, payload["minor"])
        
    # Signup should fail if username already exists
    def test_signup_fails_with_duplicate_username(self):
        User.objects.create_user(
            username="newuser",
            password="oldpass",
            email="old@test.com",
        )
        payload = {
            "username": "newuser",
            "password": "newpassword",
            "email": "newuser@test.com",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
    
    def test_signup_fails_without_username(self):
        response = self.client.post(self.signup_url, {"password": "p", "email": "testuser@test.com"},
                                    format="json",
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)
        
# API tests for login endpoint
class UserLoginViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("users:login")
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="testuser@test.com",
        )
    # Valid credentials return token and user data
    def test_login_success_returns_token_and_user(self):
        payload = {
            "username": "testuser",
            "password": "testpass123",
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("token", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], "testuser")
    
    # Invalid credentials return 401 error
    def test_login_fails_with_invalid_credentials(self):
        payload = {
            "username": "testuser",
            "password": "wrongpass",
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())
        
       
