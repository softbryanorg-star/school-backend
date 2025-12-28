import multer from "multer";  // Multer handles multipart/form-data and it is Required for file uploads in Express
import path from "path";      //path module provides utilities for working with file and directory paths
import fs from "fs";            //file system module provides an API for interacting with the file system and it is used to create folders dynamically

// i Set up multer storage configuration and file filtering for image uploads and it also Configures where and how files are stored Uses disk (local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {                    // it  determines the destination folder for uploads 
    const dir = path.join(process.cwd(), "uploads");   //It Creates absolute path: Project root + /uploads and process.cwd() ensures consistency  regardless of where the script is run from                
    try {
      fs.mkdirSync(dir, { recursive: true });          //It Creates the uploads directory if it doesn't exist yet. recursive:true creates nested directories if needed
    } catch (err) {
      // ignore
    }
    cb(null, dir);                        //it Tells multer to save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {            // it  determines the filename for uploaded files
    cb(null, Date.now() + path.extname(file.originalname));  //It Generates a unique filename using the current timestamp + original file extension to avoid name conflicts
  },
});


// File filter to allow only image files
const fileFilter = (req, file, cb) => {         
  if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);   //Accepts files with mimetype starting with 'image/png', 'image/jpeg', `image/jpg` etc.
  else cb(new Error("Only image files are allowed"), false);                 //it Rejects non-image files with and throws a controlled error
};

//it Exports the configured multer instance with 5MB file size limit and uses image only rule and also uses the defined storage settings
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });  

export default upload;


//Now my main aim for creating this middle ware is
//  To Prevent malicious files
//  To  Control storage location
//  To Avoid filename collisions
//  To Enforces size limits