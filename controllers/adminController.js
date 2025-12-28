import jwt from "jsonwebtoken";
import crypto from "crypto";        //Node's in built cyptography module used to secure random reset tokens and hash reset tokens before saving
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";    //Utility to send emails using nodemailer keeps email logic out of controllers
import Admin from "../model/admin.js";
import {
  validateRequiredFields,
  validateEmail,
  validatePassword,
} from "../validation/validate.js";  //Reusable validation functions for input data

/**
 * JWT TOKEN GENERATOR
 */
const generateToken = (id) => {   //Generates a JWT token with the admin's ID as payload
  return jwt.sign(                 //Creates a signed JWT token
    { id },                         //Payload contains the admin ID
    process.env.JWT_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }    // //Token expiration time defaults to 1 day prevents permanent access if token is stolen
  );
};

/**
 * ADMIN LOGIN
 */
export const adminLogin = async (req, res) => {      //It Handles admin login requests async becasuse it talks to database
  let { email, password } = req.body;               //Extracts email and password from request body
  if (typeof email === "string") email = email.trim().toLowerCase();
  if (typeof password === "string") password = password.trim();

  const requiredError = validateRequiredFields({ email, password });    //It Validates that both email and password are provided
  
  if (requiredError) {           //If validation fails, respond with 400 Bad Request
    return res.status(400).json({ message: requiredError });
  }

  const emailError = validateEmail(email);      //Validates email format
  if (emailError) {
    return res.status(400).json({ message: emailError });   //If email format is invalid, respond with 400 Bad Request
  }

  const admin = await Admin.findOne({ email });                  //It Looks for admin by email in the database
  if (!admin) {
    return res.status(401).json({ message: "Invalid email " });   //If admin not found, respond with 401 Unauthorized
  }

  // Controlled debug output — enable by setting DEBUG_AUTH=true in .env
  if (process.env.DEBUG_AUTH === "true") {
    try {
      console.log("[debug] admin.hash.length:", admin.password ? admin.password.length : "<missing>");
      console.log("[debug] providedPassword.length:", password ? password.length : "<missing>");
      const directCompare = await bcrypt.compare(password || "", admin.password || "");
      console.log("[debug] bcrypt.compare direct result:", directCompare);
      const envPass = (process.env.ADMIN_PASSWORD || "").trim();
      const compareWithEnv = await bcrypt.compare(envPass, admin.password || "");
      console.log("[debug] bcrypt.compare with env password:", compareWithEnv);
      console.log("[debug] provided equals env string:", password === envPass);
    } catch (e) {
      /* ignore */
    }
  }

  const isMatch = await admin.matchPassword(password);           //It Compares provided password with stored hashed password in database
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });   //If password does not match, respond with 401 Unauthorized
  }

  //On successful login, respond with admin details and JWT token
  res.status(200).json({   message:"login succesful",          
    _id: admin._id,               //Return admin details and JWT token on successful login
    name: admin.name || "",       //Provide empty string if name is not set
    email: admin.email,           //Return admin email
    token: generateToken(admin._id),  //Generate JWT token for session management
  });
};

/*
 * REQUEST PASSWORD RESET
 */
export const requestPasswordReset = async (req, res) => {       //Handles password reset requests from admins
  const { email } = req.body;                                   //Extracts email from request body

  const requiredError = validateRequiredFields({ email });     //Validates that email is provided
  if (requiredError) {                                         //If validation fails, respond with 400 Bad Request
    return res.status(400).json({ message: requiredError });
  }

  const emailError = validateEmail(email);          //Validates email format
  if (emailError) {                                 //If email format is invalid, respond with 400 Bad Request
    return res.status(400).json({ message: emailError });
  }

  const admin = await Admin.findOne({ email });      //Looks for admin by email in the database
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");     //Generates a secure random token for password reset sent via email to admin

   //hashes the reset token before saving to database if data base leaks reset links are safe
  admin.resetToken = crypto                    
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000;   //Sets token expiry time to 15 minutes from now preventing old reset links from being used

  await admin.save();                 //Saves the updated admin document with reset token and expiry time

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;   //Constructs the password reset link to be sent via email

  //Sends password reset email to admin with the reset link
  await sendEmail({
    to: admin.email,
    subject: "Admin Password Reset",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>     
      <p>This link expires in 15 minutes.</p>
    `,
  });

  res.status(200).json({ message: "Password reset email sent" });
};

/**
 * RESET PASSWORD (FROM EMAIL)
 */
export const resetPassword = async (req, res) => {    //It Handles password reset using the token sent via email
  const { token, newPassword } = req.body;             //Extracts reset token and new password from request body

  const requiredError = validateRequiredFields({ token, newPassword });   //Validates that both token and new password are provided
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ message:"Password must be at least 8 characters long" });
  }


  //Hashes the provided token to match against stored hashed token in database
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

//Looks for admin with matching reset token and valid expiry time
  const admin = await Admin.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!admin) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  admin.password = newPassword;    //Assign plaintext; model pre-save will hash it
  admin.resetToken = undefined;                           //Clears  the reset token and expiry time after successful password reset
  admin.resetTokenExpiry = undefined;                     //Prevents reuse of the same token

  await admin.save();                               //Saves the updated admin document with new password

  res.status(200).json({ message: "Password reset successful" });
};

/*
 * CHANGE PASSWORD (LOGGED IN)
 */
export const changePassword = async (req, res) => {       //Handles password change requests from logged-in admins
  const { currentPassword, newPassword } = req.body;      //Extracts current and new passwords from request body

  const requiredError = validateRequiredFields({         //Validates that both current and new passwords are provided
    currentPassword,
    newPassword,
  });
  if (requiredError) {
    return res.status(400).json({ message: requiredError });
  }

  //Validates new password strength 
  const passwordError = validatePassword(newPassword);      //Ensures new password meets minimum security criteria
  if (passwordError) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  const admin = await Admin.findById(req.admin._id);     //Fetches the logged-in admin from database using ID from auth middleware

  const isMatch = await admin.matchPassword(currentPassword);      //It Compares provided current password with stored hashed password
  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  admin.password = newPassword;        //Assign plaintext; model pre-save will hash it
  await admin.save();       //Saves the updated admin document with new password

  res.status(200).json({ message: "Password changed successfully" });
};

/*
 * ADD NEW ADMIN (DASHBOARD)
 * PRIVATE accessible to only logged in admins and protected with auth middleware logic
 */
// Allows creation of mutiple admins
//It Enables future ownership transfer
export const addAdmin = async (req, res) => {         
  const { name, email, password } = req.body;          //Extracts name, email, and password from request body

  const requiredError = validateRequiredFields({ name, email, password });       //Validates that name, email, and password are provided
  if (requiredError) {
    return res.status(400).json({ message: "fill in your details" });      //If validation fails, respond with 400 Bad Request
  }

  const emailError = validateEmail(email);              //Validates email format 
  if (emailError) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const passwordError = validatePassword(password);     //It Validates password strength
  if (passwordError) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  //Checks if an admin with the same email already exists to prevent duplicates
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const admin = await Admin.create({      //Creates the new admin in the database; model will hash password
    name,
    email,
    password,
  });

  res.status(201).json({
    message: "Admin created successfully",
    admin: {
      _id: admin._id,    //Return newly created admin details but never returns password for security purposes
      name: admin.name,  
      email: admin.email,
    },
  });
};



//“This controller separates authentication, security, and business logic clearly.
//  Passwords are hashed, tokens are time-bound, and all sensitive operations are protected.
//  The structure supports multi-admin, password recovery, and secure session handling.”