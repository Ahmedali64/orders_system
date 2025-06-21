const nodemailer = require("nodemailer");
const path = require('path');
require('dotenv').config();
//config auth + hbs 
async function setupTransporter() {
    // because this framework is made with ESmodel and it is exported as defult, this is how we use it directly 
    // we are using this to config hbs file 
    const nodemailerExpressHandlebars = (await import('nodemailer-express-handlebars')).default;
//    Handlebars has no built-in formattedDate. It only knows what you tell it. So when it tried to render that template, it crashed because formattedDate was never registered.
    const hbsHelpers = {
        formattedDate: function (dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        },
    };

    //config you should return this at the end 
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }    
    });
    //hbs config
    transporter.use("compile", nodemailerExpressHandlebars({
        viewEngine: {
            extname: '.hbs',
            layoutsDir: path.join(__dirname, '../emails'),
            defaultLayout: '',
            helpers: hbsHelpers
        },
        viewPath: path.join(__dirname, '../emails'),
        extName: '.hbs'
    }));

    return transporter;
};
async function sendEmailVerification (to, verifyUrl) {
  const transporter = await setupTransporter();
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email address",
    template: "verifyEmail",
    context: { verifyUrl }
  });
}
async function sendResetPasswordEmail (to , resetUrl) {
    //make instance with our config (auth + hbs)
    const transporter = await setupTransporter();
    return  transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Reset your Password",
        template: "resetPassword",
        context: { resetUrl }//property is used to provide variables to your Handlebars template.

    })
}
async function sendExpiryNotification(to, items, type) {
    // Compose subject and body based on type
    const transporter = await setupTransporter();
    const subject = type === "EXPIRY_WARNING"
        ? "Items Expiring in 5 Days"
        : "Items Expiring Today";
    const itemList = items.map(i => 
        `- ${i.name} (Qty: ${i.stock_quantity}, Expires: ${i.expiry_date})`
    ).join('\n');
    const text = `The following items are expiring:\n\n${itemList}`;

    // Send email (use your transporter config)
    return transporter.sendMail({
        to,
        subject,
        template: "expiryNotification",
        context: {
            subject,
            items
        },
        text
    });
}

module.exports = { sendEmailVerification, sendResetPasswordEmail , sendExpiryNotification }