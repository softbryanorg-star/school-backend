import mongoose from "mongoose";       // i imported mongoose so i can use its inbuilt utilities speccifically needed for ObjectID validation


export const validateRequiredFields = (fields) => {     //Validates that all required fields are provided
if (fields && typeof fields === "object") {             //checks if fields is an object
for (const key in fields) {                             //loops through each key in the object (key) represents the field name (eg email)
if (!fields[key]) return `${key} is required`;         //if the value for that key is missing or faulty it returns an error message indicating which field is required    
}
}
return null;       //if all fields are present it returns null indicating it passed the validation
};
//WHY I USED THIS FUNCTION
//Is because just these one function can handle multiple fields validation instead of writing separate validation for each field


export const validateEmail = (email) => {       //this logic uses a regular expression to check if the email format is valid whether it uses just one string if the email format is wrong it returns an error message
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    //this is a basic but reliable email pattern and it also prevents missing @, missing domain and spaces
return regex.test(email) ? null : "Invalid email";       //returns null if email is valid otherwise returns error message if it is an invalid format
};


export const validatePassword = (password) => {     //This logic validates password strenght rules making sure it reaches the required minimum lenght
if (!password || password.length < 6) {             //checks if password is missing or less than 6 characters
return "Password must be at least 6 characters long";
}
return null;     //returns null which means password is valid
};


export const validateObjectId = (id) => {     //Validates if the provided ID is a valid MongoDB ObjectId using mongoose utility function
return mongoose.Types.ObjectId.isValid(id) ? null : "Invalid ID";     //returns null if valid otherwise returns error message
};


//Designed for 	CMS content (PAGES, NEWS) handles html content safely
export const validateRichText = (html) => {    
	if (!html) return "Content is required";   //it ensures content exists thereby preventing empty submissions
	const str = String(html);                  //converts html to string to allow string operations
	if (/\<script[\s\S]*?\>/i.test(str)) return "Content contains disallowed scripts";
	const text = str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();    //removes html tags and extra whitespace to extract real readable content
	if (!text) return "Content is required";     //ensures that after stripping html there is still meaningful text
	if (text.length < 10) return "Content is too short";    //ensures content has a minimum lenght of 10 characters
	return null;        //returns null if the content passes all the validations
};


//“I centralized  my validation logic into reusable helper functions 
// to keep controllers clean and consistent.
//Each validator returns null on success or a readable error string on failure,
//  making error handling predictable and scalable.”
// This approach improves maintainability and ensures uniform validation across different controllers.
            //KEY TAKEAWAYS FROM MY CODE
//1. Reusability: Centralized validation functions can be reused across multiple controllers, reducing code duplication.
//2. Maintainability: Changes to validation logic need to be made in only one place, simplifying updates and bug fixes.
//3. Consistency: Uniform validation ensures that all parts of the application adhere to the same rules, improving data integrity.
//4. Readability: Controllers remain focused on business logic, making them easier to read and understand.
//null                      string
//validation passed        validation failed