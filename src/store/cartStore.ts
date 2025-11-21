import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product & { quantity?: number }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (product) => {
        set((state) => {
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
                return {
                    items: state.items.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                            : item
                    ),
                };
            }
            return { items: [...state.items, { ...product, quantity: product.quantity || 1 }] };
        });
    },
    removeItem: (productId) => {
        set((state) => ({
            items: state.items.filter(item => item.id !== productId),
        }));
    },
    updateQuantity: (productId, quantity) => {
        set((state) => ({
            items: state.items.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ),
        }));
    },
    clearCart: () => set({ items: [] }),
    total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
}));
