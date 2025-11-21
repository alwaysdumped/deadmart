import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'upi', 'netbanking', 'cod'],
  },
  label: {
    type: String,
    trim: true,
  },
  // For cards
  cardNumber: {
    type: String,
    trim: true,
  },
  cardHolderName: {
    type: String,
    trim: true,
  },
  expiryMonth: {
    type: String,
    trim: true,
  },
  expiryYear: {
    type: String,
    trim: true,
  },
  // For UPI
  upiId: {
    type: String,
    trim: true,
  },
  // For Netbanking
  bankName: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual to get last 4 digits of card
paymentMethodSchema.virtual('last4').get(function() {
  if (this.cardNumber && this.cardNumber.length >= 4) {
    return this.cardNumber.slice(-4);
  }
  return null;
});

// Don't return full card number in JSON
paymentMethodSchema.methods.toJSON = function() {
  const obj = this.toObject({ virtuals: true });
  if (obj.cardNumber) {
    obj.cardNumber = '****' + obj.cardNumber.slice(-4);
  }
  return obj;
};

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
