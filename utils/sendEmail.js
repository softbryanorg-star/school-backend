// //Nodemailer allows node,js to send emails and connect to SMTP servers
// import nodemailer from "nodemailer";   

// const sendEmail = async ({ to, subject, html }) => {      //defines a reusable email function that Accepts a destructured object to = recepient email address, subject = email subject, html = email body in HTML format            
//   const transporter = nodemailer.createTransport({        //creates an SMTP transport this transporter is responsible for sending the email 
//     host: process.env.EMAIL_HOST,                       //SMTP server host
//     port: process.env.EMAIL_PORT,                       //SMTP server port usually 587 for TLS or 465 for SSL
//     secure: false,                           //False means TLS is used if true SSL is used
//     auth: {                             //SMTP authentication credentials uses email address and email app password
//       user: process.env.EMAIL_USER,    //email address from which emails are sent
//       pass: process.env.EMAIL_PASS,    //app password or email account password
//     },
//   });

//   await transporter.sendMail({       //It sends the actual email using the transporter created above
//     from: process.env.EMAIL_FROM,     //The sender's email address
//     to,
//     subject,
//     html,
//   });
// };

// export default sendEmail;           //exports the sendEmail funtion so that it can ce imported and used in any controller or route


//                  //“I separated third-party service logic into utility files 
// // so controllers stay focused on business logic. 
// // Cloudinary handles media storage, 
// // while Nodemailer handles transactional emails in a reusable, environment-safe way.”

// /**
// Purpose
// IT Handles all outbound emails

// Responsibilities
// 1  IT Connects to SMTP server

// 2  IT Sends formatted HTML emails

// 3  IT Supports password reset and notifications

// Design Decisions
// 1  One reusable function

// 2  No email logic inside controllers

// 3  Easy to swap providers (Gmail → SendGrid later)

//          Security
// 1  Uses app passwords

// 2  Credentials stored in environment variables
// 3  No sensitive data in codebase
// **/


// Nodemailer allows Node.js applications to send emails via SMTP providers
// import nodemailer from "nodemailer";

// /**
//  * sendEmail
//  * -----------
//  * A reusable utility function responsible for sending all outbound emails
//  * using Brevo (formerly Sendinblue) SMTP.
//  *
//  * @param {Object} options
//  * @param {string} options.to - Recipient email address
//  * @param {string} options.subject - Email subject
//  * @param {string} options.html - HTML email body
//  */
// const sendEmail = async ({ to, subject, html }) => {
//   // Create SMTP transporter (Brevo configuration)
//   const transporter = nodemailer.createTransport({
//     host: process.env.BREVO_SMTP_HOST, // smtp-relay.brevo.com
//     port: Number(process.env.BREVO_SMTP_PORT), // 587
//     secure: false, // Uses STARTTLS (recommended for Brevo)
//     auth: {
//       user: process.env.BREVO_SMTP_USER, // usually "apikey"
//       pass: process.env.BREVO_SMTP_PASS, // Brevo SMTP key
//     },
//     tls: {
//       rejectUnauthorized: false, // Improves compatibility on Windows servers
//     },
//   });

//   // Send email
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM, // Verified sender email in Brevo
//     to,
//     subject,
//     html,
//   });
// };

// export default sendEmail;
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "9f686f001@smtp-brevo.com",
      pass: process.env.BREVO_SMTP_PASS,
    },
    family: 4, // 👈 forces IPv4 (critical on Windows)
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export default sendEmail;



//                  //“I separated third-party service logic into utility files 
// // so controllers stay focused on business logic. 
// // Cloudinary handles media storage, 
// // while Nodemailer handles transactional emails in a reusable, environment-safe way.”

/**
Purpose
-------
Handles all outbound transactional emails for the application.

Responsibilities
----------------
1. Establishes a secure SMTP connection via Brevo
2. Sends formatted HTML emails
3. Supports notifications, password resets, and system emails

Design Decisions
----------------
1. Centralized reusable email utility
2. No email logic inside controllers
3. Provider-agnostic design (easy to swap SMTP vendors)
4. Environment-based configuration for security and flexibility

Security
--------
1. Uses Brevo SMTP keys (not account passwords)
2. Secrets stored in environment variables
3. No credentials committed to the codebase
4. Sender identity verified at SMTP provider level
**/
