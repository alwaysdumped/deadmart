import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShoppingBag, ArrowRight, User, Mail, Lock, AlertCircle, MapPin } from 'lucide-react';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer' as UserRole,
        address: '',
        city: ''
    });
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, sendOTP, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login flow
                const success = await login(formData.email, formData.password, formData.role);
                if (success) {
                    navigate('/dashboard');
                } else {
                    setError('Invalid credentials or role mismatch');
                }
            } else {
                // Registration flow
                if (!showOtp) {
                    // Step 1: Validate and send OTP
                    if (!formData.name || !formData.email || !formData.password || !formData.address || !formData.city) {
                        setError('All fields are required');
                        setLoading(false);
                        return;
                    }

                    if (formData.password.length < 6) {
                        setError('Password must be at least 6 characters');
                        setLoading(false);
                        return;
                    }

                    // Send OTP
                    await sendOTP(formData.email, formData.name);
                    setShowOtp(true);
                    setError('');
                    alert('OTP sent to your email! Check console if email is not configured.');
                } else {
                    // Step 2: Verify OTP and register
                    if (!otp || otp.length !== 6) {
                        setError('Please enter a valid 6-digit OTP');
                        setLoading(false);
                        return;
                    }

                    await register({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role,
                        location: {
                            address: formData.address,
                            city: formData.city,
                        }
                    }, otp);

                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setShowOtp(false);
        setOtp('');
        setError('');
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'customer',
            address: '',
            city: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block">
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center">
                            <ShoppingBag className="h-20 w-20 text-primary-600" />
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                            Live MART
                        </h1>
                        <p className="text-xl text-gray-600 max-w-md mx-auto">
                            Your complete online delivery system connecting wholesalers, retailers, and customers
                        </p>
                        <div className="flex justify-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span>Quality Products</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isLogin ? 'Welcome Back' : showOtp ? 'Verify OTP' : 'Create Account'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {isLogin
                                    ? 'Sign in to access your dashboard'
                                    : showOtp
                                        ? 'Enter the OTP sent to your email'
                                        : 'Join Live MART today'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {showOtp ? (
                                // OTP Input
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="input-field text-center text-2xl tracking-widest font-bold"
                                        placeholder="000000"
                                        required
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Didn't receive OTP? Check your email or console logs.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {!isLogin && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="input-field pl-10"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        {!isLogin && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Minimum 6 characters
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            I am a
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="retailer">Retailer</option>
                                            <option value="wholesaler">Wholesaler</option>
                                            <option value="delivery_partner">Delivery Partner</option>
                                        </select>
                                    </div>

                                    {!isLogin && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        className="input-field pl-10"
                                                        placeholder="123 Main Street"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="input-field"
                                                    placeholder="Delhi"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Sign In' : showOtp ? 'Verify & Register' : 'Send OTP'}</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>

                            {showOtp && (
                                <button
                                    type="button"
                                    onClick={() => setShowOtp(false)}
                                    className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    ← Back to registration
                                </button>
                            )}
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={toggleMode}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
