import express from 'express';
const router = express.Router();
import Address from '../models/Address.js';
import { protect } from '../middleware/auth.js';
import { geocodeAddress } from '../services/maps.js';

// Get user's addresses
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new address
router.post('/', protect, async (req, res) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    // Geocode the address to get coordinates
    let location = null;
    try {
      const fullAddress = `${addressLine1}, ${city}, ${state} ${postalCode}, ${country || 'India'}`;
      const geoResult = await geocodeAddress(fullAddress);
      location = {
        lat: geoResult.lat,
        lng: geoResult.lng,
      };
    } catch (geoError) {
      console.warn('Geocoding failed, continuing without coordinates:', geoError.message);
    }

    const address = await Address.create({
      userId: req.user._id,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false,
      location,
    });

    res.status(201).json({
      success: true,
      address,
      message: 'Address created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update address
router.put('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    // Update fields
    if (label) address.label = label;
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    // Re-geocode if address changed
    if (addressLine1 || city || state || postalCode || country) {
      try {
        const fullAddress = `${address.addressLine1}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
        const geoResult = await geocodeAddress(fullAddress);
        address.location = {
          lat: geoResult.lat,
          lng: geoResult.lng,
        };
      } catch (geoError) {
        console.warn('Geocoding failed during update:', geoError.message);
      }
    }

    await address.save();

    res.json({
      success: true,
      address,
      message: 'Address updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await address.deleteOne();

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const firstAddress = await Address.findOne({ userId: req.user._id });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await firstAddress.save();
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Set default address
router.put('/:id/set-default', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      address,
      message: 'Default address updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
