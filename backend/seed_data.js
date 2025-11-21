import mongoose from 'mongoose';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Address from './src/models/Address.js';
import PaymentMethod from './src/models/PaymentMethod.js';
import Notification from './src/models/Notification.js';
import config from './src/config/env.js';

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find the customer and retailer
    const customer = await User.findOne({ role: 'customer' });
    const retailer = await User.findOne({ role: 'retailer' });
    const wholesaler = await User.findOne({ role: 'wholesaler' });

    if (!customer || !retailer || !wholesaler) {
        console.log('Please ensure a customer, retailer, and wholesaler exist first.');
        process.exit(1);
    }

    console.log(`Seeding data for Customer: ${customer.name} (${customer._id})`);

    // 1. Seed Address
    await Address.deleteMany({ userId: customer._id });
    await Address.create({
        userId: customer._id,
        label: 'Home',
        fullName: customer.name,
        phone: '9876543210',
        addressLine1: '123 Main St, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        isDefault: true
    });
    console.log('✅ Address created');

    // 2. Seed Payment Method
    await PaymentMethod.deleteMany({ userId: customer._id });
    await PaymentMethod.create({
        userId: customer._id,
        type: 'credit_card',
        last4: '4242',
        expiryMonth: '12',
        expiryYear: '2025',
        cardHolderName: customer.name,
        isDefault: true
    });
    console.log('✅ Payment Method created');

    // 3. Seed Notification
    await Notification.deleteMany({ userId: customer._id });
    await Notification.create({
        userId: customer._id,
        type: 'system',
        title: 'Welcome to Live MART!',
        message: 'Thanks for joining. Start shopping now!',
        isRead: false
    });
    console.log('✅ Notification created');

    // 4. Create Products
    await Product.deleteMany({}); // Clear existing products to avoid duplicates
    const products = [
      // Retailer Products (Electronics, Clothing, Home)
      {
        name: 'Wireless Headphones',
        description: 'High-quality noise cancelling headphones',
        price: 2999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
        stock: 50,
        unit: 'piece',
        sellerId: retailer._id,
        rating: 4.5,
        reviewCount: 12
      },
      {
        name: 'Smart Watch Series 5',
        description: 'Fitness tracker with heart rate monitor',
        price: 4500,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
        stock: 30,
        unit: 'piece',
        sellerId: retailer._id,
        rating: 4.2,
        reviewCount: 8
      },
      {
        name: 'Cotton T-Shirt',
        description: '100% Cotton, breathable fabric',
        price: 499,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
        stock: 100,
        unit: 'piece',
        sellerId: retailer._id,
        rating: 4.0,
        reviewCount: 15,
        tags: ['Size: M', 'Color: Blue']
      },
      {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        price: 1299,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1542272617-08f083758ec9?auto=format&fit=crop&q=80&w=400',
        stock: 60,
        unit: 'piece',
        sellerId: retailer._id,
        rating: 4.3,
        reviewCount: 10,
        tags: ['Size: 32', 'Fit: Slim']
      },
      {
        name: 'Ceramic Coffee Mug',
        description: 'Handcrafted ceramic mug',
        price: 299,
        category: 'Home & Garden',
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=400',
        stock: 40,
        unit: 'piece',
        sellerId: retailer._id,
        rating: 4.8,
        reviewCount: 20
      },

      // Wholesaler Products (Bulk Grains, Spices)
      {
        name: 'Basmati Rice (Premium)',
        description: 'Long grain aromatic rice',
        price: 85,
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        stock: 5000,
        unit: 'kg',
        sellerId: wholesaler._id,
        rating: 4.7,
        reviewCount: 5
      },
      {
        name: 'Whole Wheat Flour',
        description: 'Freshly ground whole wheat flour',
        price: 45,
        category: 'Grains',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        stock: 2000,
        unit: 'kg',
        sellerId: wholesaler._id,
        rating: 4.5,
        reviewCount: 3
      },
      {
        name: 'Turmeric Powder',
        description: 'Organic turmeric powder high curcumin',
        price: 250,
        category: 'Spices',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        stock: 500,
        unit: 'kg',
        sellerId: wholesaler._id,
        rating: 4.6,
        reviewCount: 4
      },
      {
        name: 'Red Chilli Powder',
        description: 'Spicy red chilli powder',
        price: 300,
        category: 'Spices',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
        stock: 400,
        unit: 'kg',
        sellerId: wholesaler._id,
        rating: 4.4,
        reviewCount: 2
      },
      {
        name: 'Sunflower Oil',
        description: 'Refined sunflower oil',
        price: 140,
        category: 'Oil',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
        stock: 1000,
        unit: 'liter',
        sellerId: wholesaler._id,
        rating: 4.3,
        reviewCount: 6
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created`);

    console.log('Seed completed successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedData();
