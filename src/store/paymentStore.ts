import { create } from 'zustand';
import { PaymentMethod } from '../types';
import { paymentMethodsAPI } from '../services/api';

interface PaymentMethodState {
    paymentMethods: PaymentMethod[];
    loading: boolean;
    initialized: boolean;
    fetchPaymentMethods: () => Promise<void>;
    createPaymentMethod: (method: Omit<PaymentMethod, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'last4'>) => Promise<void>;
    updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
    deletePaymentMethod: (id: string) => Promise<void>;
    setDefaultPaymentMethod: (id: string) => Promise<void>;
    getDefaultPaymentMethod: () => PaymentMethod | null;
}

export const usePaymentMethodStore = create<PaymentMethodState>((set, get) => ({
    paymentMethods: [],
    loading: false,
    initialized: false,

    fetchPaymentMethods: async () => {
        if (get().initialized) return;

        try {
            set({ loading: true });
            const response = await paymentMethodsAPI.getPaymentMethods();
            if (response.success) {
                set({ paymentMethods: response.paymentMethods, initialized: true });
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        } finally {
            set({ loading: false });
        }
    },

    createPaymentMethod: async (method) => {
        try {
            set({ loading: true });
            const response = await paymentMethodsAPI.createPaymentMethod(method);
            if (response.success) {
                set({ paymentMethods: [...get().paymentMethods, response.paymentMethod] });
            }
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updatePaymentMethod: async (id, method) => {
        try {
            set({ loading: true });
            const response = await paymentMethodsAPI.updatePaymentMethod(id, method);
            if (response.success) {
                set({
                    paymentMethods: get().paymentMethods.map(m =>
                        (m._id || m.id) === id ? response.paymentMethod : m
                    ),
                });
            }
        } catch (error) {
            console.error('Error updating payment method:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deletePaymentMethod: async (id) => {
        try {
            set({ loading: true });
            const response = await paymentMethodsAPI.deletePaymentMethod(id);
            if (response.success) {
                set({
                    paymentMethods: get().paymentMethods.filter(m => (m._id || m.id) !== id),
                });
            }
        } catch (error) {
            console.error('Error deleting payment method:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    setDefaultPaymentMethod: async (id) => {
        try {
            const response = await paymentMethodsAPI.setDefaultPaymentMethod(id);
            if (response.success) {
                set({
                    paymentMethods: get().paymentMethods.map(m => ({
                        ...m,
                        isDefault: (m._id || m.id) === id,
                    })),
                });
            }
        } catch (error) {
            console.error('Error setting default payment method:', error);
            throw error;
        }
    },

    getDefaultPaymentMethod: () => {
        return get().paymentMethods.find(m => m.isDefault) || null;
    },
}));
