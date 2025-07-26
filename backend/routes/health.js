// routes/health.js
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const InventoryItem = require('../models/InventoryItem');

router.get('/', async (req, res) => {
  try {
    const stats = {
      products: await Product.countDocuments(),
      orders: await Order.countDocuments(),
      orderItems: await OrderItem.countDocuments(),
      inventoryItems: await InventoryItem.countDocuments()
    };

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
