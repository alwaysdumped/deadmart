import { create } from 'zustand';
import { Product } from '../types';
import { wishlistAPI } from '../services/api';

interface WishlistState {
    items: Product[];
    loading: boolean;
    initialized: boolean;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    initialized: false,

    fetchWishlist: async () => {
        if (get().initialized) return;

        try {
            set({ loading: true });
            const response = await wishlistAPI.getWishlist();
            if (response.success) {
                set({ items: response.wishlist, initialized: true });
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            set({ loading: false });
        }
    },

    addToWishlist: async (product: Product) => {
        try {
            const productId = product._id || product.id;
            const response = await wishlistAPI.addToWishlist(productId);
            if (response.success) {
                set({ items: response.wishlist });
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    },

    removeFromWishlist: async (productId: string) => {
        try {
            const response = await wishlistAPI.removeFromWishlist(productId);
            if (response.success) {
                set({ items: response.wishlist });
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    },

    isInWishlist: (productId: string) => {
        return get().items.some(item => (item._id || item.id) === productId);
    },
}));
