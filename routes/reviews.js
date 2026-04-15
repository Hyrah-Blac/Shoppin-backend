const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

router.post('/:productId', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const existing = await Review.findOne({
    product: req.params.productId,
    user: req.user.id,
  });
  if (existing) return res.status(400).json({ message: 'Already reviewed' });

  const review = await Review.create({
    product: req.params.productId,
    user: req.user.id,
    rating, comment,
  });

  const reviews = await Review.find({ product: req.params.productId });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(req.params.productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json(review);
});

router.delete('/:id', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Not found' });
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });
  await review.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;