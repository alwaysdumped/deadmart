import express from 'express';
const router = express.Router();
import PaymentMethod from '../models/PaymentMethod.js';
import { protect } from '../middleware/auth.js';

// Get user's payment methods
router.get('/', protect, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new payment method
router.post('/', protect, async (req, res) => {
  try {
    const { type, label, cardNumber, cardHolderName, expiryMonth, expiryYear, upiId, bankName, isDefault } = req.body;

    // Validate required fields based on type
    if (type === 'credit_card' || type === 'debit_card') {
      if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear) {
        return res.status(400).json({ 
          success: false, 
          message: 'Card details are required for card payments' 
        });
      }
    } else if (type === 'upi') {
      if (!upiId) {
        return res.status(400).json({ 
          success: false, 
          message: 'UPI ID is required for UPI payments' 
        });
      }
    } else if (type === 'netbanking') {
      if (!bankName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bank name is required for netbanking' 
        });
      }
    }

    const paymentMethod = await PaymentMethod.create({
      userId: req.user._id,
      type,
      label,
      cardNumber,
      cardHolderName,
      expiryMonth,
      expiryYear,
      upiId,
      bankName,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      paymentMethod,
      message: 'Payment method added successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update payment method
router.put('/:id', protect, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    const { label, isDefault } = req.body;

    // Only allow updating label and default status for security
    if (label) paymentMethod.label = label;
    if (isDefault !== undefined) paymentMethod.isDefault = isDefault;

    await paymentMethod.save();

    res.json({
      success: true,
      paymentMethod,
      message: 'Payment method updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete payment method
router.delete('/:id', protect, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    await paymentMethod.deleteOne();

    // If deleted payment method was default, set another as default
    if (paymentMethod.isDefault) {
      const firstMethod = await PaymentMethod.findOne({ userId: req.user._id });
      if (firstMethod) {
        firstMethod.isDefault = true;
        await firstMethod.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set default payment method
router.put('/:id/set-default', protect, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, userId: req.user._id });

    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.json({
      success: true,
      paymentMethod,
      message: 'Default payment method updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
