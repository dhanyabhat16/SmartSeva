const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT dept_id, dept_name, contact_email, contact_phone FROM Department');
    res.json(rows);
  } catch(err){
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

// GET /api/departments/:id/services  (delegates to service query)
router.get('/:id/services', async (req, res) => {
  try{
    const deptId = req.params.id;
    const [rows] = await pool.query('SELECT service_id, service_name, description, fee, processing_days FROM Service WHERE dept_id = ?', [deptId]);
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({error:'Server error'});
  }
});

module.exports = router;
