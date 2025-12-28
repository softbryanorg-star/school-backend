import mongoose from "mongoose";

const gallerySchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    imageUrl: {    //Stores the image URL (usually from Cloudinary)
      type: String,
      required: true,
    },

    publicId: {       //Stores the Cloudinary public ID for image management very important for deleting and replacing images later
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gallery", gallerySchema);
