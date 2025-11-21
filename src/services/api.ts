import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Response wrapper type
export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    [key: string]: any;
}

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('livemart_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and unwrap data
api.interceptors.response.use(
    (response: any) => response.data,
    (error: any) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('livemart_token');
            localStorage.removeItem('livemart_user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// Auth API
export const authAPI = {
    sendOTP: (email: string, name: string): Promise<APIResponse> =>
        api.post('/auth/send-otp', { email, name }),

    register: (data: any): Promise<APIResponse> =>
        api.post('/auth/register', data),

    login: (email: string, password: string, role: string): Promise<APIResponse> =>
        api.post('/auth/login', { email, password, role }),

    getMe: (): Promise<APIResponse> =>
        api.get('/auth/me'),

    forgotPassword: (email: string): Promise<APIResponse> =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (data: any): Promise<APIResponse> =>
        api.post('/auth/reset-password', data),

    updateProfile: (data: any): Promise<APIResponse> =>
        api.put('/auth/profile', data),
};

// Products API
export const productsAPI = {
    getProducts: (params?: any): Promise<APIResponse> =>
        api.get('/products', { params }),

    getMyProducts: (): Promise<APIResponse> =>
        api.get('/products/my-products'),

    getProduct: (id: string): Promise<APIResponse> =>
        api.get(`/products/${id}`),

    createProduct: (data: any): Promise<APIResponse> =>
        api.post('/products', data),

    buyFromWholesaler: (productId: string, quantity: number, paymentMethodId: string): Promise<APIResponse> =>
        api.post('/products/buy-from-wholesaler', { productId, quantity, paymentMethodId }),

    updateProduct: (id: string, data: any): Promise<APIResponse> =>
        api.put(`/products/${id}`, data),

    deleteProduct: (id: string): Promise<APIResponse> =>
        api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
    createOrder: (data: any): Promise<APIResponse> =>
        api.post('/orders', data),

    getMyOrders: (): Promise<APIResponse> =>
        api.get('/orders/my-orders'),

    getIncomingOrders: (): Promise<APIResponse> =>
        api.get('/orders/incoming'),

    getAvailableOrders: (): Promise<APIResponse> =>
        api.get('/orders/available'),

    updateOrderStatus: (id: string, status: string, note?: string): Promise<APIResponse> =>
        api.put(`/orders/${id}/status`, { status, note }),

    getOrder: (id: string): Promise<APIResponse> =>
        api.get(`/orders/${id}`),
};

// Reviews API
export const reviewsAPI = {
    getReviews: (productId: string): Promise<APIResponse> =>
        api.get(`/reviews/${productId}`),

    createReview: (data: any): Promise<APIResponse> =>
        api.post('/reviews', data),

    markHelpful: (id: string): Promise<APIResponse> =>
        api.put(`/reviews/${id}/helpful`),
};

// Wishlist API
export const wishlistAPI = {
    getWishlist: (): Promise<APIResponse> =>
        api.get('/wishlist'),

    addToWishlist: (productId: string): Promise<APIResponse> =>
        api.post('/wishlist', { productId }),

    removeFromWishlist: (productId: string): Promise<APIResponse> =>
        api.delete(`/wishlist/${productId}`),
};

// Addresses API
export const addressesAPI = {
    getAddresses: (): Promise<APIResponse> =>
        api.get('/addresses'),

    createAddress: (data: any): Promise<APIResponse> =>
        api.post('/addresses', data),

    updateAddress: (id: string, data: any): Promise<APIResponse> =>
        api.put(`/addresses/${id}`, data),

    deleteAddress: (id: string): Promise<APIResponse> =>
        api.delete(`/addresses/${id}`),

    setDefaultAddress: (id: string): Promise<APIResponse> =>
        api.put(`/addresses/${id}/set-default`),
};

// Payment Methods API
export const paymentMethodsAPI = {
    getPaymentMethods: (): Promise<APIResponse> =>
        api.get('/payment-methods'),

    createPaymentMethod: (data: any): Promise<APIResponse> =>
        api.post('/payment-methods', data),

    updatePaymentMethod: (id: string, data: any): Promise<APIResponse> =>
        api.put(`/payment-methods/${id}`, data),

    deletePaymentMethod: (id: string): Promise<APIResponse> =>
        api.delete(`/payment-methods/${id}`),

    setDefaultPaymentMethod: (id: string): Promise<APIResponse> =>
        api.put(`/payment-methods/${id}/set-default`),
};

// Notifications API
export const notificationsAPI = {
    getNotifications: (params?: any): Promise<APIResponse> =>
        api.get('/notifications', { params }),

    markAsRead: (id: string): Promise<APIResponse> =>
        api.put(`/notifications/${id}/read`),

    markAllAsRead: (): Promise<APIResponse> =>
        api.put('/notifications/read-all'),

    deleteNotification: (id: string): Promise<APIResponse> =>
        api.delete(`/notifications/${id}`),
};

export default api;
