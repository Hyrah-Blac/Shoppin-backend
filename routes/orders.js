const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  const { items, shippingAddress, paymentMethod, mpesaRef, notes } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items in order' });

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user.id,
    items,
    totalAmount,
    shippingAddress,
    paymentMethod: paymentMethod || 'mpesa',
    mpesaRef: mpesaRef || '',
    notes: notes || '',
    paymentStatus: mpesaRef ? 'paid' : 'unpaid',
  });

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(201).json(order);
});

router.get('/my', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'title images')
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'title images price');
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });
  res.json(order);
});

router.get('/', protect, adminOnly, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Order.countDocuments(query);
  res.json({ orders, total });
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;