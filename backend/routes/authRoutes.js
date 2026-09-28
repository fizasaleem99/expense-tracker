const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

function sendToken(res, userId) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOptions());
}

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

router.post('/register', async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with this email already exists. Try logging in.' });

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  sendToken(res, user._id);
  res.status(201).json(publicUser(user));
});

router.post('/login', async (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const user = email && (await User.findOne({ email }));
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) return res.status(401).json({ message: 'Incorrect email or password.' });

  sendToken(res, user._id);
  res.json(publicUser(user));
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('name email');
  if (!user) {
    res.clearCookie('token', cookieOptions());
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(publicUser(user));
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.json({ message: 'Logged out' });
});

module.exports = router;
