const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null },
  },
  { timestamps: true }
);

saveSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Save', saveSchema);