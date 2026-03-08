import { useState } from 'react';

import { AuthService } from '../services/authService';
import { SignupData } from '../../../types/user';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const signup = async (data: SignupData): Promise<{ message: string } | null> => {
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

  return { loading, error, message, signup };
};
