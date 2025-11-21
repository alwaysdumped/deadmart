// In-memory OTP storage (for production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with 5-minute expiry
export const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { otp, expiresAt });
  
  // Auto-cleanup after expiry
  setTimeout(() => {
    otpStore.delete(email);
  }, 5 * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully' };
};

// Clear OTP
export const clearOTP = (email) => {
  otpStore.delete(email);
};
