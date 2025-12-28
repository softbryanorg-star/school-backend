//Nodemailer allows node,js to send emails and connect to SMTP servers
import nodemailer from "nodemailer";   

const sendEmail = async ({ to, subject, html }) => {      //defines a reusable email function that Accepts a destructured object to = recepient email address, subject = email subject, html = email body in HTML format            
  const transporter = nodemailer.createTransport({        //creates an SMTP transport this transporter is responsible for sending the email 
    host: process.env.EMAIL_HOST,                       //SMTP server host
    port: process.env.EMAIL_PORT,                       //SMTP server port usually 587 for TLS or 465 for SSL
    secure: false,                           //False means TLS is used if true SSL is used
    auth: {                             //SMTP authentication credentials uses email address and email app password
      user: process.env.EMAIL_USER,    //email address from which emails are sent
      pass: process.env.EMAIL_PASS,    //app password or email account password
    },
  });

  await transporter.sendMail({       //It sends the actual email using the transporter created above
    from: process.env.EMAIL_FROM,     //The sender's email address
    to,
    subject,
    html,
  });
};

export default sendEmail;           //exports the sendEmail funtion so that it can ce imported and used in any controller or route


                 //“I separated third-party service logic into utility files 
// so controllers stay focused on business logic. 
// Cloudinary handles media storage, 
// while Nodemailer handles transactional emails in a reusable, environment-safe way.”

/**
Purpose
IT Handles all outbound emails

Responsibilities
1  IT Connects to SMTP server

2  IT Sends formatted HTML emails

3  IT Supports password reset and notifications

Design Decisions
1  One reusable function

2  No email logic inside controllers

3  Easy to swap providers (Gmail → SendGrid later)

         Security
1  Uses app passwords

2  Credentials stored in environment variables
3  No sensitive data in codebase
**/