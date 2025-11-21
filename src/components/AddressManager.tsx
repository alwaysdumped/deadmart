import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import { useAddressStore } from '../store/addressStore';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface AddressManagerProps {
    onSelect?: (address: Address) => void;
    selectedAddressId?: string;
}

const AddressManager: React.FC<AddressManagerProps> = ({ onSelect, selectedAddressId }) => {
    const { addresses, loading, fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Address>>({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (!loading && addresses.length > 0 && !selectedAddressId && onSelect) {
            const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
            onSelect(defaultAddress);
        }
    }, [addresses, loading, selectedAddressId, onSelect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAddress(editingId, formData);
            } else {
                await createAddress(formData as Omit<Address, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>);
            }
            resetForm();
        } catch (error: any) {
            alert(error.message || 'Failed to save address');
        }
    };

    const handleEdit = (address: Address) => {
        setEditingId(address._id || address.id || null);
        setFormData(address);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(id);
            } catch (error: any) {
                alert(error.message || 'Failed to delete address');
            }
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
        } catch (error: any) {
            alert(error.message || 'Failed to set default address');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            label: 'Home',
            fullName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            isDefault: false,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Delivery Addresses</h3>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Address
                    </button>
                )}
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="card p-6">
                    <h4 className="text-md font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Address' : 'Add New Address'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                                <select
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value as 'Home' | 'Work' | 'Other' })}
                                    className="input-field"
                                    required
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                                <input
                                    type="text"
                                    value={formData.addressLine1}
                                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                    className="input-field"
                                    placeholder="Street address, P.O. box, company name"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.addressLine2}
                                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                    className="input-field"
                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {editingId ? 'Update Address' : 'Save Address'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-3">
                {loading && addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No addresses saved yet</p>
                    </div>
                ) : (
                    addresses.map((address) => {
                        const addressId = address._id || address.id;
                        const isSelected = selectedAddressId === addressId;
                        return (
                            <div
                                key={addressId}
                                className={`card p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-600 bg-primary-50' : 'hover:shadow-md'
                                    }`}
                                onClick={() => onSelect?.(address)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                                {address.label}
                                            </span>
                                            {address.isDefault && (
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium flex items-center gap-1">
                                                    <Check className="h-3 w-3" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-900">{address.fullName}</p>
                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {address.addressLine1}
                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {address.city}, {address.state} {address.postalCode}
                                        </p>
                                        <p className="text-sm text-gray-600">{address.country}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!address.isDefault && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetDefault(addressId!);
                                                }}
                                                className="text-gray-400 hover:text-primary-600 transition-colors"
                                                title="Set as default"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(address);
                                            }}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(addressId!);
                                            }}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
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

export default AddressManager;
