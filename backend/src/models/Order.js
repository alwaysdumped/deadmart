import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Track which seller sold this item
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deliveryAddress: {
    address: String,
    city: String,
    lat: Number,
    lng: Number,
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ 'items.sellerId': 1, createdAt: -1 });
orderSchema.index({ deliveryPartnerId: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
