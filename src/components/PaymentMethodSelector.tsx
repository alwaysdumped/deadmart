import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethodType } from '../types';
import { usePaymentMethodStore } from '../store/paymentStore';
import { CreditCard, Smartphone, Building2, Banknote, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface PaymentMethodSelectorProps {
    onSelect?: (method: PaymentMethod) => void;
    selectedMethodId?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ onSelect, selectedMethodId }) => {
    const { paymentMethods, loading, fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethodStore();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<PaymentMethod>>({
        type: 'credit_card',
        label: '',
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        upiId: '',
        bankName: '',
        isDefault: false,
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if (!loading && paymentMethods.length > 0 && !selectedMethodId && onSelect) {
            const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
            onSelect(defaultMethod);
        }
        if (!loading && paymentMethods.length === 0) {
            setShowForm(true);
        }
    }, [paymentMethods, loading, selectedMethodId, onSelect]);

    const getPaymentIcon = (type: PaymentMethodType) => {
        switch (type) {
            case 'credit_card':
            case 'debit_card':
                return <CreditCard className="h-6 w-6" />;
            case 'upi':
                return <Smartphone className="h-6 w-6" />;
            case 'netbanking':
                return <Building2 className="h-6 w-6" />;
            case 'cod':
                return <Banknote className="h-6 w-6" />;
        }
    };

    const getPaymentLabel = (type: PaymentMethodType) => {
        switch (type) {
            case 'credit_card':
                return 'Credit Card';
            case 'debit_card':
                return 'Debit Card';
            case 'upi':
                return 'UPI';
            case 'netbanking':
                return 'Net Banking';
            case 'cod':
                return 'Cash on Delivery';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updatePaymentMethod(editingId, { label: formData.label, isDefault: formData.isDefault });
            } else {
                await createPaymentMethod(formData as Omit<PaymentMethod, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'last4'>);
            }
            resetForm();
        } catch (error: any) {
            alert(error.message || 'Failed to save payment method');
        }
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingId(method._id || method.id || null);
        setFormData({ label: method.label, isDefault: method.isDefault });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            try {
                await deletePaymentMethod(id);
            } catch (error: any) {
                alert(error.message || 'Failed to delete payment method');
            }
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultPaymentMethod(id);
        } catch (error: any) {
            alert(error.message || 'Failed to set default payment method');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            type: 'credit_card',
            label: '',
            cardNumber: '',
            cardHolderName: '',
            expiryMonth: '',
            expiryYear: '',
            upiId: '',
            bankName: '',
            isDefault: false,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment Method
                    </button>
                )}
            </div>

            {/* Payment Method Form */}
            {showForm && (
                <div className="card p-6">
                    <h4 className="text-md font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingId && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethodType })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="credit_card">Credit Card</option>
                                        <option value="debit_card">Debit Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="netbanking">Net Banking</option>
                                        <option value="cod">Cash on Delivery</option>
                                    </select>
                                </div>

                                {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                value={formData.cardNumber}
                                                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, '') })}
                                                className="input-field"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={16}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
                                            <input
                                                type="text"
                                                value={formData.cardHolderName}
                                                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Month</label>
                                            <input
                                                type="text"
                                                value={formData.expiryMonth}
                                                onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                                                className="input-field"
                                                placeholder="MM"
                                                maxLength={2}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Year</label>
                                            <input
                                                type="text"
                                                value={formData.expiryYear}
                                                onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                                                className="input-field"
                                                placeholder="YYYY"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.type === 'upi' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                        <input
                                            type="text"
                                            value={formData.upiId}
                                            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                            className="input-field"
                                            placeholder="yourname@upi"
                                            required
                                        />
                                    </div>
                                )}

                                {formData.type === 'netbanking' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                                        <input
                                            type="text"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Label (Optional)</label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="input-field"
                                placeholder="e.g., Personal Card, Work Card"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefaultPayment"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="isDefaultPayment" className="text-sm text-gray-700">Set as default payment method</label>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {editingId ? 'Update' : 'Save Payment Method'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Payment Methods List */}
            <div className="space-y-3">
                {loading && paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading payment methods...</div>
                ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No payment methods saved yet</p>
                    </div>
                ) : (
                    paymentMethods.map((method) => {
                        const methodId = method._id || method.id;
                        const isSelected = selectedMethodId === methodId;
                        return (
                            <div
                                key={methodId}
                                className={`card p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-600 bg-primary-50' : 'hover:shadow-md'
                                    }`}
                                onClick={() => onSelect?.(method)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                            {getPaymentIcon(method.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-gray-900">{getPaymentLabel(method.type)}</p>
                                                {method.isDefault && (
                                                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium flex items-center gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            {method.label && (
                                                <p className="text-sm text-gray-600">{method.label}</p>
                                            )}
                                            {method.last4 && (
                                                <p className="text-sm text-gray-600">•••• {method.last4}</p>
                                            )}
                                            {method.upiId && (
                                                <p className="text-sm text-gray-600">{method.upiId}</p>
                                            )}
                                            {method.bankName && (
                                                <p className="text-sm text-gray-600">{method.bankName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!method.isDefault && method.type !== 'cod' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetDefault(methodId!);
                                                }}
                                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                                title="Set as default"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                        )}
                                        {method.type !== 'cod' && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(method);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(methodId!);
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PaymentMethodSelector;
