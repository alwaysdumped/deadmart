import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import config from './src/config/env.js';

const checkProduct = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    const products = await Product.find({});
    console.log('Products found:', products.length);
    products.forEach(p => {
        console.log(`Name: ${p.name}, Price: ${p.price}, Stock: ${p.stock}, Active: ${p.isActive}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
};

checkProduct();
