// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  cost: { type: Number, required: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  retail_price: { type: Number, required: true },
  department: { type: String, required: true },
  sku: { type: String, required: true },
  distribution_center_id: { type: Number, required: true }
});

productSchema.index({ name: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
