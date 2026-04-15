const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      phone: { type: String, default: '' },
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);