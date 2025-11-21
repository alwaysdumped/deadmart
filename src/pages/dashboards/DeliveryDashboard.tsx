import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, Clock, CheckCircle } from 'lucide-react';

const DeliveryDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const [available, mine] = await Promise.all([
                ordersAPI.getAvailableOrders(),
                ordersAPI.getMyOrders()
            ]);

            if (available.success) setAvailableOrders(available.orders);
            if (mine.success) {
                const activeOrders = mine.orders.filter((o: Order) =>
                    o.status === 'out_for_delivery' &&
                    ((o.deliveryPartnerId as any)?._id === user?.id || o.deliveryPartnerId === user?.id)
                );
                const historyOrders = mine.orders.filter((o: Order) =>
                    o.status === 'delivered' &&
                    ((o.deliveryPartnerId as any)?._id === user?.id || o.deliveryPartnerId === user?.id)
                );
                setMyOrders(activeOrders.concat(historyOrders));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            const response = await ordersAPI.updateOrderStatus(orderId, 'out_for_delivery', 'Delivery partner accepted');
            if (response.success) {
                alert('Order accepted! You can now deliver it.');
                fetchOrders();
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Failed to accept order');
        }
    };

    const handleMarkDelivered = async (orderId: string) => {
        try {
            const response = await ordersAPI.updateOrderStatus(orderId, 'delivered', 'Order delivered successfully');
            if (response.success) {
                alert('Order marked as delivered!');
                fetchOrders();
            }
        } catch (error) {
            console.error('Error marking delivered:', error);
            alert('Failed to mark as delivered');
        }
    };

    const activeOrders = myOrders.filter(o => o.status === 'out_for_delivery');
    const historyOrders = myOrders.filter(o => o.status === 'delivered');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Delivery Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your deliveries</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                        <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Available</p>
                        <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{historyOrders.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                {['available', 'active', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-2 text-sm font-medium whitespace-nowrap transition-colors capitalize ${activeTab === tab
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'available' && (
                    <>
                        {availableOrders.map((order) => (
                            <div key={order._id || order.id} className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Order #{(order._id || order.id || '').slice(-6)}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {order.items.length} item(s) • ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAcceptOrder(order._id || order.id)}
                                    className="btn-primary w-full"
                                >
                                    Accept Delivery
                                </button>
                            </div>
                        ))}
                        {availableOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No available orders at the moment.
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'active' && (
                    <>
                        {activeOrders.map((order) => (
                            <div key={order._id || order.id} className="card p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Order #{(order._id || order.id || '').slice(-6)}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                        Out for Delivery
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {order.items.length} item(s) • ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleMarkDelivered(order._id || order.id)}
                                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                                >
                                    Mark as Delivered
                                </button>
                            </div>
                        ))}
                        {activeOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No active deliveries.
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    <>
                        {historyOrders.map((order) => (
                            <div key={order._id || order.id} className="card p-6 opacity-75">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Order #{(order._id || order.id || '').slice(-6)}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Delivered
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Delivered to</p>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {order.items.length} item(s) • ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {historyOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No delivery history yet.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
