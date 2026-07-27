const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String, required: true },
  addressType: { type: String, default: 'Home' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  role: { type: String, default: 'user' },
  addresses: [addressSchema],
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      size: { type: String },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

delete mongoose.models.User;
module.exports = mongoose.model('User', userSchema);
