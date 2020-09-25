const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1.create a transporter.
    const transporter = nodemailer.createTransport({
        // service: 'Gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Activate 'less secure app' option in gmail
    });
    // 2. Define some email options.
    const mailOptions = {
        form: 'Nishat Roy <nishat@hello.io>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: ''
    };
    // 3.Send an email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
