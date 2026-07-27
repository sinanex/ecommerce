const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String },
  team: { type: String },
  category: [{ type: String }],
  subcategory: { type: String },
  price: { type: Number, required: true },
  discount_price: { type: Number },
  currency: { type: String, default: 'INR' },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  sizeStocks: [{
    size: { type: String },
    stock: { type: Number, default: 0 }
  }],
  isAvailable: { type: Boolean, default: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  salesTag: { type: String },
  salesTagColor: { type: String },
  customNameNumber: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews_count: { type: Number, default: 0 },
  reviews: [{
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    images: [{ type: String }]
  }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
