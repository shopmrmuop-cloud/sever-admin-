const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      code: 'NO_TOKEN',
      message: 'Thiếu Authorization Bearer token'
    });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Token hết hạn hoặc không hợp lệ'
    });
  }
}

module.exports = authMiddleware;
