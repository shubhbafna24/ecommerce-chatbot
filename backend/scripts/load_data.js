const fs = require('fs');
const csv = require('csv-parser');
const connectDB = require('../config/database');

// Import models
const DistributionCenter = require('../models/DistributionCenter');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const InventoryItem = require('../models/InventoryItem');

// Helper function to parse date strings
const parseDate = (dateString) => {
  if (!dateString || dateString === '') return null;
  return new Date(dateString);
};

// Helper function to parse numbers
const parseNumber = (value) => {
  if (!value || value === '') return null;
  return parseFloat(value);
};

// Helper function to parse integers
const parseInteger = (value) => {
  if (!value || value === '') return null;
  return parseInt(value);
};

const loadCSVData = async (filePath, model, transformFn) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const transformedData = transformFn ? transformFn(data) : data;
          results.push(transformedData);
        } catch (error) {
          console.error(`Error transforming data: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Loading ${results.length} records into ${model.modelName}...`);
          
          // Clear existing data
          await model.deleteMany({});
          
          // Insert new data in batches
          const batchSize = 1000;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await model.insertMany(batch, { ordered: false });
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} for ${model.modelName}`);
          }
          
          console.log(`✅ Successfully loaded ${results.length} ${model.modelName} records`);
          resolve();
        } catch (error) {
          console.error(`❌ Error loading ${model.modelName}:`, error.message);
          reject(error);
        }
      })
      .on('error', reject);
  });
};

const loadAllData = async () => {
  try {
    await connectDB();
    console.log('🚀 Starting data loading process...\n');

    // Load Distribution Centers
    await loadCSVData('./data/distribution_centers.csv', DistributionCenter, (data) => ({
      id: parseInteger(data.id),
      name: data.name,
      latitude: parseNumber(data.latitude),
      longitude: parseNumber(data.longitude)
    }));

    // Load Products
    await loadCSVData('./data/products.csv', Product, (data) => ({
      id: parseInteger(data.id),
      cost: parseNumber(data.cost),
      category: data.category,
      name: data.name,
      brand: data.brand,
      retail_price: parseNumber(data.retail_price),
      department: data.department,
      sku: data.sku,
      distribution_center_id: parseInteger(data.distribution_center_id)
    }));

    // Load Users
    await loadCSVData('./data/users.csv', User, (data) => ({
      id: parseInteger(data.id),
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      age: parseInteger(data.age),
      gender: data.gender,
      state: data.state,
      street_address: data.street_address,
      postal_code: data.postal_code,
      city: data.city,
      country: data.country,
      latitude: parseNumber(data.latitude),
      longitude: parseNumber(data.longitude),
      traffic_source: data.traffic_source,
      created_at: parseDate(data.created_at)
    }));

    // Load Orders
    await loadCSVData('./data/orders.csv', Order, (data) => ({
      order_id: parseInteger(data.order_id),
      user_id: parseInteger(data.user_id),
      status: data.status,
      gender: data.gender,
      created_at: parseDate(data.created_at),
      returned_at: parseDate(data.returned_at),
      shipped_at: parseDate(data.shipped_at),
      delivered_at: parseDate(data.delivered_at),
      num_of_item: parseInteger(data.num_of_item)
    }));

    // Load Order Items
    await loadCSVData('./data/order_items.csv', OrderItem, (data) => ({
      _id: parseInteger(data.id),
      order_id: parseInteger(data.order_id),
      user_id: parseInteger(data.user_id),
      product_id: parseInteger(data.product_id),
      inventory_item_id: parseInteger(data.inventory_item_id),
      status: data.status,
      created_at: parseDate(data.created_at),
      shipped_at: parseDate(data.shipped_at),
      delivered_at: parseDate(data.delivered_at),
      returned_at: parseDate(data.returned_at)
    }));

    // Load Inventory Items
    await loadCSVData('./data/inventory_items.csv', InventoryItem, (data) => ({
      id: parseInteger(data.id),
      product_id: parseInteger(data.product_id),
      created_at: parseDate(data.created_at),
      sold_at: parseDate(data.sold_at),
      cost: parseNumber(data.cost),
      product_category: data.product_category,
      product_name: data.product_name,
      product_brand: data.product_brand,
      product_retail_price: parseNumber(data.product_retail_price),
      product_department: data.product_department,
      product_sku: data.product_sku,
      product_distribution_center_id: parseInteger(data.product_distribution_center_id)
    }));

    console.log('\n🎉 All data loaded successfully!');
    
    // Print summary statistics
    const stats = {
      'Distribution Centers': await DistributionCenter.countDocuments(),
      'Products': await Product.countDocuments(),
      'Users': await User.countDocuments(),
      'Orders': await Order.countDocuments(),
      'Order Items': await OrderItem.countDocuments(),
      'Inventory Items': await InventoryItem.countDocuments()
    };

    console.log('\n📊 Database Summary:');
    Object.entries(stats).forEach(([model, count]) => {
      console.log(`  ${model}: ${count.toLocaleString()} records`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during data loading:', error);
    process.exit(1);
  }
};

// Run the data loading process
loadAllData();