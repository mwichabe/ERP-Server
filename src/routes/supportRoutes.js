const express = require('express');
const nodemailer = require('nodemailer');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/support/access-request
 * Sends an email to the administrator requesting dashboard access
 * Body: { message?: string }
 */
router.post('/access-request', async (req, res) => {
  try {
    const adminEmail = process.env.SUPPORT_EMAIL_TO || 'mwichabecollins@gmail.com';
    const { message = '', requestedAccess } = req.body || {};
    const { user } = req; // set by authMiddleware
    
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Configure SMTP transport (Gmail or custom SMTP)
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal test account for development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: 'Access Request: ERP Dashboard',
      text:
`Hello Admin,

The following user has requested access to additional dashboards.

Name: ${user?.name || 'Unknown'}
Email: ${user?.email || 'Unknown'}
User ID: ${user?.id || 'Unknown'}
Current Role: ${user?.role || 'Unknown'}
Requested Access: ${requestedAccess || 'Not specified'}

Reason:
${message || '(no message provided)'}

Sent at: ${new Date().toISOString()}
`,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
    return res.json({ message: 'Access request sent successfully', previewUrl });
  } catch (error) {
    console.error('Error sending access request email:', error);
    return res.status(500).json({ error: 'Failed to send access request' });
  }
});

module.exports = router;


