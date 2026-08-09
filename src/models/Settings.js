const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  processingTimeFrom: { type: Number, default: 2 },
  processingTimeTo: { type: Number, default: 4 },
  deliveryTimeFrom: { type: Number, default: 5 },
  deliveryTimeTo: { type: Number, default: 7 },
  codDeliveryAmount: { type: Number, default: 50 },
  adminUsername: { type: String, default: 'admin' },
  adminPassword: { type: String, default: 'admin' },
  salesTags: [{
    name: { type: String, required: true },
    color: { type: String, required: true }
  }],
  sizes: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
