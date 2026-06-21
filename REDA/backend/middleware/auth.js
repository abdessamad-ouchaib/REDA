const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'الرجاء تسجيل الدخول أولاً.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'جلسة الدخول غير صالحة أو منتهية، الرجاء تسجيل الدخول من جديد.' });
  }
}

module.exports = requireAuth;
