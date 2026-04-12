const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

router.put('/me', protect, async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio });
});

module.exports = router;