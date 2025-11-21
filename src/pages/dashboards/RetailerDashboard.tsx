import React, { useState, useEffect } from 'react';
import { productsAPI, ordersAPI, paymentMethodsAPI } from '../../services/api';
import { Product, Order, PaymentMethod } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

import { useNavigate } from 'react-router-dom';

const RetailerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'inventory' | 'marketplace' | 'orders'>('inventory');
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [wholesalerProducts, setWholesalerProducts] = useState<Product[]>([]);
    const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState<Partial<Product>>({
        category: 'Electronics',
        unit: 'piece'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [myProds, wholProds, orders, payments] = await Promise.all([
                productsAPI.getMyProducts(),
                productsAPI.getProducts({ role: 'retailer' }),
                ordersAPI.getIncomingOrders(),
                paymentMethodsAPI.getPaymentMethods()
            ]);

            if (myProds.success) setMyProducts(myProds.products);
            if (wholProds.success) setWholesalerProducts(wholProds.products);
            if (orders.success) setIncomingOrders(orders.orders);
            if (payments.success) setPaymentMethods(payments.paymentMethods);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;

        try {
            const response = await productsAPI.createProduct({
                name: newItem.name,
                description: newItem.description || '',
                price: Number(newItem.price),
                category: newItem.category || 'Electronics',
                image: newItem.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
                unit: newItem.unit || 'piece',
                stock: Number(newItem.stock) || 0,
            });

            if (response.success) {
                setMyProducts([response.product, ...myProducts]);
                setIsAddModalOpen(false);
                setNewItem({ category: 'Electronics', unit: 'piece' });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        }
    };

    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(10);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

    const openBuyModal = (product: Product) => {
        setSelectedProduct(product);
        setBuyQuantity(10);
        // Auto-select default payment method if available
        const defaultMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
        setSelectedPaymentMethod(defaultMethod ? (defaultMethod._id || defaultMethod.id || '') : '');
        setBuyModalOpen(true);
    };

    const handleBuyFromWholesaler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || buyQuantity <= 0) return;

        if (buyQuantity > selectedProduct.stock) {
            alert(`Cannot purchase more than available stock (${selectedProduct.stock})`);
            return;
        }

        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        try {
            const response = await productsAPI.buyFromWholesaler(
                selectedProduct._id || selectedProduct.id,
                buyQuantity,
                selectedPaymentMethod
            );
            if (response.success) {
                alert('Order placed successfully! Track it in the Orders tab.');
                setBuyModalOpen(false);
                fetchData();
            }
        } catch (error: any) {
            console.error('Error buying from wholesaler:', error);
            alert(error.message || 'Failed to purchase product');
        }
    };

    const totalInventoryValue = myProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalOrders = incomingOrders.length;

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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Retailer Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your inventory and orders</p>
                </div>
                <button
                    onClick={() => navigate('/add-product')}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                        <Package className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">My Products</p>
                        <p className="text-2xl font-bold text-gray-900">{myProducts.length}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                        <p className="text-2xl font-bold text-gray-900">₹{totalInventoryValue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Incoming Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
                {['inventory', 'marketplace', 'orders'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-2 text-sm font-medium whitespace-nowrap transition-colors capitalize ${activeTab === tab
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'marketplace' ? 'Wholesale Marketplace' : tab}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myProducts.map((product) => (
                                    <tr key={product.id || product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-lg object-cover" src={product.image} alt="" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.wholesalerId ? (
                                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                                    From Wholesaler
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                    Own Stock
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {myProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No products in inventory. Add products or buy from wholesalers.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wholesalerProducts
                                .filter(product => product.sellerId !== user?._id && product.sellerId !== user?.id)
                                .map((product) => (
                                    <div key={product.id || product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
                                        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
                                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                        </div>
                                        <div className="mt-auto pt-4">
                                            <button
                                                onClick={() => openBuyModal(product)}
                                                className="w-full btn-primary text-sm"
                                            >
                                                Buy Stock
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {wholesalerProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No products available from wholesalers.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="p-6">
                        <div className="space-y-4">
                            {incomingOrders.map((order) => (
                                <div key={order.id || order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-gray-900">Order #{(order._id || order.id || '').slice(-6)}</span>
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
                                No incoming orders yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Buy Stock Modal */}
            {buyModalOpen && selectedProduct && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setBuyModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleBuyFromWholesaler}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6">Buy Stock</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <img src={selectedProduct.image} alt={selectedProduct.name} className="h-16 w-16 rounded-lg object-cover" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                                                <p className="text-sm text-gray-500">Price: ₹{selectedProduct.price} / {selectedProduct.unit}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Purchase</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max={selectedProduct.stock}
                                                className="input-field"
                                                value={buyQuantity}
                                                onChange={e => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Available Stock: {selectedProduct.stock}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                            {paymentMethods.length > 0 ? (
                                                <select
                                                    className="input-field"
                                                    value={selectedPaymentMethod}
                                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select a payment method</option>
                                                    {paymentMethods.map((pm) => (
                                                        <option key={pm._id || pm.id} value={pm._id || pm.id}>
                                                            {['credit_card', 'debit_card'].includes(pm.type) ? `Card ending in ${pm.last4}` : pm.type.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                    No payment methods found. Please add one in your profile settings.
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-800 font-medium">Total Cost:</span>
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ₹{(selectedProduct.price * buyQuantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                                    <button type="submit" className="btn-primary w-full sm:w-auto">
                                        Confirm Purchase
                                    </button>
                                    <button type="button" onClick={() => setBuyModalOpen(false)} className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RetailerDashboard;
