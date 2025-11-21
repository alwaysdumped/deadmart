import { User, Product, Order } from '../types';

const STORAGE_KEYS = {
    USERS: 'livemart_users',
    PRODUCTS: 'livemart_products',
    ORDERS: 'livemart_orders',
    REVIEWS: 'livemart_reviews',
};

// Seed Data
const SEED_USERS: User[] = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'customer@test.com',
        role: 'customer',
        location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Delhi', city: 'Delhi' },
    },
    {
        id: 'u2',
        name: 'Best Retailers',
        email: 'retailer@test.com',
        role: 'retailer',
        location: { lat: 28.6200, lng: 77.2100, address: 'Janpath, Delhi', city: 'Delhi' },
    },
    {
        id: 'u3',
        name: 'Mega Wholesalers',
        email: 'wholesaler@test.com',
        role: 'wholesaler',
        location: { lat: 28.6300, lng: 77.2200, address: 'Okhla, Delhi', city: 'Delhi' },
    },
    {
        id: 'u4',
        name: 'Fast Delivery',
        email: 'delivery@test.com',
        role: 'delivery_partner',
        location: { lat: 28.6400, lng: 77.2300, address: 'Karol Bagh, Delhi', city: 'Delhi' },
    },
];

const SEED_PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Organic Rice (5kg)',
        description: 'Premium Basmati Rice, aged for 2 years.',
        price: 500,
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        unit: 'bag',
        stock: 50,
        sellerId: 'u2', // Retailer
    },
    {
        id: 'p2',
        name: 'Fresh Tomatoes (1kg)',
        description: 'Farm fresh red tomatoes.',
        price: 40,
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400',
        unit: 'kg',
        stock: 100,
        sellerId: 'u2', // Retailer
    },
    {
        id: 'p3',
        name: 'Bulk Wheat Flour (50kg)',
        description: 'Whole wheat flour for retail distribution.',
        price: 2000,
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        unit: 'sack',
        stock: 500,
        sellerId: 'u3', // Wholesaler
    },
];

class MockDB {
    constructor() {
        this.init();
    }

    private init() {
        const users = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!users || JSON.parse(users).length === 0) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
        }

        const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (!products || JSON.parse(products).length === 0) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
        }
    }

    getUsers(): User[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    }

    getProducts(): Product[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    }

    getOrders(): Order[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    }

    saveOrder(order: Order) {
        const orders = this.getOrders();
        orders.push(order);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

        // Update stock
        const products = this.getProducts();
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    addProduct(product: Product) {
        const products = this.getProducts();
        products.push(product);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
}

export const db = new MockDB();
