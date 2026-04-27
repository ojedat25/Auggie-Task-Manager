import { useCallback, useState } from 'react';

import { AuthService } from '../services/authService';
import { SignupData, LoginData } from '../../../types/user';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const signup = async (
    data: SignupData
  ): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { message } = await AuthService.signup(data);
      setMessage(message);
      return { message };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (
    credentials: LoginData
  ): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await AuthService.logIn(credentials);
      const successMessage = 'Login successful!';
      setMessage(successMessage);
      return { message: successMessage };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  const logOut = async (): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { message } = await AuthService.logOut();
      setMessage(message);
      return { message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, message, signup, logIn, logOut, clearFeedback };
};
