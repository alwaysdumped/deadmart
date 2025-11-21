import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import AddressManager from '../components/AddressManager';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { Address, PaymentMethod } from '../types';

const Checkout: React.FC = () => {
    const { items, total, clearCart } = useCartStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    const handlePayment = async () => {
        if (!user) return;

        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create Order via API
            // Create Order via API
            const orderData = {
                items: items.map(item => ({
                    productId: item._id || item.id,
                    quantity: item.quantity,
                    price: item.price,
                    sellerId: typeof item.sellerId === 'string' ? item.sellerId : item.sellerId.id || item.sellerId._id,
                })),
                totalAmount: total(),
                deliveryAddress: {
                    address: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 ? selectedAddress.addressLine2 + ', ' : ''}${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}`,
                    city: selectedAddress.city,
                    lat: selectedAddress.location?.lat,
                    lng: selectedAddress.location?.lng
                },
                paymentMethod: selectedPaymentMethod.type
            };

            const response = await ordersAPI.createOrder(orderData);

            if (response.success) {
                clearCart();
                setIsSuccess(true);
            } else {
                alert('Order creation failed. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
                    <p className="mt-2 text-lg text-gray-500">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/orders')}
                            className="btn-primary"
                        >
                            View Orders
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary ml-4"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="mt-2 text-gray-500">Add some items to your cart to proceed with checkout</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 btn-primary"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping & Payment Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <AddressManager
                            onSelect={setSelectedAddress}
                            selectedAddressId={selectedAddress?._id || selectedAddress?.id}
                        />

                        <PaymentMethodSelector
                            onSelect={setSelectedPaymentMethod}
                            selectedMethodId={selectedPaymentMethod?._id || selectedPaymentMethod?.id}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item._id || item.id} className="flex items-center gap-4">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{total()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-primary-600">₹{total()}</span>
                                </div>
                            </div>

                            {(!selectedAddress || !selectedPaymentMethod) && (
                                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p>
                                        {!selectedAddress && !selectedPaymentMethod
                                            ? 'Please select a delivery address and payment method to proceed.'
                                            : !selectedAddress
                                                ? 'Please select a delivery address to proceed.'
                                                : 'Please select a payment method to proceed.'
                                        }
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || !selectedAddress || !selectedPaymentMethod}
                                className="btn-primary w-full mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className="animate-spin h-5 w-5 mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
