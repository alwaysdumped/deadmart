import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import OrderTimeline from '../components/OrderTimeline';

const OrdersPage: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getMyOrders();
            if (response.success) {
                setOrders(response.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
            case 'out_for_delivery':
                return 'bg-blue-100 text-blue-800';
            case 'confirmed':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                    <p className="text-gray-500">Start shopping to see your orders here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id || order.id} className="card overflow-hidden">
                            <div
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedOrder(expandedOrder === (order._id || order.id) ? null : (order._id || order.id))}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order #{(order._id || order.id || '').slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            <Clock className="inline h-4 w-4 mr-1" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        {expandedOrder === (order._id || order.id) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                                        {order.deliveryAddress && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                <MapPin className="inline h-4 w-4 mr-1" />
                                                {order.deliveryAddress.city}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">₹{order.totalAmount}</p>
                                </div>
                            </div>

                            {expandedOrder === (order._id || order.id) && (
                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {typeof item.productId === 'object' && item.productId !== null
                                                                    ? (item.productId as any).name
                                                                    : 'Product Unavailable'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-medium text-gray-900">₹{(item.price || 0) * item.quantity}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.deliveryAddress && (
                                                <div className="mt-6">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery Address</h3>
                                                    <div className="bg-white p-4 rounded-lg">
                                                        <p className="text-gray-900">{order.deliveryAddress.address}</p>
                                                        <p className="text-gray-600">{order.deliveryAddress.city}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <OrderTimeline timeline={order.timeline || []} currentStatus={order.status} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
