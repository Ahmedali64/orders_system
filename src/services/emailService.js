const nodemailer = require("nodemailer");
const path = require('path');
require('dotenv').config();

//config auth + hbs 
async function setupTransporter() {
    // because this framework is made with ESmodel and it is exported as defult, this is how we use it directly 
    // we are using this to config hbs file 
    const nodemailerExpressHandlebars = (await import('nodemailer-express-handlebars')).default;

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
    console.log(to , resetUrl)
    return  transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Reset your Password",
        template: "resetPassword",
        context: { resetUrl }//property is used to provide variables to your Handlebars template.

    })
}

module.exports = { sendEmailVerification, sendResetPasswordEmail }