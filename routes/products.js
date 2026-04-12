const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (category && category !== 'all') query.category = category;

  const products = await Product.find(query)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('user', 'name avatar bio');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.post('/', protect, async (req, res) => {
  const { title, description, price, images, tags, category, link } = req.body;
  if (!title || !price || !images?.length)
    return res.status(400).json({ message: 'Title, price and image required' });

  const product = await Product.create({
    title, description, price, images, tags, category, link,
    user: req.user.id,
  });
  await product.populate('user', 'name avatar');
  res.status(201).json(product);
});

router.put('/:id', protect, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (product.user.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your product' });

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

router.delete('/:id', protect, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  if (product.user.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your product' });

  await product.deleteOne();
  res.json({ message: 'Deleted' });
});

router.get('/user/:userId', async (req, res) => {
  const products = await Product.find({ user: req.params.userId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(products);
});

module.exports = router;