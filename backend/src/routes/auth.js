import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { generateOTP, storeOTP, verifyOTP } from '../services/otp.js';
import { sendOTPEmail } from '../services/email.js';
import { geocodeAddress } from '../services/maps.js';

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email for registration
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register user after OTP verification
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, otp } = req.body;

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ success: false, message: otpResult.message });
    }

    // Geocode address if needed
    let geoLocation = location;
    if (!location.lat || !location.lng) {
      const geocoded = await geocodeAddress(location.address);
      geoLocation = {
        ...location,
        lat: geocoded.lat,
        lng: geocoded.lng,
      };
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      location: geoLocation,
      verified: true,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check role
    if (user.role !== role) {
      return res.status(401).json({ success: false, message: 'Invalid role selected' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
import { protect } from '../middleware/auth.js';

router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        location: req.user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return res.status(400).json({ success: false, message: otpResult.message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, location } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (location) {
        // If address string is provided but no coords, geocode it
        if (location.address && (!location.lat || !location.lng)) {
            const geocoded = await geocodeAddress(location.address);
            user.location = {
                address: location.address,
                city: location.city || user.location.city,
                lat: geocoded.lat,
                lng: geocoded.lng
            };
        } else {
            user.location = { ...user.location, ...location };
        }
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
