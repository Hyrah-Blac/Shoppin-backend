const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ url: String, publicId: String }],
    tags: [{ type: String, lowercase: true }],
    category: { type: String, default: 'general' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    savesCount: { type: Number, default: 0 },
    link: { type: String, default: '' },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', tags: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);