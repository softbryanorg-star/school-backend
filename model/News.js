import mongoose from "mongoose";
import slugify from "slugify";     //converts titles into clean URLs

const newsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,  // Every news must have a title
      trim: true,
    },

    //Slug is used in URLs to identify the news article
    slug: {
      type: String,
      required: true,    // ensures every news has a slug
      unique: true,       // no 2 posts can share the same url
      lowercase: true,     // makes the slug lowercase for consistency
      trim: true,
    },

    content: {
      type: String,
      required: true,    // News content cannot be empty
    },

    coverImage: {
      type: String,
      //Not required because some news may not have images
    },

    isPublished: {
      type: Boolean,
      default: true,   // Lets admin Draft news and Hide without deleting
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 AUTO-GENERATE SLUG
// Before saving a news article, generate a slug from its title
newsSchema.pre("save", function (next) {    //This is called a pre hook
  if (!this.isModified("title")) return next();  //This tells the code if title does not change dont regenerate slug

  this.slug = slugify(this.title, {  //Generate slug using slugify
    lower: true,
    strict: true,     //removes special characters or symbols
  });

  next();              //Proceed to save the document
});

export default mongoose.model("News", newsSchema);
