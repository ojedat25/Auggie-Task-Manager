import { useState, useEffect } from 'react';

import { AuthService } from '../services/authService';
import { SignupData, UserProfile } from '../../../types/user';




export const useAuth = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const signup = async (data: SignupData) => {
        setLoading(true);
        setError(null);
        try {
            const { message } = await AuthService.signup(data);
            setMessage(message);
            setLoading(false);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return { user, loading, error, message, signup };
} 





