import mongoose from "mongoose";

const schoolInfoSchema = mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,    // School must have a name
    },

    address: {
      type: String,
    },

    phone: {
      type: String,
    },

    email: {
      type: String,
      lowercase: true,
    },

    logo: {
      type: String,
    },

    about: {
      type: String,
    },
    /* SEO metadata for better search ranking */
    metaTitle: {   //SEO title for the school website
      type: String,
    },
    metaDescription: {      //SEO description for the school website
      type: String,
    },
    metaKeywords: {       //SEO keywords to help search engines understand the content
      type: [String],
      default: [],
    },
    canonicalUrl: {       //Preferred URL for SEO purposes
      type: String,
    },

    ogImage: {           //Open Graph image for social media sharing
      type: String,
    },
    logoPublicId: {
      type: String,
    },
    ogImagePublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SchoolInfo", schoolInfoSchema);
