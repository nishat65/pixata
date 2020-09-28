const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.email;
        this.url = url;
        this.from = `Nishat Roy <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, args) {
        // Send the actual email template
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
            url: args,
            firstname: this.firstname,
        });
        // Email options
        const mailOptions = {
            form: this.from,
            to: this.to,
            html,
            text: htmlToText.fromString(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendResetPassword() {
        await this.send('resetPassword', this.url);
    }

    async sendConfirmEmailLink() {
        await this.send('emailConfirm', this.url);
    }
};

// const sendEmail = async (options) => {
//     // 1.create a transporter.
//     const transporter = nodemailer.createTransport({
//         // service: 'Gmail',
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD,
//         },
//         // Activate 'less secure app' option in gmail
//     });
//     // 2. Define some email options.
//     const mailOptions = {
//         form: 'Nishat Roy <nishat@hello.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         // html: ''
//     };
//     // 3.Send an email
//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
