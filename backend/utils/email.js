const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter for email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '', // Use App Password for Gmail
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email service configuration error:', error);
    console.log('Note: Email notifications will not work until SMTP is configured.');
  } else {
    console.log('Email service is ready to send emails');
  }
});

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Email plain text content (optional)
 */
const sendEmail = async (to, subject, html, text = '') => {
  try {
    // If SMTP is not configured, just log the email
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('=== EMAIL NOTIFICATION (SMTP not configured) ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html);
      console.log('===============================================');
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send service completion notification to citizen
 * @param {string} citizenEmail - Citizen's email address
 * @param {string} citizenName - Citizen's name
 * @param {string} serviceName - Service name
 * @param {string} applicationId - Application ID
 * @param {string} remark - Optional remark
 */
const sendServiceCompletionEmail = async (citizenEmail, citizenName, serviceName, applicationId, remark = '') => {
  const subject = `Your ${serviceName} Application Has Been Completed - SmartSeva`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0b5ed7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0b5ed7; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background: #0b5ed7; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartSeva</h1>
        </div>
        <div class="content">
          <h2>Application Completed!</h2>
          <p>Dear ${citizenName},</p>
          <p>We are pleased to inform you that your service application has been successfully completed.</p>
          
          <div class="info-box">
            <h3>Application Details</h3>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Application ID:</strong> #${applicationId}</p>
            <p><strong>Status:</strong> COMPLETED</p>
            ${remark ? `<p><strong>Remark:</strong> ${remark}</p>` : ''}
          </div>
          
          <p>You can view your application details by logging into your SmartSeva dashboard.</p>
          
          <p>Thank you for using SmartSeva services!</p>
          
          <p>Best regards,<br>SmartSeva Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${citizenName},

We are pleased to inform you that your service application has been successfully completed.

Application Details:
- Service: ${serviceName}
- Application ID: #${applicationId}
- Status: COMPLETED
${remark ? `- Remark: ${remark}` : ''}

You can view your application details by logging into your SmartSeva dashboard.

Thank you for using SmartSeva services!

Best regards,
SmartSeva Team
  `;

  return await sendEmail(citizenEmail, subject, html, text);
};

/**
 * Send application status update email
 */
const sendApplicationStatusEmail = async (citizenEmail, citizenName, serviceName, status, remark = '') => {
  const subject = `Application Status Update - ${serviceName} - SmartSeva`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0b5ed7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0b5ed7; }
        .status { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .status-PENDING { background: #ffc107; color: #000; }
        .status-IN_PROGRESS { background: #17a2b8; color: #fff; }
        .status-COMPLETED { background: #28a745; color: #fff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartSeva</h1>
        </div>
        <div class="content">
          <h2>Application Status Update</h2>
          <p>Dear ${citizenName},</p>
          <p>Your application status has been updated.</p>
          
          <div class="info-box">
            <h3>Application Details</h3>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Status:</strong> <span class="status status-${status}">${status}</span></p>
            ${remark ? `<p><strong>Remark:</strong> ${remark}</p>` : ''}
          </div>
          
          <p>You can view your application details by logging into your SmartSeva dashboard.</p>
          
          <p>Best regards,<br>SmartSeva Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(citizenEmail, subject, html);
};

/**
 * Send grievance resolution notification to citizen
 * @param {string} citizenEmail - Citizen's email address
 * @param {string} citizenName - Citizen's name
 * @param {string} serviceName - Service name (optional)
 * @param {string} grievanceId - Grievance ID
 * @param {string} resolutionRemark - Resolution remark
 */
const sendGrievanceResolutionEmail = async (citizenEmail, citizenName, serviceName, grievanceId, resolutionRemark = '') => {
  const subject = `Your Grievance Has Been Resolved - SmartSeva`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartSeva</h1>
        </div>
        <div class="content">
          <h2>Grievance Resolved!</h2>
          <p>Dear ${citizenName},</p>
          <p>We are pleased to inform you that your grievance has been resolved.</p>
          
          <div class="info-box">
            <h3>Grievance Details</h3>
            <p><strong>Grievance ID:</strong> #${grievanceId}</p>
            ${serviceName ? `<p><strong>Service:</strong> ${serviceName}</p>` : ''}
            <p><strong>Status:</strong> RESOLVED</p>
            ${resolutionRemark ? `<p><strong>Resolution:</strong> ${resolutionRemark}</p>` : ''}
          </div>
          
          <p>You can view your grievance details by logging into your SmartSeva dashboard.</p>
          
          <p>Thank you for your patience and for using SmartSeva services!</p>
          
          <p>Best regards,<br>SmartSeva Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${citizenName},

We are pleased to inform you that your grievance has been resolved.

Grievance Details:
- Grievance ID: #${grievanceId}
${serviceName ? `- Service: ${serviceName}` : ''}
- Status: RESOLVED
${resolutionRemark ? `- Resolution: ${resolutionRemark}` : ''}

You can view your grievance details by logging into your SmartSeva dashboard.

Thank you for your patience and for using SmartSeva services!

Best regards,
SmartSeva Team
  `;

  return await sendEmail(citizenEmail, subject, html, text);
};

module.exports = {
  sendEmail,
  sendServiceCompletionEmail,
  sendApplicationStatusEmail,
  sendGrievanceResolutionEmail,
};

