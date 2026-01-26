import mongoose from "mongoose";
import slugify from "slugify";      //converts titles into clean URLs

const pageSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,             // Every page must have a title
      trim: true,
    },


    //Slug is used in URLs to identify the news article
    slug: {
      type: String,
      required: true,           // ensures every page has a slug for URL identification 
      unique: true,              // no 2 pages can share the same url
      lowercase: true,             // makes the slug lowercase for consistency
      trim: true,                // removes leading/trailing spaces
    },

    content: {
      type: String,
      required: true,          // Page content cannot be empty
    },

    isPublished: {
      type: Boolean,          //` Whether the page is live on the site  
      default: true,           // By Default it is published
    },

    coverImage: {
      type: String,
    },
    coverImagePublicId: {    //
      type: String,    
    },

     metaTitle: {        //it makes the page appear un gogle search bar
         type: String, 
         trim: true
         },           // SEO title

    metaDescription: {     //it makes it Appears in Google snippet and it also Helps SEO ranking
        type: String, 
        trim: true
     },     // SEO description
  },
  {
    timestamps: true,
  }
);

// 🔥 AUTO-GENERATE SLUG
// Before saving a page, generate a slug from its title
pageSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();    //This tells the code if title does not change dont regenerate slug

  this.slug = slugify(this.title, {         //This tells the code to Generate a slug using slugify
    lower: true,
    strict: true,                      //removes special characters or symbols
  });

  next();                      //Proceed to save the document
});

export default mongoose.model("Page", pageSchema);
