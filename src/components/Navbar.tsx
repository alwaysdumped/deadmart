import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, LogOut, Menu, X, Search, MapPin, User, Heart, ChevronDown, ShoppingBag } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { authAPI } from '../services/api';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { items } = useCartStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [newCity, setNewCity] = useState('');
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/?search=${searchQuery}&category=${category}`);
    };

    const handleUpdateLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCity.trim()) return;
        try {
            await authAPI.updateProfile({ location: { city: newCity } });
            // Ideally refresh user context, but for now just close modal
            // A full page reload or context refresh would be better
            window.location.reload();
        } catch (error) {
            console.error('Failed to update location', error);
        } finally {
            setIsLocationModalOpen(false);
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const isDeliveryPartner = user?.role === 'delivery_partner';

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-sans">
            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="bg-primary-600 p-2 rounded-xl group-hover:bg-primary-700 transition-colors">
                            <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">Live<span className="text-primary-600">MART</span></span>
                    </Link>

                    {/* Search Bar - Centered & Minimal (Hidden for Delivery Partner) */}
                    {!isDeliveryPartner && (
                        <div className="hidden md:flex flex-1 max-w-2xl">
                            <form onSubmit={handleSearch} className="w-full relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for products..."
                                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm transition-all"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-r-md focus:ring-0 focus:border-transparent cursor-pointer hover:text-primary-600"
                                    >
                                        <option>All</option>
                                        {PRODUCT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Location */}
                        <div
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 cursor-pointer transition-colors"
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="hidden lg:block max-w-[100px] truncate">{user?.location?.city || 'Set Location'}</span>
                        </div>

                        {/* Account Dropdown */}
                        <div className="group relative">
                            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="hidden lg:block">{user ? user.name.split(' ')[0] : 'Account'}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm text-gray-500">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        </div>
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">My Profile</Link>
                                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Dashboard</Link>
                                        {!isDeliveryPartner && (
                                            <>
                                                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">My Orders</Link>
                                                <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">Wishlist</Link>
                                            </>
                                        )}
                                        <div className="border-t border-gray-50 my-1"></div>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                                    </>
                                ) : (
                                    <div className="p-2">
                                        <Link to="/login" className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                                            Sign In
                                        </Link>
                                        <p className="text-xs text-center text-gray-500 mt-2">New customer? <Link to="/signup" className="text-primary-600 hover:underline">Start here.</Link></p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Wishlist & Cart (Hidden for Delivery Partner) */}
                        {!isDeliveryPartner && (
                            <>
                                <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 transition-colors relative">
                                    <Heart className="h-6 w-6" />
                                </Link>

                                <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors group">
                                    <div className="relative">
                                        <ShoppingCart className="h-6 w-6" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </>
                        )}

                        {user && !isDeliveryPartner && <NotificationCenter />}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && !isDeliveryPartner && (
                            <Link to="/cart" className="relative text-gray-600">
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-primary-600">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Minimal Categories Bar (Hidden for Delivery Partner) */}
            {!isDeliveryPartner && (
                <div className="border-t border-gray-100 bg-gray-50/50 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-8 py-3 text-sm font-medium text-gray-600">
                            {/* All Categories Dropdown - Fixed Position relative to this container, not scrolling */}
                            <div className="relative flex-shrink-0">
                                <button
                                    onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                    className="flex items-center gap-2 hover:text-primary-600 transition-colors whitespace-nowrap font-bold"
                                >
                                    <Menu className="h-4 w-4" />
                                    <span>All Categories</span>
                                </button>
                                {isCategoryMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                                        {PRODUCT_CATEGORIES.map((cat) => (
                                            <Link
                                                key={cat}
                                                to={`/?category=${cat}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                                                onClick={() => setIsCategoryMenuOpen(false)}
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Scrolling Categories List */}
                            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide flex-1">
                                {PRODUCT_CATEGORIES.slice(0, 6).map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/?category=${cat}`}
                                        className="hover:text-primary-600 transition-colors whitespace-nowrap"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Mobile Search */}
                        {!isDeliveryPartner && (
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            </form>
                        )}

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</h3>
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link to="/profile" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                                        <User className="h-5 w-5" /> My Profile
                                    </Link>
                                    <Link to="/dashboard" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                                        <User className="h-5 w-5" /> Dashboard
                                    </Link>
                                    {!isDeliveryPartner && (
                                        <>
                                            <Link to="/orders" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                                                <ShoppingBag className="h-5 w-5" /> My Orders
                                            </Link>
                                            <Link to="/wishlist" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                                                <Heart className="h-5 w-5" /> Wishlist
                                            </Link>
                                        </>
                                    )}
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl">
                                        <LogOut className="h-5 w-5" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="block w-full bg-primary-600 text-white text-center py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20" onClick={() => setIsMenuOpen(false)}>
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {!isDeliveryPartner && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h3>
                                {PRODUCT_CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/?category=${cat}`}
                                        className="block p-3 text-gray-700 hover:bg-gray-50 rounded-xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsLocationModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
                            <form onSubmit={handleUpdateLocation} className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Set Location</h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        placeholder="Enter your city"
                                        className="input-field"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary w-full">Update</button>
                                    <button type="button" onClick={() => setIsLocationModalOpen(false)} className="btn-secondary w-full">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
