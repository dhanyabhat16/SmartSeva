const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const verifyToken = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// GET /api/applications - Get user's applications
router.get('/', verifyToken, async (req, res) => {
  try {
    // Use stored procedure GetCitizenApplications
    try {
      const [result] = await pool.execute('CALL GetCitizenApplications(?)', [req.userId]);
      const applications = result[0];
      
      // Also get document verification status for each application
      const applicationsWithDocs = await Promise.all(
        applications.map(async (app) => {
          const [docs] = await pool.execute(
            'SELECT doc_id, doc_type, verification_status FROM Document WHERE app_id = ?',
            [app.app_id]
          );
          
          const allDocsVerified = docs.length > 0 && docs.every(doc => doc.verification_status === 'VERIFIED');
          const hasRejectedDocs = docs.some(doc => doc.verification_status === 'REJECTED');
          const hasPendingDocs = docs.some(doc => doc.verification_status === 'PENDING');
          
          return {
            ...app,
            documents: docs,
            all_documents_verified: allDocsVerified,
            has_rejected_documents: hasRejectedDocs,
            has_pending_documents: hasPendingDocs,
            can_pay: (app.status === 'DOCUMENTS_VERIFIED' || (allDocsVerified && app.status === 'PENDING' && app.fee > 0))
          };
        })
      );
      
      res.json(applicationsWithDocs);
    } catch (procError) {
      // Fallback to direct query if stored procedure doesn't exist
      console.log('Stored procedure failed, using direct query:', procError.message);
      const [rows] = await pool.query(
        `SELECT a.app_id, a.citizen_id, a.service_id, s.service_name, s.fee, a.applied_date, a.completion_date, a.status, a.remark,
                p.status AS payment_status, p.transaction_id
         FROM Application a
         LEFT JOIN Service s ON a.service_id = s.service_id
         LEFT JOIN Payment p ON a.app_id = p.app_id
         WHERE a.citizen_id = ? ORDER BY a.applied_date DESC`, 
        [req.userId]
      );
      
      // Get document status for each application
      const applicationsWithDocs = await Promise.all(
        rows.map(async (app) => {
          const [docs] = await pool.execute(
            'SELECT doc_id, doc_type, verification_status FROM Document WHERE app_id = ?',
            [app.app_id]
          );
          
          const allDocsVerified = docs.length > 0 && docs.every(doc => doc.verification_status === 'VERIFIED');
          
          return {
            ...app,
            documents: docs,
            all_documents_verified: allDocsVerified,
            can_pay: (app.status === 'DOCUMENTS_VERIFIED' || (allDocsVerified && app.status === 'PENDING' && app.fee > 0))
          };
        })
      );
      
      res.json(applicationsWithDocs);
    }
  } catch(err) { 
    console.error(err); 
    res.status(500).json({error:'Server error'}); 
  }
});

// POST /api/applications  { service_id }
router.post('/', verifyToken, async (req, res) => {
  try{
    const { service_id } = req.body;
    const applied_date = new Date().toISOString().slice(0,10);
    const [result] = await pool.query('INSERT INTO Application (citizen_id, service_id, applied_date, status) VALUES (?, ?, ?, ?)', [req.userId, service_id, applied_date, 'PENDING']);
    res.json({ app_id: result.insertId, message: 'Application created' });
  }catch(err){
    console.error(err); res.status(500).json({error:'Server error'});
  }
});

// POST /api/applications/:appId/documents  (multipart)
router.post('/:appId/documents', verifyToken, upload.single('doc'), async (req, res) => {
  try{
    const appId = req.params.appId;
    const docType = req.body.doc_type || 'Unknown';
    const docPath = req.file ? `/uploads/${req.file.filename}` : null;
    const uploaded_date = new Date().toISOString().slice(0,10);
    const [result] = await pool.query('INSERT INTO Document (app_id, doc_type, doc_path, uploaded_date, verification_status) VALUES (?, ?, ?, ?, ?)', [appId, docType, docPath, uploaded_date, 'PENDING']);
    res.json({ doc_id: result.insertId, path: docPath });
  }catch(err){
    console.error(err); res.status(500).json({error:'Server error'});
  }
});

// POST /api/applications/:appId/pay  (mock)
router.post('/:appId/pay', verifyToken, async (req, res) => {
  try{
    const appId = req.params.appId;
    const { amount, payment_mode } = req.body;
    
    // Verify application belongs to user
    const [appRows] = await pool.execute(
      `SELECT a.*, s.fee 
       FROM Application a 
       JOIN Service s ON a.service_id = s.service_id 
       WHERE a.app_id = ? AND a.citizen_id = ?`,
      [appId, req.userId]
    );
    
    if (appRows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = appRows[0];
    
    // Check if documents are verified (if documents exist)
    const [docs] = await pool.execute(
      'SELECT verification_status FROM Document WHERE app_id = ?',
      [appId]
    );
    
    if (docs.length > 0) {
      const allVerified = docs.every(doc => doc.verification_status === 'VERIFIED');
      if (!allVerified) {
        return res.status(400).json({ 
          error: 'Cannot proceed to payment. Please wait for document verification.' 
        });
      }
    }
    
    // Check if payment is allowed based on status
    if (application.status !== 'DOCUMENTS_VERIFIED' && application.status !== 'PENDING') {
      if (application.status === 'IN_PROGRESS' || application.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Payment already processed for this application' });
      }
      return res.status(400).json({ error: 'Application is not ready for payment' });
    }
    
    const payment_date = new Date().toISOString().slice(0,10);
    const transaction_id = `TXN${Date.now()}${Math.floor(Math.random()*1000)}`;
    
    // Insert payment
    const [result] = await pool.execute(
      'INSERT INTO Payment (app_id, amount, payment_date, payment_mode, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)', 
      [appId, amount || application.fee, payment_date, payment_mode, transaction_id, 'SUCCESS']
    );
    
    // Update application status to IN_PROGRESS after payment
    await pool.execute(
      'UPDATE Application SET status = ? WHERE app_id = ?', 
      ['IN_PROGRESS', appId]
    );
    
    res.json({ 
      payment_id: result.insertId, 
      transaction_id,
      message: 'Payment successful. Application is now in progress.'
    });
  } catch(err) { 
    console.error(err); 
    res.status(500).json({error:'Server error'}); 
  }
});

module.exports = router;
