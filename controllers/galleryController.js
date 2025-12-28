import Gallery from "../model/Gallery.js";
import cloudinary from "../utils/cloudinary.js";     //Cloudinary configuration for image upload and management
import { unlink } from "fs/promises";         //imports async version of fs.unlink used to delete files from local storage prevents server storeage from filling up

export const uploadImage = async (req, res) => {     //Controller to handle image upload to Cloudinary and save metadata to MongoDB
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });  //Checks if a file is uploaded in the request 

    const result = await cloudinary.uploader.upload(req.file.path, {   
      folder: "school-gallery",
    });   //uploads the locally saved file to cloudnary using req.file.path the file location on the server, folder keeps cloudnary dashboard organized and result contains secure_url and public_id with metadata

    const gallery = await Gallery.create({    //Creates a new Gallery document in MongoDB with image metadata
      title: req.body.title || "",            //Optional title from request body defaults to empty string to prevent undefined
      imageUrl: result.secure_url,        //stores cloudnary url frontend will use this to display the image
      publicId: result.public_id,         //it stores cloudnary id required later for image deletion or replacement
    });

    await unlink(req.file.path).catch(() => {});   //Deletes the locally saved file after upload to cloudnary to free up server storage space

    res.status(201).json(gallery);             //Sends back the created gallery document as response
  } catch (error) {                          //catches cloudnary errors, database errors and code issues
    res.status(500).json({ message: error.message });
  }
};

export const getGallery = async (req, res) => {     //Controller to fetch all gallery images from MongoDB
  try {
    const images = await Gallery.find();     //Fetches all gallery documents from the database
    res.status(200).json(images);           //Sends back the array of gallery images as response to the frontend
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {      //Controller to delete a specific image from Cloudinary and MongoDB by ID
  try {
    const image = await Gallery.findById(req.params.id);    //Finds the gallery document by ID from request parameters
    if (!image) return res.status(404).json({ message: "Image not found" });

    await cloudinary.uploader.destroy(image.publicId);   //Deletes the image from Cloudinary using the stored publicId
    await image.remove();                                //Removes the gallery document from MongoDB

    res.status(200).json({ message: "Image removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//“This controller provides secure image upload, retrieval, 
// and deletion functionality for the gallery feature.
// It ensures efficient server storage management by deleting local files post-upload 
// and handles errors gracefully.”