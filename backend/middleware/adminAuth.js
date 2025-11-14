const jwt = require('jsonwebtoken');
const pool = require('../db');

/**
 * Middleware to verify admin token and check if user is admin
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.id;

    // Check if user is admin
    const [adminRows] = await pool.execute(
      'SELECT admin_id, citizen_id, dept_id, role FROM Admin WHERE citizen_id = ?',
      [userId]
    );

    if (adminRows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Attach admin info to request
    req.adminId = adminRows[0].admin_id;
    req.userId = userId;
    req.deptId = adminRows[0].dept_id;
    req.role = adminRows[0].role;

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Admin auth error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Middleware to check if admin is SUPER_ADMIN
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
  }
  next();
};

module.exports = {
  verifyAdmin,
  requireSuperAdmin,
};

