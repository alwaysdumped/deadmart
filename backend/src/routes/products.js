import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import { createNotification } from './notifications.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get products filtered by user role
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { role, search, category, minPrice, maxPrice, sort } = req.query;

    let query = { isActive: true, stock: { $gt: 0 } };

    // Filter by seller role based on buyer's role
    if (role === 'customer') {
      // Customers only see products from retailers
      const retailers = await User.find({ role: 'retailer' }).select('_id');
      const retailerIds = retailers.map(r => r._id);
      query.sellerId = { $in: retailerIds };
    } else if (role === 'retailer') {
      // Retailers only see products from wholesalers
      const wholesalers = await User.find({ role: 'wholesaler' }).select('_id');
      const wholesalerIds = wholesalers.map(w => w._id);
      query.sellerId = { $in: wholesalerIds };
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort
    let sortOption = {};
    if (sort === 'price-asc') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(query)
      .populate('sellerId', 'name role location')
      .populate('wholesalerId', 'name')
      .sort(sortOption);

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/my-products
// @desc    Get seller's own products
// @access  Private
router.get('/my-products', protect, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .populate('wholesalerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name role location')
      .populate('wholesalerId', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private (retailers/wholesalers only)
router.post('/', protect, async (req, res) => {
  try {
    if (!['retailer', 'wholesaler'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only retailers and wholesalers can add products' });
    }

    const product = await Product.create({
      ...req.body,
      sellerId: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/products/buy-from-wholesaler
// @desc    Retailer buys from wholesaler (creates copy with wholesalerId)
// @access  Private (retailers only)
router.post('/buy-from-wholesaler', protect, async (req, res) => {
  try {
    if (req.user.role !== 'retailer') {
      return res.status(403).json({ success: false, message: 'Only retailers can buy from wholesalers' });
    }

    const { productId, quantity, paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
        return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const wholesalerProduct = await Product.findById(productId);

    if (!wholesalerProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (wholesalerProduct.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock. Only ${wholesalerProduct.stock} available.` });
    }

    // Decrement wholesaler stock
    wholesalerProduct.stock -= quantity;
    await wholesalerProduct.save();

    // Create an order for the retailer
    const order = await Order.create({
      userId: req.user._id,
      items: [{
        productId: wholesalerProduct._id,
        quantity: quantity,
        price: wholesalerProduct.price,
        sellerId: wholesalerProduct.sellerId
      }],
      totalAmount: wholesalerProduct.price * quantity,
      status: 'confirmed', // Ready for delivery
      deliveryAddress: req.user.location,
      paymentMethodId: paymentMethodId,
      timeline: [{
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Order placed with wholesaler'
      }]
    });

    // Notify wholesaler
    await createNotification(
      wholesalerProduct.sellerId,
      'order',
      'New Wholesale Order',
      `Retailer ${req.user.name} ordered ${quantity} x ${wholesalerProduct.name}`,
      '/orders/incoming'
    );

    res.status(201).json({ success: true, order, message: 'Order placed successfully. Waiting for delivery.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
