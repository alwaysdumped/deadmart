import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPage from './pages/Auth';
import ErrorBoundary from './components/ErrorBoundary';

import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import RetailerDashboard from './pages/dashboards/RetailerDashboard';
import WholesalerDashboard from './pages/dashboards/WholesalerDashboard';
import DeliveryDashboard from './pages/dashboards/DeliveryDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import AddProduct from './pages/AddProduct';

const DashboardRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    if (user.role === 'customer') return <CustomerDashboard />;
    if (user.role === 'retailer') return <RetailerDashboard />;
    if (user.role === 'wholesaler') return <WholesalerDashboard />;
    if (user.role === 'delivery_partner') return <DeliveryDashboard />;

    return <div>Unknown Role: {user.role}</div>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ErrorBoundary>
                    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                        <Navbar />
                        <main className="flex-grow pt-16">
                            <Routes>
                                <Route path="/login" element={<AuthPage />} />
                                <Route path="/dashboard" element={<DashboardRouter />} />
                                <Route path="/delivery-dashboard" element={
                                    <ProtectedRoute>
                                        <DeliveryDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/cart" element={
                                    <ProtectedRoute>
                                        <Cart />
                                    </ProtectedRoute>
                                } />
                                <Route path="/checkout" element={
                                    <ProtectedRoute>
                                        <Checkout />
                                    </ProtectedRoute>
                                } />
                                <Route path="/orders" element={
                                    <ProtectedRoute>
                                        <Orders />
                                    </ProtectedRoute>
                                } />
                                <Route path="/product/:id" element={
                                    <ProtectedRoute>
                                        <ProductDetail />
                                    </ProtectedRoute>
                                } />
                            </Router>
                        </AuthProvider>
                        );
}

                        export default App;
