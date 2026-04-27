import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SignupData } from '../../../types/user';
import { AlertCard } from '../../../components/common/AlertCard';
import { SignUpForm } from './SignUpForm';
import { AuthService } from '../services/authService';
export const Signup = () => {
  const { signup, error, message, clearFeedback } = useAuth();

  const initialFormData: SignupData = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    schoolyear: '',
    major: '',
    minor: '',
  };
  const [formData, setFormData] = useState<SignupData>(initialFormData);

  const navigate = useNavigate();

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const result = await signup(formData);
    if (result?.message) {
      // Brief delay so the success AlertCard is visible before navigating
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  return (
    <>
      {message && (
        <AlertCard type="success" message={message} onDismiss={clearFeedback} />
      )}
      {error && (
        <AlertCard type="error" message={error} onDismiss={clearFeedback} />
      )}
      <SignUpForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </>
  );
};

export default Signup;
