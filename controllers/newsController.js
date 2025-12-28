import News from "../model/News.js";
import { validateRequiredFields } from "../validation/validate.js";   //importing validation functions

export const createNews = async (req, res) => {          //Controller to create a news article (private)ADMIN only route
const { title, content, slug,  metaTitle, metaDescription } = req.body;    //Extracts title, content, slug, metaTitle, and metaDescription from request body

const error = validateRequiredFields({ title, content, slug, metaTitle, metaDescription });    //Validates that all required fields are provided
if (error) return res.status(400).json({ message: "fill in required fields" });

const news = await News.create({ title, content, slug, metaTitle, metaDescription });     //Creates and saves the news article to the database  
res.status(201).json({ success: true, news });
};

export const getAllNews = async (req, res) => {           //Controller to fetch all news articles (private) ADMIN only route
const news = await News.find().sort({ createdAt: -1 });    //Fetches all news articles from the database sorts (newest first) ensures frontend dispays latest news at the top
res.status(200).json({ success: true, news });
};

export const updateNews = async (req, res) => {          //Controller to update a specific news article by ID (private) ADMIN only route
const { title, content, slug, metaTitle, metaDescription } = req.body;    //Extracts updated fields from request body

const error = validateRequiredFields({ title, content, slug, metaTitle, metaDescription });
if (error) return res.status(400).json({ message: "fill in required fields" });

const news = await News.findByIdAndUpdate(req.params.id, { title, content, slug, metaTitle, metaDescription }, { new: true });  //Finds the news article by ID and updates it with new data returns the updated document
res.status(200).json({ success: true, news });
};

export const deleteNews = async (req, res) => {       //Controller to delete a specific news article by ID (private) ADMIN only route
await News.findByIdAndDelete(req.params.id);       //Finds the news article by ID from request parameters and deletes it from the database
res.status(200).json({ message: "News deleted" });
};


//“This controller provides full CRUD functionality for news articles.
// It includes validation for required fields to ensure data integrity.
// Admins can create, read, update, and delete news articles securely.”