import React, { useState, useEffect } from 'react';
import { productsAPI, ordersAPI } from '../../services/api';
import { Product, Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Package, TrendingUp, DollarSign } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

import { useNavigate } from 'react-router-dom';

const WholesalerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [products, orders] = await Promise.all([
                productsAPI.getMyProducts(),
                ordersAPI.getIncomingOrders()
            ]);

            if (products.success) setMyProducts(products.products);
            if (orders.success) setIncomingOrders(orders.orders);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };



    const totalSales = incomingOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    const inventoryValue = myProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Wholesaler Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage bulk inventory for Retailers</p>
                </div>
                <button
                    onClick={() => navigate('/add-product')}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Bulk Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                        <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Bulk Items</p>
                        <p className="text-2xl font-bold text-gray-900">{myProducts.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                        <p className="text-2xl font-bold text-gray-900">₹{inventoryValue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                {['inventory', 'orders'].map((tab) => (
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {activeTab === 'inventory' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-lg object-cover" src={product.image} alt="" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {myProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No bulk items. Add stock to supply retailers.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="p-6">
                        <div className="space-y-4">
                            {incomingOrders.map((order) => (
                                <div key={order.id || (order as any)._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-gray-900">Order #{order.id?.slice(-6) || 'N/A'}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                                            <p className="text-sm font-medium text-primary-600">Total: ₹{order.totalAmount}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {incomingOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No active orders from retailers.
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default WholesalerDashboard;
