
// backend/models/DistributionCenter.js
const mongoose = require('mongoose');

const distributionCenterSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

module.exports = mongoose.model('DistributionCenter', distributionCenterSchema);
