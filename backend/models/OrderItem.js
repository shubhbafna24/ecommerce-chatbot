const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  order_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  inventory_item_id: { type: Number },
  status: { type: String, required: true },
  created_at: { type: Date, required: true },
  shipped_at: { type: Date },
  delivered_at: { type: Date },
  returned_at: { type: Date }
});

orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
