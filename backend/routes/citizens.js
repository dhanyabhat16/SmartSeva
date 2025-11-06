const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
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

module.exports = router;
