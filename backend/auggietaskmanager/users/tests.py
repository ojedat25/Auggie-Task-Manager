
from .models import UserProfile
# Create your tests here.
class UserProfileModelTest(TestCase):
    def test_profile_created_with_user(self):
        user = User.objects.create_user(username="testuser", password="testpassword", email="testuser@test.com")
        profile = UserProfile.objects.create(user = user, schoolYear = "Sophomore", major = "CS", minor = "Math")
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.schoolYear, "Sophomore")
    
    def test_profile_str_return_username(self):
        user = User.objects.create_user(username = "jane", password = "pass", email = "j@ex.com")
        profile = UserProfile.objects.create(user = user)
        self.assertEqual(str(profile), "jane")
        
class UserSignUpViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse("users:signup")

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
        self.assertTrue(User.objects.filter(username = "newuser").exists())
        user = User.objects.get(username = "newuser")
        self.assertTrue(UserProfile.objects.filter(user = user).exists())
    
    def test_signup_fails_without_username(self):
        response = self.client.post(self.signup_url, {"password": "p", "email": "testuser@test.com"},
                                    format = "json",
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)
       