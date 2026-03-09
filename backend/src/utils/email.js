const nodemailer = require('nodemailer');

// For development, we use Ethereal — a fake SMTP service that catches emails
// without actually sending them. You can view them at https://ethereal.email
// In production, replace with your real SMTP credentials (Gmail, SendGrid, etc.)

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    // Auto-create an Ethereal test account for development
    console.log('🔐 Creating Ethereal test account (requires internet)...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('🔐 Account created:', testAccount.user);

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    console.log('📧 Ethereal email account created:', testAccount.user);
    return transporter;
};

const sendVerificationEmail = async (toEmail, name, token) => {
    const transport = await getTransporter();
    const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;

    const info = await transport.sendMail({
        from: '"AuraBlogs" <no-reply@aurablogs.com>',
        to: toEmail,
        subject: 'Verify your AuraBlogs account',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="background: linear-gradient(to right, #a855f7, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">AuraBlogs</h1>
            </div>
            <h2 style="color: #f8fafc; font-size: 22px;">Hi ${name}, welcome aboard! 👋</h2>
            <p style="color: #94a3b8; line-height: 1.6;">Thanks for signing up. Please verify your email address to activate your account and start reading premium content.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
            </div>
            <p style="color: #475569; font-size: 13px; text-align: center;">This link will expire in <strong>24 hours</strong>. If you didn't sign up, you can ignore this email.</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;">
            <p style="color: #64748b; font-size: 12px; text-align: center;">Or copy this link: <a href="${verifyUrl}" style="color: #8b5cf6;">${verifyUrl}</a></p>
        </div>
        `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('📧 Verification email sent! Preview at:', previewUrl);
    return previewUrl; // Return for dev convenience
};

const sendPasswordResetEmail = async (toEmail, name, token) => {
    const transport = await getTransporter();
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const info = await transport.sendMail({
        from: '"AuraBlogs" <no-reply@aurablogs.com>',
        to: toEmail,
        subject: 'Reset your AuraBlogs password',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="background: linear-gradient(to right, #a855f7, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0;">AuraBlogs</h1>
            </div>
            <h2 style="color: #f8fafc; font-size: 22px;">Password Reset Request</h2>
            <p style="color: #94a3b8; line-height: 1.6;">Hi ${name}, we received a request to reset your password. Click the button below to choose a new one:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #ef4444, #f97316); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>
            <p style="color: #475569; font-size: 13px; text-align: center;">This link expires in <strong>1 hour</strong>. If you didn't request this, your account is safe — just ignore this email.</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;">
            <p style="color: #64748b; font-size: 12px; text-align: center;">Or copy this link: <a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a></p>
        </div>
        `
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('📧 Password reset email sent! Preview at:', previewUrl);
    return previewUrl;
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
