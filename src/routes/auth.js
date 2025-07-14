const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, findUserById, updateUserPreferences } = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register route
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await createUser({ email, password, name });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// JWT middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Profile get/update
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    await updateUserPreferences(req.user.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

module.exports = router;
