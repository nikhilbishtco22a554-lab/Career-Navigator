const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: true, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: true, message: 'User already exists.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, skills: user.skills, targetRole: user.targetRole },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid credentials.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: true, message: 'Invalid credentials.' });
    }

    const token = signToken(user._id);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, skills: user.skills, targetRole: user.targetRole },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Login failed.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Unable to fetch user.' });
  }
};
