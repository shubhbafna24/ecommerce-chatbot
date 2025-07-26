// routes/products.js
const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const InventoryItem = require('../models/InventoryItem');

// Top-selling products (default limit = 5)
router.get('/top-selling', async (req, res) => {
  try {
    const limit = 5;

    const topProducts = await OrderItem.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$product_id', totalSold: { $sum: 1 } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
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

    res.json({ success: true, data: topProducts, count: topProducts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Top-selling products with custom limit
router.get('/top-selling/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;

    const topProducts = await OrderItem.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: '$product_id', totalSold: { $sum: 1 } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
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

    res.json({ success: true, data: topProducts, count: topProducts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Product stock info by name
router.get('/stock/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;

    const products = await Product.find({ name: { $regex: productName, $options: 'i' } });

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stockInfo = await Promise.all(
      products.map(async (product) => {
        const totalInventory = await InventoryItem.countDocuments({ product_id: product.id });
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

    res.json({ success: true, data: stockInfo, count: stockInfo.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
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

    if (category) query.category = { $regex: category, $options: 'i' };
    if (brand) query.brand = { $regex: brand, $options: 'i' };

    const products = await Product.find(query).limit(parseInt(limit));

    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
