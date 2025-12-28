import ContactMessage from "../model/ContactMessage.js";   //importing ContactMessage model
import {         //importing validation functions
  validateRequiredFields,
  validateEmail,
} from "../validation/validate.js";

/**
 * @description    Send contact message (Public)
 * @route   POST /api/contact
 * @access  Public because anyone can send a message 
 */
export const sendMessage = async (req, res) => {      //public controller called when a visitor submits a form
  const { name, email, message } = req.body;          //Extracts name, email, and message from request body

  // Validate required fields
  const requiredError = validateRequiredFields({     //Validates that name, email, and message are provided
    name,
    email,
    message,
  });
  if (requiredError) {
    return res.status(400).json({ message: "Fill in required fields" });
  }

  // Validate email
  const emailError = validateEmail(email);     //Validates email format 
  if (emailError) {
    return res.status(400).json({ message: "Invalid email"});
  }

  // Save message
  await ContactMessage.create({                //Creates and saves the contact message to the database
    name,
    email,
    message,
  });

  res.status(201).json({
    message: "Message sent successfully",
  });
};

/**
  @description   Get all contact messages
  @access  Private (Admin) and protected with auth middleware logic
 */
export const getAllMessages = async (req, res) => {    //Private controller to fetch all contact messages for admin
  const messages = await ContactMessage.find()        //feches all messages from the database
    .sort({ createdAt: -1 });                        //Sorts messages by creation date in descending order(newest first)

  res.status(200).json({ success: true, messages });
};

/**
 @desc    Delete a contact message
  @access  Private (Admin)
 */
export const deleteMessage = async (req, res) => {        //Private controller to delete a specific contact message by ID
  const message = await ContactMessage.findById(req.params.id);   //Finds the message by ID from request parameters

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  await message.deleteOne();     //Deletes the found message from the database

  res.status(201).json({ message: "Message deleted" });
};


//“This controller cleanly separates public message submission from private admin message management.
// It includes validation for required fields and email format.
// Admins can securely retrieve and delete messages, ensuring proper access control and data integrity.”
//This logic is intentionally simple and secure