export type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'delivery_partner';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
        city: string;
    };
}

export interface Product {
    id: string;
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    unit: string;
    stock: number;
    sellerId: string | User;
    wholesalerId?: string;
    isActive?: boolean;
    rating?: number;
    reviewCount?: number;
    createdAt?: string;
}

export interface Order {
    id: string;
    _id?: string;
    userId: string;
    items: Array<{
        id: string;
        productId?: string;
        quantity: number;
        price?: number;
        sellerId?: string;
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    createdAt: string;
    deliveryPartnerId?: string;
    deliveryAddress?: {
        address: string;
        city: string;
        lat?: number;
        lng?: number;
    };
    timeline?: Array<{
        status: string;
        timestamp: string;
        note?: string;
    }>;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    helpful?: number;
}

export interface Address {
    id?: string;
    _id?: string;
    userId?: string;
    label: 'Home' | 'Work' | 'Other';
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    location?: {
        lat: number;
        lng: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export type PaymentMethodType = 'credit_card' | 'debit_card' | 'upi' | 'netbanking' | 'cod';

export interface PaymentMethod {
    id?: string;
    _id?: string;
    userId?: string;
    type: PaymentMethodType;
    label?: string;
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: string;
    expiryYear?: string;
    upiId?: string;
    bankName?: string;
    isDefault: boolean;
    last4?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type NotificationType = 'order' | 'product' | 'system' | 'promotion';

export interface Notification {
    id?: string;
    _id?: string;
    userId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    data?: any;
    createdAt?: string;
    updatedAt?: string;
}
