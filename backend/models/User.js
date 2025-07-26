const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // <-- CSV ID (e.g., "U123456")
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  state: { type: String },
  street_address: { type: String },
  postal_code: { type: String },
  city: { type: String },
  country: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  traffic_source: { type: String },
  created_at: { type: Date, required: true }
});

module.exports = mongoose.model('User', userSchema);
