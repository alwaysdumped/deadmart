import { create } from 'zustand';
import { Address } from '../types';
import { addressesAPI } from '../services/api';

interface AddressState {
    addresses: Address[];
    loading: boolean;
    initialized: boolean;
    fetchAddresses: () => Promise<void>;
    createAddress: (address: Omit<Address, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
    getDefaultAddress: () => Address | null;
}

export const useAddressStore = create<AddressState>((set, get) => ({
    addresses: [],
    loading: false,
    initialized: false,

    fetchAddresses: async () => {
        if (get().initialized) return;

        try {
            set({ loading: true });
            const response = await addressesAPI.getAddresses();
            if (response.success) {
                set({ addresses: response.addresses, initialized: true });
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            set({ loading: false });
        }
    },

    createAddress: async (address) => {
        try {
            set({ loading: true });
            const response = await addressesAPI.createAddress(address);
            if (response.success) {
                set({ addresses: [...get().addresses, response.address] });
            }
        } catch (error) {
            console.error('Error creating address:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateAddress: async (id, address) => {
        try {
            set({ loading: true });
            const response = await addressesAPI.updateAddress(id, address);
            if (response.success) {
                set({
                    addresses: get().addresses.map(a =>
                        (a._id || a.id) === id ? response.address : a
                    ),
                });
            }
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteAddress: async (id) => {
        try {
            set({ loading: true });
            const response = await addressesAPI.deleteAddress(id);
            if (response.success) {
                set({
                    addresses: get().addresses.filter(a => (a._id || a.id) !== id),
                });
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    setDefaultAddress: async (id) => {
        try {
            const response = await addressesAPI.setDefaultAddress(id);
            if (response.success) {
                set({
                    addresses: get().addresses.map(a => ({
                        ...a,
                        isDefault: (a._id || a.id) === id,
                    })),
                });
            }
        } catch (error) {
            console.error('Error setting default address:', error);
            throw error;
        }
    },

    getDefaultAddress: () => {
        return get().addresses.find(a => a.isDefault) || null;
    },
}));
