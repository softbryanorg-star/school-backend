import News from "../model/News.js";
import { validateRequiredFields } from "../validation/validate.js";   //importing validation functions
import cloudinary from "../utils/cloudinary.js";
import { unlink } from "fs/promises";

export const createNews = async (req, res) => {          //Controller to create a news article (private)ADMIN only route
const { title, content, slug,  metaTitle, metaDescription } = req.body;    //Extracts title, content, slug, metaTitle, and metaDescription from request body

const error = validateRequiredFields({ title, content, slug, metaTitle, metaDescription });    //Validates that all required fields are provided
if (error) return res.status(400).json({ message: "fill in required fields" });

	// If an image file is provided upload it to Cloudinary
	let coverImage = undefined;
	let coverImagePublicId = undefined;
	try {
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, { folder: "news" });
			coverImage = result.secure_url;
			coverImagePublicId = result.public_id;
			await unlink(req.file.path).catch(() => {});
		}
	} catch (err) {
		// remove local file if upload failed
		if (req.file) await unlink(req.file.path).catch(() => {});
		return res.status(500).json({ message: err.message });
	}

	const news = await News.create({ title, content, slug, metaTitle, metaDescription, coverImage, coverImagePublicId });     //Creates and saves the news article to the database  
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

	const news = await News.findById(req.params.id);
	if (!news) return res.status(404).json({ message: "News not found" });

	news.title = title;
	news.content = content;
	news.slug = slug;
	news.metaTitle = metaTitle;
	news.metaDescription = metaDescription;

	// If there's a new file, replace existing cover image in Cloudinary
	if (req.file) {
		try {
			if (news.coverImagePublicId) {
				await cloudinary.uploader.destroy(news.coverImagePublicId).catch(() => {});
			}
			const result = await cloudinary.uploader.upload(req.file.path, { folder: "news" });
			news.coverImage = result.secure_url;
			news.coverImagePublicId = result.public_id;
			await unlink(req.file.path).catch(() => {});
		} catch (err) {
			if (req.file) await unlink(req.file.path).catch(() => {});
			return res.status(500).json({ message: err.message });
		}
	}

	await news.save();
	res.status(200).json({ success: true, news });
};

export const deleteNews = async (req, res) => {       //Controller to delete a specific news article by ID (private) ADMIN only route
	const news = await News.findById(req.params.id);
	if (!news) return res.status(404).json({ message: "News not found" });
	try {
		if (news.coverImagePublicId) await cloudinary.uploader.destroy(news.coverImagePublicId).catch(() => {});
	} catch (err) {
		// continue to delete document even if cloudinary fails
	}
	await news.remove();
	res.status(200).json({ message: "News deleted" });
};


//“This controller provides full CRUD functionality for news articles.
// It includes validation for required fields to ensure data integrity.
// Admins can create, read, update, and delete news articles securely.”