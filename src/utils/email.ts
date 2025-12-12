import nodemailer from 'nodemailer';

// Log email configuration (without sensitive data)
console.log('Email Configuration:', {
  host: process.env.EMAIL_HOST || 'NOT SET',
  port: process.env.EMAIL_PORT || 'NOT SET',
  user: process.env.EMAIL_USER || 'NOT SET',
  from: process.env.EMAIL_FROM || 'NOT SET',
  hasPassword: !!(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true
  }
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - Cordova Municipality Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Email Verification</h2>
        <p>Thank you for registering with Cordova Municipality Portal.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email. Please check email configuration.');
  }
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset - Cordova Municipality Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>We received a request to reset your password.</p>
        <p>Your password reset code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email and your password will remain unchanged.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email. Please check email configuration.');
  }
};
