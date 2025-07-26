const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/database');

// Import models for testing
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const InventoryItem = require('./models/InventoryItem');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Basic routes for testing the API
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce Customer Support Chatbot API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
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

// API endpoints for chatbot queries
app.get('/api/products/top-selling/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    
    // Aggregate to find top selling products
    const topProducts = await OrderItem.aggregate([
      {
        $match: { status: { $ne: 'Cancelled' } }
      },
      {
        $group: {
          _id: '$product_id',
          totalSold: { $sum: 1 }
        }
      },
      {
        $sort: { totalSold: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          brand: '$product.brand',
          category: '$product.category',
          totalSold: 1,
          retailPrice: '$product.retail_price'
        }
      }
    ]);

    res.json({
      success: true,
      data: topProducts,
      count: topProducts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order status by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({ order_id: orderId });
    
    // Get product details for order items
    const orderItemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findOne({ id: item.product_id });
        return {
          ...item.toObject(),
          product: product
        };
      })
    );

    res.json({
      success: true,
      data: {
        order: order,
        items: orderItemsWithProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get stock for a specific product
app.get('/api/products/stock/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;
    
    // Find products matching the name (case-insensitive)
    const products = await Product.find({
      name: { $regex: productName, $options: 'i' }
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate stock for each matching product
    const stockInfo = await Promise.all(
      products.map(async (product) => {
        // Count unsold inventory items
        const totalInventory = await InventoryItem.countDocuments({
          product_id: product.id
        });
        
        const soldInventory = await InventoryItem.countDocuments({
          product_id: product.id,
          sold_at: { $ne: null }
        });

        const availableStock = totalInventory - soldInventory;

        return {
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          sku: product.sku,
          totalInventory,
          soldInventory,
          availableStock
        };
      })
    );

    res.json({
      success: true,
      data: stockInfo,
      count: stockInfo.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const { q, category, brand, limit = 10 } = req.query;
    
    let query = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    const products = await Product.find(query).limit(parseInt(limit));

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});