import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-2 rounded-lg">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Live MART</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Connecting local farmers, retailers, and wholesalers directly to you. Fresh produce, fair prices, and fast delivery.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">All Products</Link></li>
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Fresh Vegetables</Link></li>
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Organic Fruits</Link></li>
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">New Arrivals</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Help Center</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Safety Information</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Cancellation Options</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">Report a Complaint</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-500 text-sm">
                                <MapPin className="h-5 w-5 text-primary-600 shrink-0" />
                                <span>123 Market Street, Green Valley, New Delhi, India</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 text-sm">
                                <Phone className="h-5 w-5 text-primary-600 shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 text-sm">
                                <Mail className="h-5 w-5 text-primary-600 shrink-0" />
                                <span>support@livemart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Live MART. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                        <a href="#" className="hover:text-gray-600">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
