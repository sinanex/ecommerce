const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  size: { type: String },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String },
    alternatePhone: { type: String },
    addressType: { type: String }
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  razorpayPaymentId: { type: String },
  advancePaid: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  status: { type: String, default: 'Processing', enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  trackingId: { type: String },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
