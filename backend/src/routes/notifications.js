import express from 'express';
const router = express.Router();
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

// Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create notification (internal use - for order updates, etc.)
export const createNotification = async (userId, type, title, message, link = null, data = null) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      data,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export default router;
