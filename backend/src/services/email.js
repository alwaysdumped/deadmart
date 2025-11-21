import nodemailer from 'nodemailer';
import config from '../config/env.js';

// Create transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP)
  // For production, use real SMTP credentials from .env
  
  if (!config.email.user || !config.email.password) {
    console.warn('⚠️  Email credentials not configured. Using console logging for OTPs.');
    console.warn('   Missing:', {
      user: !config.email.user ? 'EMAIL_USER' : '✓',
      password: !config.email.password ? 'EMAIL_PASSWORD' : '✓',
      host: !config.email.host ? 'EMAIL_HOST' : '✓',
      port: !config.email.port ? 'EMAIL_PORT' : '✓'
    });
    return null;
  }

  console.log('📧 Email configuration loaded:', {
    host: config.email.host,
    port: config.email.port,
    user: config.email.user,
    secure: config.email.port === 465
  });

  return nodemailer.createTransporter({
    host: config.email.host,
    port: parseInt(config.email.port),
    secure: config.email.port == 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
    tls: {
      rejectUnauthorized: false // For development/testing
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const transporter = createTransporter();

  // If no transporter, log to console (development mode)
  if (!transporter) {
    console.log(`\n📧 OTP Email (Console Mode):`);
    console.log(`   To: ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   This OTP will expire in 5 minutes.\n`);
    return { success: true, mode: 'console' };
  }

  const mailOptions = {
    from: `"Live MART" <${config.email.user}>`,
    to: email,
    subject: 'Your OTP for Live MART Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #059669; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Live MART</h1>
            <p>Your One-Stop Online Delivery System</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with Live MART. To complete your registration, please use the following One-Time Password (OTP):</p>
            <div class="otp-box">${otp}</div>
            <p><strong>This OTP will expire in 5 minutes.</strong></p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>Best regards,<br>The Live MART Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Live MART. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log(`📤 Attempting to send OTP email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, mode: 'email', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Return more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your EMAIL_USER and EMAIL_PASSWORD.');
    } else if (error.code === 'ESOCKET') {
      throw new Error('Cannot connect to email server. Please check EMAIL_HOST and EMAIL_PORT.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Email server connection timeout. Please check your network or firewall.');
    } else {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
};
