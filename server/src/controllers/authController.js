import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medistore_jwt_secure_secret_key_2026_xyz987', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Restrict admin creation from public endpoint unless no admin exists
    let assignedRole = 'customer';
    if (role === 'pharmacist' || role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        assignedRole = role; // First user can be admin
      } else if (req.user && req.user.role === 'admin') {
        assignedRole = role;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: assignedRole,
      address: address || {}
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
