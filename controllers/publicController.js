import Page from "../model/page.js";       
import News from "../model/News.js";
import SchoolInfo from "../model/SchoolInfo.js";
import Gallery from "../model/Gallery.js";


// Public Controllers to fetch published content using slug for clean SEO friendly urls
export const getPageBySlug = async (req, res) => {

  const page = await Page.findOne({   
    slug: req.params.slug,
    isPublished: true,     // only published pages
  });      // it searches mongodb for a page matching the url slug (only published pages)

  if (!page) {
    return res.status(404).json({ message: "Page not found" });
  }

  res.status(200).json({ success: true, page });   //sends page content to frontend and frontend renders the cms content dynamically
};


//public endpoint for fetching anouncements and news no authentication required
export const getPublishedNews = async (req, res) => {
  const news = await News.find({ isPublished: true }).sort({ createdAt: -1 });   //fetches only published news articles from the database sorts (newest first)
  res.status(200).json(news);   //sends list of news articles to frontend and frontend maps and displays them
};

//public endpoint for global school details used in headers , footers and contact pages
export const getSchoolInfo = async (req, res) => {
  const info = await SchoolInfo.findOne();   // retrieves single school info document assumes only one record exists
  res.status(200).json({ success: true, info });    // returns school information for frontend
};


// public endpoint for fetching galley images
export const getGallery = async (req, res) => {
  const gallery = await Gallery.find().sort({ createdAt: -1 }); //fetches all gallery images sorted by newest first
  res.status(200).json(gallery);   //returns image data(urls and titles) then frontend renders images dynamically
};


//“This public controller provides endpoints to fetch published CMS pages, news articles,
// school information, and gallery images.
// It enables dynamic content rendering on the frontend while ensuring only published content is accessible to visitors.”


//why this controller design is strong because clear seperation: admin writes while public reads
// some people might ask why not merge this with admin
//“Because public routes have different security, caching, and performance requirements. 
// Separating them reduces risk and keeps the API easier to reason about 
// when i want to update or add more features.”












//The public controller is a read-only layer that exposes only published and safe content.
//It separates public access from admin logic, enforces visibility rules like isPublished, and uses slugs for SEO-friendly routing.
//This keeps drafts secure, simplifies frontend consumption, and allows the CMS to scale without changing public endpoints.”