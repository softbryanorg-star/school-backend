import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const adminSchema = mongoose.Schema({   //This Creates a schema, which defines the structure of an Admin document in MongoDB
name: { type: String, required: true },
email: { type: String, required: true, unique: true, lowercase: true},
password: { type: String, required: true },
//Used for password reset via email.
resetToken: String,             //hashed token for password reset
 resetTokenExpiry: Date,        //expiry time for reset token
});

//This is a Mongoose pre-save middleware and it insures password are always hashed before saving
adminSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	if (typeof this.password === "string") this.password = this.password.trim();
	this.password = await bcrypt.hash(this.password, 12);
});


adminSchema.methods.matchPassword = async function (enteredPassword) {  //The method to compare entered password with stored hashed password
	return bcrypt.compare(enteredPassword, this.password);               //Returns true if they match, false otherwise
};


export default mongoose.model("Admin", adminSchema);          //Converts the schema into a Mongoose model.
                                                //        "Admin" becomes the collection name (admins in MongoDB).




//“The Admin model defines admin users with unique emails.
//Passwords are automatically hashed using a pre-save hook to prevent plaintext storage.
//We also expose a reusable matchPassword method to safely verify credentials during login and password changes.
//This ensures secure handling of admin authentication data.”												