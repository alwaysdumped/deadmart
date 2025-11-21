import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AddressManager from '../components/AddressManager';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { User, MapPin, CreditCard, Shield, Save } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'payment' | 'security'>('info');
    const [name, setName] = useState(user?.name || '');
    const [location, setLocation] = useState(user?.location?.city || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const response = await authAPI.updateProfile({
                name,
                location: { city: location }
            });
            if (response.success) {
                // Update local user context if possible, or just show success
                // Ideally AuthContext should expose a way to update user without full login
                // For now, we rely on the fact that the backend updated it.
                // A page refresh would fetch fresh data.
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        // Note: We need an endpoint for changing password while logged in.
        // The current reset-password is for OTP flow.
        // For MVP, we might skip "Change Password" if not explicitly requested,
        // but the user asked for "allow for password resets through otps".
        // I'll implement the OTP flow in ForgotPassword.tsx.
        // For this tab, I'll leave a placeholder or implement a simple update if backend supports it.
        // Since I didn't add a specific "change-password" endpoint in auth.js for logged-in users,
        // I will omit the actual API call here for now or use the reset flow if they logout.
        // Actually, let's just show a message that they can reset via logout -> forgot password for now
        // to keep it simple and focused on the requested "password resets through otps".
        setMessage({ type: 'error', text: 'To change password, please logout and use "Forgot Password"' });
    };

    if (!user) return <div>Please log in</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-primary-50 border-b border-primary-100">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                    {user.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>
                        <nav className="p-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'info' ? 'bg-gray-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <User className="h-5 w-5" /> Personal Info
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-gray-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <MapPin className="h-5 w-5" /> Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'payment' ? 'bg-gray-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <CreditCard className="h-5 w-5" /> Payment Methods
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-gray-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Shield className="h-5 w-5" /> Security
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                                <form onSubmit={handleUpdateProfile} className="max-w-lg space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City / Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g. Mumbai"
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Addresses</h2>
                                <AddressManager />
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                                <PaymentMethodSelector />
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                                <div className="max-w-lg">
                                    <p className="text-gray-600 mb-4">
                                        To reset your password, please log out and use the "Forgot Password" link on the login page.
                                        This ensures secure verification via OTP.
                                    </p>
                                    {/* Placeholder for future in-app password change */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
