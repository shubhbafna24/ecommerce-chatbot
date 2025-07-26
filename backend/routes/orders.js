// routes/orders.js
const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// Get order status by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = await Order.findOne({ order_id: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderItems = await OrderItem.find({ order_id: orderId });

    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findOne({ id: item.product_id });
        return { ...item.toObject(), product };
      })
    );

    res.json({
      success: true,
      data: { order, items: itemsWithProducts }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
