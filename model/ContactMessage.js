import mongoose from "mongoose";

const contactMessageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,   // ensures a name is provided
      trim: true,    // trims whitespace from both ends of the string 
    },

    email: {
      type: String,
      required: true,     // ensures an email is provided
      trim: true,       // trims any accidental space from both ends of the string
      lowercase: true,    // converts the email to lowercase for consistency  
    },

    message: {
      type: String,
      required: true,      //it is required so empty message fields are not submitted
    },

    isRead: {    //Tracks whether an admin has viewed the messages
      type: Boolean,
      default: false,  //new messages are unread by default until it is being read it will become true
    },
  },
  {
    timestamps: true,   //Automatically adds:createdAt and updatedAt
                        //it is Useful for: Sorting messages showing the time messages are being recieved
                            
  }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
