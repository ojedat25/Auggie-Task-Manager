import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginData } from '../../../types/user';
import { AlertCard } from '../../../components/common/AlertCard';
import { LoginForm } from './LoginForm';
import { AuthService } from '../services/authService';

/**
 * Login Page Component
 *
 * This is the main login page that users see when they visit /login.
 * It handles the form state, submission, and navigation after login.
 *
 * Flow:
 * 1. User types credentials in the form
 * 2. User clicks "Log In" button
 * 3. API call is made to backend
 * 4. Success: Show success message, redirect to dashboard
 * 5. Error: Show error message
 */
export const Login = () => {
  // Get authentication functions and state from our custom hook
  const { logIn, error, message } = useAuth();

  // Form data state - stores what the user types in the input fields
  const initialFormData: LoginData = {
    identifier: '',
    password: '',
  };
  const [formData, setFormData] = useState<LoginData>(initialFormData);

  // Navigation hook - allows us to redirect to other pages
  const navigate = useNavigate();

  // Effect: Check if user is already logged in when page loads
  // If they have a token, skip login and go straight to dashboard
  useEffect(() => {
    if (AuthService.getToken()) {
      navigate('/'); //go to the the protected route
    }
  }, [navigate]);

  // Effect: When login succeeds (message appears), wait 1 second then redirect
  // This gives user time to see the success message before navigating
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => navigate('/'), 1000);
      return () => clearTimeout(timer); // Clean up timer if component unmounts
    }
  }, [message, navigate]);

  /**
   * Handle input field changes
   * Called whenever user types in username/email or password field
   * Updates the formData state with the new value
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle form submission
   * Called when user clicks "Log In" button or presses Enter
   * Makes API call to backend and handles success/error
   */
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault(); // Prevent browser from reloading the page
    await logIn(formData); // Call our auth hook's login function
    // The hook will set error/message state, which triggers re-render
    // AlertCard components below will show the messages
  };

  return (
    <>
      {/* Show success message if login succeeded */}
      {message && <AlertCard type="success" message={message} />}

      {/* Show error message if login failed */}
      {error && <AlertCard type="error" message={error} />}

      {/* Render the actual login form */}
      <LoginForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
    </>
  );
};

export default Login;