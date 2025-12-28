 //This is the official clouldnary SDK this SDK allows my backend to upload 
 // and delete images and also manage folders and i am importing the full library it is not yet configured
import cloudinary from "cloudinary";

//Cloudnary exposes many version
cloudinary.v2.config({                         //v2 is the modern recommended API and .config() initializes cloudnary once globally
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  //This is my cloudnary account identifier and this logic tells cloudnary to store the images in my account
api_key: process.env.CLOUDINARY_API_KEY,       //This is my cloudnary api key used to authenticate requests from my backend to cloudnary
api_secret: process.env.CLOUDINARY_API_SECRET,  //This is my cloudnary api secret used to authenticate requests from my backend to cloudnary  HIGHLY SENSITIVE AND SHOULD NEVER BE EXPOSED TO FRONTEND
});                                             //Configuration completes and from this point onwards Cloudnary is ready to use anywhere


export default cloudinary.v2;                 //this exports the configured instance thereby giving me access to do cloudnary.uploader.upload() and cloudnary.uploader.destroy() in any page i import cloudnary 

//“This utility sets up and exports a configured Cloudinary instance for image management.
// It centralizes Cloudinary credentials and configuration,
// enabling easy image uploads and deletions throughout the application.”