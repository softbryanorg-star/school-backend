//NOTE THIS IS JUST TO TEST WHETHER EMAIL RESET MESSAGES ARE DELOVERED AND IT WORKS IF IT WORKS 
// Once confirmed:
// ❌ DELETE this test route
// ❌ Do NOT deploy it
// This is only for local verification.
import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email",
      html: "<h2>Email system is working 🚀</h2>",
    });

    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email failed", error: error.message });
  }
});

export default router;
