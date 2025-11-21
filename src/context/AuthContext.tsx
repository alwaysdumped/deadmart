import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
    sendOTP: (email: string, name: string) => Promise<void>;
    register: (userData: any, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token and fetch user on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('livemart_token');
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    if (response.success) {
                        setUser(response.user);
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    localStorage.removeItem('livemart_token');
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const sendOTP = async (email: string, name: string) => {
        try {
            const response = await authAPI.sendOTP(email, name);
            if (!response.success) {
                throw new Error(response.message);
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to send OTP');
        }
    };

    const register = async (userData: any, otp: string) => {
        try {
            const response = await authAPI.register({ ...userData, otp });
            if (response.success) {
                localStorage.setItem('livemart_token', response.token);
                setUser(response.user);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
        try {
            const response = await authAPI.login(email, password, role);
            if (response.success) {
                localStorage.setItem('livemart_token', response.token);
                setUser(response.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('livemart_token');
        localStorage.removeItem('livemart_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, sendOTP, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
