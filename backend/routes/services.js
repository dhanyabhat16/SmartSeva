const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req,res) => {
  try{
    const [rows] = await pool.query('SELECT service_id, service_name, description, fee, processing_days, dept_id FROM Service');
    res.json(rows);
  }catch(e){
    console.error(e);
    res.status(500).json({error:'Server error'});
  }
});

module.exports = router;
