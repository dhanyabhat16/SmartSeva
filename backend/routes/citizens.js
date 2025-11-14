const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      dob,
      gender,
      age,
      phone,
      email,
      aadhaar,
      address,
      pin,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    if (!/^[0-9]{12}$/.test(aadhaar || '')) {
      return res.status(400).json({ error: 'Aadhaar must be 12 digits' });
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    if (pin && !/^[0-9]{6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 6 digits' });
    }
    const [existing] = await pool.execute(
      'SELECT citizen_id FROM Citizen WHERE aadhaar = ? OR email = ? LIMIT 1',
      [aadhaar, email]
    );
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Citizen with same Aadhaar or email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO Citizen (name, dob, gender, age, phone, email, aadhaar, address, pin, password) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name, dob || null, gender || null, age || null, phone || null, email, aadhaar, address || null, pin || null, hashed]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const [rows] = await pool.execute(
      'SELECT citizen_id, email, password FROM Citizen WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.citizen_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT citizen_id, name, email, phone, address, pin FROM Citizen WHERE citizen_id = ?',
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;