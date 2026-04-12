const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const { protect } = require('../middleware/auth');

router.get('/my', protect, async (req, res) => {
  const boards = await Board.find({ user: req.user.id }).populate('products');
  res.json(boards);
});

router.get('/user/:userId', async (req, res) => {
  const boards = await Board.find({ user: req.params.userId, isPrivate: false })
    .populate('products', 'images title price');
  res.json(boards);
});

router.get('/:id', async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('products')
    .populate('user', 'name avatar');
  if (!board) return res.status(404).json({ message: 'Not found' });
  res.json(board);
});

router.post('/', protect, async (req, res) => {
  const { name, description, isPrivate } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const board = await Board.create({ name, description, isPrivate, user: req.user.id });
  res.status(201).json(board);
});

router.put('/:id/add-product', protect, async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Not found' });
  if (board.user.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your board' });

  const { productId } = req.body;
  if (!board.products.includes(productId)) {
    board.products.push(productId);
    if (!board.coverImage && req.body.imageUrl) board.coverImage = req.body.imageUrl;
    await board.save();
  }
  res.json(board);
});

router.put('/:id/remove-product', protect, async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Not found' });
  if (board.user.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your board' });

  board.products = board.products.filter(
    (p) => p.toString() !== req.body.productId
  );
  await board.save();
  res.json(board);
});

router.delete('/:id', protect, async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ message: 'Not found' });
  if (board.user.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not your board' });
  await board.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;