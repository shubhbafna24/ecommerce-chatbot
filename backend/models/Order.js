const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  status: { type: String, required: true },
  gender: { type: String },
  created_at: { type: Date, required: true },
  returned_at: { type: Date },
  shipped_at: { type: Date },
  delivered_at: { type: Date },
  num_of_item: { type: Number, required: true }
});

orderSchema.index({ order_id: 1 });
orderSchema.index({ user_id: 1 });

module.exports = mongoose.model('Order', orderSchema);
