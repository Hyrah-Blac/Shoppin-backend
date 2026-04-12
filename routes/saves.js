const express = require('express');
const router = express.Router();
const Save = require('../models/Save');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  const { productId, boardId } = req.body;
  const exists = await Save.findOne({ user: req.user.id, product: productId });
  if (exists) return res.status(400).json({ message: 'Already saved' });

  const save = await Save.create({ user: req.user.id, product: productId, board: boardId });
  await Product.findByIdAndUpdate(productId, { $inc: { savesCount: 1 } });
  res.status(201).json(save);
});

router.delete('/:productId', protect, async (req, res) => {
  const save = await Save.findOneAndDelete({
    user: req.user.id,
    product: req.params.productId,
  });
  if (!save) return res.status(404).json({ message: 'Save not found' });
  await Product.findByIdAndUpdate(req.params.productId, { $inc: { savesCount: -1 } });
  res.json({ message: 'Unsaved' });
});

router.get('/my', protect, async (req, res) => {
  const saves = await Save.find({ user: req.user.id })
    .populate({ path: 'product', populate: { path: 'user', select: 'name avatar' } });
  res.json(saves);
});

router.get('/check/:productId', protect, async (req, res) => {
  const save = await Save.findOne({ user: req.user.id, product: req.params.productId });
  res.json({ saved: !!save });
});

module.exports = router;