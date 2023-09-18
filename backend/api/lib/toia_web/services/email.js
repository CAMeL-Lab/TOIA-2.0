const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const sendMail = async (first_name, email, verifyLink) => {
    const filePath = "template.html";
    let template = fs.readFileSync(path.resolve(__dirname, filePath), "utf8");
    template = template.replace("{{first_name}}", first_name);
    template = template.replace("{{url}}", verifyLink);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_SMTP_EMAIL,
            pass: process.env.GMAIL_SMTP_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_SMTP_EMAIL,
        to: email,
        subject: "Verify your email",
        html: template,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(info.response);
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
};


const args = process.argv.slice(2);


sendMail(args[0], args[1], args[2]);
