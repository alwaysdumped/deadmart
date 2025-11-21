import express from 'express';
const router = express.Router();
import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/auth.js';

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    res.json({
      success: true,
      wishlist: wishlist.products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    await wishlist.populate('products');

    res.json({
      success: true,
      wishlist: wishlist.products,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products');

    res.json({
      success: true,
      wishlist: wishlist.products,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
