import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_workpulse_jwt_key_2026', {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password, role, department, designation, weeklyTargetHours, managerId } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : null;
    const cleanEmail = email ? email.trim().toLowerCase() : (cleanUsername ? `${cleanUsername}@workpulse.local` : null);

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Please provide a username or email' });
    }

    // Extract company domain from email (e.g. name@company.com -> company.com)
    const emailParts = cleanEmail.split('@');
    const companyDomain = emailParts.length > 1 ? emailParts[1].toLowerCase().trim() : 'workpulse.com';
    const rawCompanyName = companyDomain.split('.')[0] || 'Company';
    const companyName = rawCompanyName.charAt(0).toUpperCase() + rawCompanyName.slice(1);

    // Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check duplicate username if provided
    if (cleanUsername) {
      const existingUser = await User.findOne({ username: cleanUsername });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
      }
    }

    const displayName = (name && name.trim()) || cleanUsername || cleanEmail.split('@')[0];

    const user = await User.create({
      name: displayName,
      username: cleanUsername || undefined,
      email: cleanEmail,
      password,
      role: role || 'employee',
      department: department || 'Engineering',
      designation: designation || (role === 'admin' ? 'Administrator' : role === 'manager' ? 'Team Lead' : 'Software Engineer'),
      weeklyTargetHours: weeklyTargetHours || 40,
      managerId: managerId || null,
      companyDomain,
      companyName,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        weeklyTargetHours: user.weeklyTargetHours,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        companyDomain: user.companyDomain,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, identifier, password } = req.body;
    const loginIdentifier = (username || email || identifier || '').trim().toLowerCase();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your username/email and password' });
    }

    // Query user by username OR email
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        weeklyTargetHours: user.weeklyTargetHours,
        managerId: user.managerId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        companyDomain: user.companyDomain,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('managerId', 'name email designation');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit and update profile (DP, phone, bio, details)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, username, phone, bio, avatar, designation, department } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This username is already taken by another user' });
      }
      user.username = cleanUsername;
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (designation && designation.trim()) user.designation = designation.trim();
    if (department && department.trim()) user.department = department.trim();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        weeklyTargetHours: user.weeklyTargetHours,
        managerId: user.managerId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        companyDomain: user.companyDomain,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get colleagues: strictly scoped to same company domain
export const getAllUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const filter = {
      isActive: true,
      companyDomain: req.user.companyDomain,
    };
    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter)
      .select('-password')
      .populate('managerId', 'name email')
      .sort({ name: 1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
