import mongoose from 'mongoose';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import Address from './src/models/Address.js';
import PaymentMethod from './src/models/PaymentMethod.js';
import Notification from './src/models/Notification.js';
import config from './src/config/env.js';

const verifySystem = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n--- 1. Users ---');
    const users = await User.find({});
    console.table(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));

    console.log('\n--- 2. Products ---');
    const products = await Product.find({});
    console.log(`Total: ${products.length}`);
    if (products.length > 0) {
        console.table(products.map(p => ({ id: p._id, name: p.name, stock: p.stock, seller: p.sellerId })));
    }

    console.log('\n--- 3. Addresses ---');
    const addresses = await Address.find({});
    console.log(`Total: ${addresses.length}`);
    if (addresses.length > 0) {
        console.table(addresses.map(a => ({ user: a.userId, address: a.address, city: a.city })));
    }

    console.log('\n--- 4. Payment Methods ---');
    const payments = await PaymentMethod.find({});
    console.log(`Total: ${payments.length}`);
    if (payments.length > 0) {
        console.table(payments.map(p => ({ user: p.userId, type: p.type, last4: p.last4 })));
    }

    console.log('\n--- 5. Notifications ---');
    const notifications = await Notification.find({});
    console.log(`Total: ${notifications.length}`);
    if (notifications.length > 0) {
        console.table(notifications.map(n => ({ user: n.userId, title: n.title, read: n.isRead })));
    }

    console.log('\n--- 6. Orders ---');
    const orders = await Order.find({});
    console.log(`Total: ${orders.length}`);
    if (orders.length > 0) {
        console.table(orders.map(o => ({ id: o._id, user: o.userId, total: o.totalAmount, status: o.status })));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verifySystem();
