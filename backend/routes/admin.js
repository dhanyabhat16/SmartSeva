const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
const { sendServiceCompletionEmail, sendApplicationStatusEmail, sendGrievanceResolutionEmail } = require('../utils/email');

// All admin routes require admin authentication
router.use(verifyAdmin);

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const deptId = req.role === 'SUPER_ADMIN' ? null : req.deptId;
    
    // Try using stored procedure first
    try {
      const [stats] = await pool.execute('CALL GetDashboardStats(?)', [deptId]);
      // MySQL returns results in array format for CALL
      const statsData = stats[0] && stats[0][0] ? stats[0][0] : stats[0];
      return res.json(statsData);
    } catch (procError) {
      // If stored procedure doesn't exist or fails, use direct query
      console.log('Stored procedure failed, using direct query:', procError.message);
      
      // Build query with optional dept filter
      const deptFilter = deptId ? 'AND s.dept_id = ?' : '';
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE 1=1 ${deptFilter}) AS total_applications,
          (SELECT COUNT(*) FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE a.status = 'PENDING' ${deptFilter}) AS pending_applications,
          (SELECT COUNT(*) FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE a.status = 'DOCUMENTS_VERIFIED' ${deptFilter}) AS documents_verified_applications,
          (SELECT COUNT(*) FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE a.status = 'IN_PROGRESS' ${deptFilter}) AS in_progress_applications,
          (SELECT COUNT(*) FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE a.status = 'COMPLETED' ${deptFilter}) AS completed_applications,
          (SELECT COUNT(*) FROM Grievance g 
           LEFT JOIN Service s ON g.service_id = s.service_id 
           WHERE g.status = 'OPEN' ${deptFilter}) AS open_grievances
      `;

      // If deptId present, each ${deptFilter} results in one placeholder. There are 6 subqueries.
      const params = deptId ? [deptId, deptId, deptId, deptId, deptId, deptId] : [];

      const [stats] = await pool.execute(query, params);
      // stats is an array with one row
      const statsData = stats && stats[0] ? stats[0] : {};
      return res.json(statsData);
    }
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/admin/applications - Get all applications (filtered by department if not super admin)
router.get('/applications', async (req, res) => {
  try {
    const { status } = req.query;
    // parse page & limit as integers to avoid SQL placeholder problems
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 20;
    const deptId = req.role === 'SUPER_ADMIN' ? null : req.deptId;
    const offsetValue = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        a.app_id,
        a.citizen_id,
        c.name AS citizen_name,
        c.email AS citizen_email,
        c.phone AS citizen_phone,
        a.service_id,
        s.service_name,
        d.dept_name,
        a.applied_date,
        a.completion_date,
        a.status,
        a.remark
      FROM Application a
      JOIN Citizen c ON a.citizen_id = c.citizen_id
      JOIN Service s ON a.service_id = s.service_id
      JOIN Department d ON s.dept_id = d.dept_id
      WHERE 1=1
    `;

    const params = [];

    if (deptId) {
      query += ' AND s.dept_id = ?';
      params.push(deptId);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // Ensure numbers for limit & offset; insert directly (safe because they are numeric)
    query += ` ORDER BY a.applied_date DESC LIMIT ${limitNum} OFFSET ${offsetValue}`;

    const [rows] = await pool.execute(query, params);
    
    // Get document and payment info for each application
    const applicationsWithDetails = await Promise.all(
      rows.map(async (app) => {
        const [docs] = await pool.execute(
          'SELECT doc_id, doc_type, verification_status FROM Document WHERE app_id = ?',
          [app.app_id]
        );
        const [payments] = await pool.execute(
          'SELECT payment_id, amount, payment_date, payment_mode, transaction_id, status FROM Payment WHERE app_id = ?',
          [app.app_id]
        );
        
        const allDocsVerified = docs.length > 0 && docs.every(doc => doc.verification_status === 'VERIFIED');
        
        return {
          ...app,
          documents: docs,
          payments: payments,
          all_documents_verified: allDocsVerified,
          has_payment: payments.length > 0
        };
      })
    );

    // Get total count
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM Application a
      JOIN Service s ON a.service_id = s.service_id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (deptId) {
      countQuery += ' AND s.dept_id = ?';
      countParams.push(deptId);
    }
    
    if (status) {
      countQuery += ' AND a.status = ?';
      countParams.push(status);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      applications: applicationsWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/applications/:appId - Get application details
router.get('/applications/:appId', async (req, res) => {
  try {
    const { appId } = req.params;

    // Try using stored procedure first
    try {
      const [result] = await pool.execute('CALL GetApplicationDetails(?)', [appId]);
      const application = result[0] && result[0][0] ? result[0][0] : result[0];

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check department access for non-super admins
      if (req.role !== 'SUPER_ADMIN' && application.dept_id !== req.deptId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get documents
      const [documents] = await pool.execute(
        'SELECT doc_id, doc_type, doc_path, uploaded_date, verification_status FROM Document WHERE app_id = ?',
        [appId]
      );

      // Get payment info
      const [payments] = await pool.execute(
        'SELECT payment_id, amount, payment_date, payment_mode, transaction_id, status FROM Payment WHERE app_id = ?',
        [appId]
      );

      return res.json({
        ...application,
        documents,
        payments,
      });
    } catch (procError) {
      // Fallback to direct query
      console.log('Stored procedure failed, using direct query:', procError.message);
      
      const [appRows] = await pool.execute(
        `SELECT 
          a.app_id,
          a.citizen_id,
          c.name AS citizen_name,
          c.email AS citizen_email,
          a.service_id,
          s.service_name,
          d.dept_name,
          d.dept_id,
          a.applied_date,
          a.completion_date,
          a.status,
          a.remark,
          DATEDIFF(COALESCE(a.completion_date, CURDATE()), a.applied_date) AS days_taken
        FROM Application a
        JOIN Citizen c ON a.citizen_id = c.citizen_id
        JOIN Service s ON a.service_id = s.service_id
        JOIN Department d ON s.dept_id = d.dept_id
        WHERE a.app_id = ?`,
        [appId]
      );

      if (appRows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const application = appRows[0];

      // Check department access for non-super admins
      if (req.role !== 'SUPER_ADMIN' && application.dept_id !== req.deptId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get documents
      const [documents] = await pool.execute(
        'SELECT doc_id, doc_type, doc_path, uploaded_date, verification_status FROM Document WHERE app_id = ?',
        [appId]
      );

      // Get payment info
      const [payments] = await pool.execute(
        'SELECT payment_id, amount, payment_date, payment_mode, transaction_id, status FROM Payment WHERE app_id = ?',
        [appId]
      );

      res.json({
        ...application,
        documents,
        payments,
      });
    }
  } catch (err) {
    console.error('Get application details error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/applications/:appId/status - Update application status
router.put('/applications/:appId/status', async (req, res) => {
  try {
    const { appId } = req.params;
    const { status, remark } = req.body;

    if (!status || !['PENDING', 'DOCUMENTS_VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'DOCUMENT_REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if application exists and get details
    const [appRows] = await pool.execute(
      `SELECT a.*, c.email, c.name, s.service_name, s.dept_id
       FROM Application a
       JOIN Citizen c ON a.citizen_id = c.citizen_id
       JOIN Service s ON a.service_id = s.service_id
       WHERE a.app_id = ?`,
      [appId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = appRows[0];

    // Check department access for non-super admins
    if (req.role !== 'SUPER_ADMIN' && application.dept_id !== req.deptId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const oldStatus = application.status;

    // Use stored procedure UpdateApplicationStatus if available, otherwise direct update
    try {
      // Try using stored procedure
      await pool.execute(
        'CALL UpdateApplicationStatus(?, ?, ?, @email_sent)',
        [appId, status, remark || application.remark || '']
      );
      
      // Get the output parameter
      const [output] = await pool.execute('SELECT @email_sent AS email_sent');
      const emailSentFlag = output && output[0] ? output[0].email_sent : null;
      console.log('Stored procedure executed, email_sent flag:', emailSentFlag);
      
      // If procedure didn't handle completion_date, update it manually
      if (status === 'COMPLETED') {
        await pool.execute(
          'UPDATE Application SET completion_date = CURDATE() WHERE app_id = ?',
          [appId]
        );
      }
    } catch (procError) {
      // Fallback to direct update if stored procedure doesn't exist
      console.log('Stored procedure failed, using direct update:', procError.message);
      await pool.execute(
        `UPDATE Application 
         SET status = ?, 
             remark = COALESCE(?, remark),
             completion_date = IF(?, CURDATE(), completion_date)
         WHERE app_id = ?`,
        [status, remark || null, status === 'COMPLETED', appId]
      );
      console.log(`Application ${appId} status updated to ${status} via direct query`);
    }

    // Send email notification if status changed
    let emailSent = false;
    let emailError = null;
    
    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      try {
        console.log(`Sending completion email to ${application.email} for application ${appId}`);
        const emailResult = await sendServiceCompletionEmail(
          application.email,
          application.name,
          application.service_name,
          appId,
          remark || ''
        );
        emailSent = emailResult.success;
        if (!emailResult.success) {
          emailError = emailResult.error || 'Unknown email error';
          console.error('Email sending failed:', emailError);
        } else {
          console.log('Completion email sent successfully');
        }
      } catch (emailErr) {
        console.error('Failed to send completion email:', emailErr);
        emailError = emailErr.message;
      }
    } else if (status !== oldStatus && status !== 'PENDING') {
      // Send status update email for other status changes (except PENDING)
      try {
        console.log(`Sending status update email to ${application.email} for application ${appId}`);
        const emailResult = await sendApplicationStatusEmail(
          application.email,
          application.name,
          application.service_name,
          status,
          remark || ''
        );
        emailSent = emailResult.success;
        if (!emailResult.success) {
          emailError = emailResult.error || 'Unknown email error';
          console.error('Email sending failed:', emailError);
        } else {
          console.log('Status update email sent successfully');
        }
      } catch (emailErr) {
        console.error('Failed to send status update email:', emailErr);
        emailError = emailErr.message;
      }
    }

    res.json({
      success: true,
      message: 'Application status updated successfully' + (emailSent ? '. Email notification sent.' : emailError ? '. Email notification failed (check SMTP configuration).' : ''),
      appId,
      oldStatus,
      newStatus: status,
      emailSent,
      emailError: emailError || null,
    });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/pending-documents - Get pending documents
router.get('/pending-documents', async (req, res) => {
  try {
    const deptId = req.role === 'SUPER_ADMIN' ? null : req.deptId;

    // Use stored procedure
    const [result] = await pool.execute('CALL GetPendingDocuments(?)', [deptId]);
    const documents = result[0] || [];

    res.json(documents);
  } catch (err) {
    console.error('Get pending documents error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/documents/:docId/verify - Verify/reject document
router.put('/documents/:docId/verify', async (req, res) => {
  try {
    const { docId } = req.params;
    const { verification_status, remark } = req.body;

    if (!verification_status || !['VERIFIED', 'REJECTED'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    // Get document with application and service info
    const [docRows] = await pool.execute(
      `SELECT d.*, s.dept_id
       FROM Document d
       JOIN Application a ON d.app_id = a.app_id
       JOIN Service s ON a.service_id = s.service_id
       WHERE d.doc_id = ?`,
      [docId]
    );

    if (docRows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check department access for non-super admins
    if (req.role !== 'SUPER_ADMIN' && docRows[0].dept_id !== req.deptId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const document = docRows[0];
    
    // Update document verification status
    await pool.execute(
      'UPDATE Document SET verification_status = ? WHERE doc_id = ?',
      [verification_status, docId]
    );

    // If document is verified, check if all documents for this application are verified
    if (verification_status === 'VERIFIED') {
      // Check if all documents for this application are verified
      const [allDocs] = await pool.execute(
        'SELECT verification_status FROM Document WHERE app_id = ?',
        [document.app_id]
      );
      
      const allVerified = allDocs.length > 0 && allDocs.every(doc => doc.verification_status === 'VERIFIED');
      
      if (allVerified) {
        // Get application details to check if it needs payment
        const [appDetails] = await pool.execute(
          `SELECT a.*, s.fee 
           FROM Application a 
           JOIN Service s ON a.service_id = s.service_id 
           WHERE a.app_id = ?`,
          [document.app_id]
        );
        
        if (appDetails.length > 0 && appDetails[0].fee > 0) {
          // Check if payment already exists
          const [existingPayment] = await pool.execute(
            'SELECT payment_id FROM Payment WHERE app_id = ?',
            [document.app_id]
          );
          
          // If no payment exists and fee > 0, update status to allow payment
          if (existingPayment.length === 0 && appDetails[0].status === 'PENDING') {
            await pool.execute(
              'UPDATE Application SET status = ? WHERE app_id = ?',
              ['DOCUMENTS_VERIFIED', document.app_id]
            );
          }
        } else if (appDetails[0].status === 'PENDING') {
          // If no fee, can proceed directly to IN_PROGRESS
          await pool.execute(
            'UPDATE Application SET status = ? WHERE app_id = ?',
            ['IN_PROGRESS', document.app_id]
          );
        }
      }
    } else if (verification_status === 'REJECTED') {
      // If document is rejected, update application status
      await pool.execute(
        'UPDATE Application SET status = ? WHERE app_id = ?',
        ['DOCUMENT_REJECTED', document.app_id]
      );
    }

    res.json({
      success: true,
      message: `Document ${verification_status.toLowerCase()}`,
      docId,
      verification_status,
      appId: document.app_id,
    });
  } catch (err) {
    console.error('Verify document error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/grievances - Get grievances
router.get('/grievances', async (req, res) => {
  try {
    const { status } = req.query;
    const deptId = req.role === 'SUPER_ADMIN' ? null : req.deptId;

    let query = `
      SELECT 
        g.grievance_id,
        g.citizen_id,
        c.name AS citizen_name,
        c.email AS citizen_email,
        g.service_id,
        s.service_name,
        d.dept_name,
        g.description,
        g.status,
        g.created_date,
        g.resolved_date,
        g.resolution_remark
      FROM Grievance g
      JOIN Citizen c ON g.citizen_id = c.citizen_id
      LEFT JOIN Service s ON g.service_id = s.service_id
      LEFT JOIN Department d ON s.dept_id = d.dept_id
      WHERE 1=1
    `;

    const params = [];

    if (deptId) {
      query += ' AND s.dept_id = ?';
      params.push(deptId);
    }

    if (status) {
      query += ' AND g.status = ?';
      params.push(status);
    }

    query += ' ORDER BY g.created_date DESC';

    const [rows] = await pool.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error('Get grievances error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/grievances/:grievanceId/resolve - Resolve grievance
router.put('/grievances/:grievanceId/resolve', async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { resolution_remark } = req.body;

    // Get grievance with citizen and service info
    const [grievanceRows] = await pool.execute(
      `SELECT g.*, c.email AS citizen_email, c.name AS citizen_name, s.dept_id, s.service_name
       FROM Grievance g
       JOIN Citizen c ON g.citizen_id = c.citizen_id
       LEFT JOIN Service s ON g.service_id = s.service_id
       WHERE g.grievance_id = ?`,
      [grievanceId]
    );

    if (grievanceRows.length === 0) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const grievance = grievanceRows[0];

    // Check department access for non-super admins
    if (req.role !== 'SUPER_ADMIN' && grievance.dept_id !== req.deptId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update grievance
    await pool.execute(
      `UPDATE Grievance 
       SET status = 'RESOLVED',
           resolved_date = CURDATE(),
           resolution_remark = ?
       WHERE grievance_id = ?`,
      [resolution_remark || '', grievanceId]
    );

    // Send email notification
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log(`Sending grievance resolution email to ${grievance.citizen_email} for grievance ${grievanceId}`);
      const emailResult = await sendGrievanceResolutionEmail(
        grievance.citizen_email,
        grievance.citizen_name,
        grievance.service_name || 'General',
        grievanceId,
        resolution_remark || ''
      );
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error || 'Unknown email error';
        console.error('Email sending failed:', emailError);
      } else {
        console.log('Grievance resolution email sent successfully');
      }
    } catch (emailErr) {
      console.error('Failed to send grievance resolution email:', emailErr);
      emailError = emailErr.message;
    }

    res.json({
      success: true,
      message: 'Grievance resolved successfully' + (emailSent ? '. Email notification sent.' : emailError ? '. Email notification failed (check SMTP configuration).' : ''),
      grievanceId,
      emailSent,
      emailError: emailError || null,
    });
  } catch (err) {
    console.error('Resolve grievance error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/profile - Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        c.citizen_id,
        c.name,
        c.email,
        c.phone,
        a.admin_id,
        a.dept_id,
        a.role,
        d.dept_name
       FROM Admin a
       JOIN Citizen c ON a.citizen_id = c.citizen_id
       LEFT JOIN Department d ON a.dept_id = d.dept_id
       WHERE a.citizen_id = ?`,
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/departments - Get departments (super admin only for management, but allow dept admins to see their dept)
router.get('/departments', async (req, res) => {
  try {
    let query = 'SELECT dept_id, dept_name, contact_email, contact_phone FROM Department';
    const params = [];

    if (req.role !== 'SUPER_ADMIN') {
      query += ' WHERE dept_id = ?';
      params.push(req.deptId);
    }

    query += ' ORDER BY dept_name';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
