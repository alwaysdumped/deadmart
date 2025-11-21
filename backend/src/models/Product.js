import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0,
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
  },
  unit: {
    type: String,
    default: 'piece',
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wholesalerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Only set if retailer bought from wholesaler
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
productSchema.index({ sellerId: 1, isActive: 1, stock: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
