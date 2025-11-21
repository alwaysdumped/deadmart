import mongoose from 'mongoose';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import config from './src/config/env.js';

const verifyData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Check Users
    const users = await User.find({});
    console.log('\n--- Users ---');
    const roleCounts = {};
    users.forEach(u => {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    });
    console.table(roleCounts);

    // Check Products
    const products = await Product.find({}).populate('sellerId', 'name role');
    console.log('\n--- Products ---');
    console.log(`Total Products: ${products.length}`);
    
    if (products.length > 0) {
      const productSummary = products.map(p => ({
        name: p.name,
        price: p.price,
        stock: p.stock,
        seller: p.sellerId?.name,
        sellerRole: p.sellerId?.role,
        isActive: p.isActive
      }));
      console.table(productSummary);
    } else {
      console.log('No products found.');
    }

    // Check specific condition for Customer Dashboard
    console.log('\n--- Customer Dashboard Check ---');
    const retailers = await User.find({ role: 'retailer' });
    const retailerIds = retailers.map(r => r._id);
    
    const customerProducts = await Product.find({
      sellerId: { $in: retailerIds },
      isActive: true,
      stock: { $gt: 0 }
    });
    
    console.log(`Retailers found: ${retailers.length}`);
    console.log(`Products visible to customers: ${customerProducts.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

verifyData();
