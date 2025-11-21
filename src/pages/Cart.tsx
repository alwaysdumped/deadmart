import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

const Cart: React.FC = () => {
    const { items, removeItem, updateQuantity, total } = useCartStore();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-7">
                    <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                        {items.map((item) => (
                            <li key={item._id || item.id} className="flex py-6 sm:py-10">
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48"
                                    />
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-sm">
                                                    <span className="font-medium text-gray-700 hover:text-gray-800">
                                                        {item.name}
                                                    </span>
                                                </h3>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-900">₹{item.price}</p>
                                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <div className="flex items-center border border-gray-300 rounded-md w-32">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="p-2 text-gray-600 hover:bg-gray-50"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="flex-1 text-center text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 text-gray-600 hover:bg-gray-50"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="absolute top-0 right-0">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <div className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                    <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="text-sm font-medium text-gray-900">₹{total()}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <p className="text-base font-medium text-gray-900">Order total</p>
                            <p className="text-base font-medium text-gray-900">₹{total()}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Checkout <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
