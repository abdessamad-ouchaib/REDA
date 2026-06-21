const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'الرجاء إدخال اسم المستخدم وكلمة المرور.' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ في الخادم.', error: err.message });
  }
});

module.exports = router;
