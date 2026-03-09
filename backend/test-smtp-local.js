const nodemailer = require('nodemailer');

// Replace these with your NEW Ethereal credentials
const SMTP_USER = 'andrew.crist@ethereal.email';
const SMTP_PASS = '5AumpjKTpJFPcKzyhh';
const SMTP_HOST = 'smtp.ethereal.email';
const SMTP_PORT = 587; // Try 587 first locally

async function testEmail() {
    console.log('🧪 Testing local SMTP connection...');

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('✅ Connection Success!');

        console.log('📬 Sending test email...');
        const info = await transporter.sendMail({
            from: '"AuraBlogs Test" <test@aurablogs.com>',
            to: SMTP_USER,
            subject: 'Local Test Email',
            text: 'If you see this, your local SMTP is working!',
            html: '<b>If you see this, your local SMTP is working!</b>'
        });

        console.log('📧 Message sent: %s', info.messageId);
        console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.message.includes('timeout')) {
            console.log('💡 Suggestion: Your local network or firewall might be blocking port ' + SMTP_PORT);
        }
    }
}

testEmail();
