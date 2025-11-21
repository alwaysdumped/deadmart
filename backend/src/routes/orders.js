import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        sellerId: product.sellerId,
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.location,
      status: 'confirmed', // Auto-confirm for prototype
      timeline: [{
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Order placed and confirmed',
      }],
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get user's orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { userId: req.user._id },
        { deliveryPartnerId: req.user._id }
      ]
    })
      .populate('items.productId', 'name image')
      .populate('items.sellerId', 'name')
      .populate('deliveryPartnerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/incoming
// @desc    Get incoming orders for sellers
// @access  Private (retailers/wholesalers)
router.get('/incoming', protect, async (req, res) => {
  try {
    if (!['retailer', 'wholesaler'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find orders where any item's sellerId matches current user
    const orders = await Order.find({ 'items.sellerId': req.user._id })
      .populate('userId', 'name email location')
      .populate('items.productId', 'name image')
      .populate('deliveryPartnerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/available
// @desc    Get available orders for delivery partners
// @access  Private (delivery partners)
router.get('/available', protect, async (req, res) => {
  try {
    if (req.user.role !== 'delivery_partner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const orders = await Order.find({
      status: { $in: ['confirmed', 'shipped'] },
      deliveryPartnerId: null,
    })
      .populate('userId', 'name location')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update status
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    // If delivery partner accepts order
    if (status === 'out_for_delivery' && req.user.role === 'delivery_partner') {
      order.deliveryPartnerId = req.user._id;
    }

    await order.save();
    
    // If order is delivered and buyer is a retailer, update their inventory
    if (status === 'delivered') {
        const orderWithUser = await Order.findById(order._id).populate('userId');
        if (orderWithUser.userId.role === 'retailer') {
            for (const item of order.items) {
                // Find the original product to get details
                const originalProduct = await Product.findById(item.productId);
                if (!originalProduct) continue;

                // Check if retailer already has this product
                let retailerProduct = await Product.findOne({
                    sellerId: order.userId,
                    wholesalerId: originalProduct.sellerId,
                    name: originalProduct.name
                });

                if (retailerProduct) {
                    retailerProduct.stock += item.quantity;
                    await retailerProduct.save();
                } else {
                    await Product.create({
                        name: originalProduct.name,
                        description: originalProduct.description,
                        price: originalProduct.price,
                        category: originalProduct.category,
                        image: originalProduct.image,
                        unit: originalProduct.unit,
                        stock: item.quantity,
                        sellerId: order.userId,
                        wholesalerId: originalProduct.sellerId,
                        isActive: true
                    });
                }
            }
        }
    }

    // Notify user about status change
    await createNotification(
      order.userId,
      'order',
      `Order ${status.replace('_', ' ').toUpperCase()}`,
      `Your order #${order._id.toString().slice(-6)} is now ${status.replace('_', ' ')}`,
      '/orders'
    );

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email location')
      .populate('items.productId', 'name image price')
      .populate('items.sellerId', 'name')
      .populate('deliveryPartnerId', 'name location');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
