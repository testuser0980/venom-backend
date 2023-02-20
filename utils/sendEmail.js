const nodeMailer = require("nodemailer");

const sendEmail = async (Options) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMPT_USER,
    to: Options.email,
    subject: Options.subject,
    html: `<h2>Account has been created successfully.</h2><p>Your Password: <b>${Options.pass}</b></p><h4>Thank you for creating an account with us.</h4>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
