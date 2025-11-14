const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// GET /api/grievances - Get user's grievances
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT g.* , s.service_name FROM Grievance g LEFT JOIN Service s ON g.service_id = s.service_id WHERE g.citizen_id = ? ORDER BY created_date DESC', [req.userId]);
    res.json(rows);
  } catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

// POST /api/grievances
router.post('/', verifyToken, async (req, res) => {
  try {
    const { service_id, description } = req.body;
    const created_date = new Date().toISOString().slice(0,10);
    const [r] = await pool.query('INSERT INTO Grievance (citizen_id, service_id, description, status, created_date) VALUES (?, ?, ?, ?, ?)', [req.userId, service_id, description, 'OPEN', created_date]);
    res.json({ grievance_id: r.insertId, message: 'Grievance created' });
  } catch(err){ console.error(err); res.status(500).json({error:'Server error'}); }
});

module.exports = router;
