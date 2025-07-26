const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  product_id: { type: Number, required: true },
  created_at: { type: Date, required: true },
  sold_at: { type: Date },
  cost: { type: Number, required: true },
  product_category: { type: String, required: true },
  product_name: { type: String, required: true },
  product_brand: { type: String, required: true },
  product_retail_price: { type: Number, required: true },
  product_department: { type: String, required: true },
  product_sku: { type: String, required: true },
  product_distribution_center_id: { type: Number, required: true }
});

inventoryItemSchema.index({ product_id: 1 });
inventoryItemSchema.index({ sold_at: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);