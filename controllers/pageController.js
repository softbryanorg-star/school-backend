import Page from "../model/page.js";
import { validateRequiredFields, validateRichText } from "../validation/validate.js";     //importing validation functions= validateRequiredFields checks missing input while validateRichtexts ensures rich text content is not empty or meaningless
import cloudinary from "../utils/cloudinary.js";
import { unlink } from "fs/promises";

export const createPage = async (req, res) => {        //Controller to create a page (private) ADMIN only route
const { title, slug, content,  metaTitle, metaDescription } = req.body;     //Extracts title, slug, content, metaTitle, and metaDescription from request body

const error = validateRequiredFields({ title, slug, content,  metaTitle, metaDescription });    //Validates that all required fields are provided
if (error) return res.status(400).json({ message: "Fill in your required fields"});

const contentError = validateRichText(content);      //Validates that content is not empty or just whitespace/HTML tags critical for WYSIWYG editors
if (contentError) return res.status(400).json({ message: contentError });   //Sends error message if content validation fails

	// Handle optional cover image upload
	let coverImage = undefined;
	let coverImagePublicId = undefined;
	try {
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, { folder: "pages" });
			coverImage = result.secure_url;
			coverImagePublicId = result.public_id;
			await unlink(req.file.path).catch(() => {});
		}
	} catch (err) {
		if (req.file) await unlink(req.file.path).catch(() => {});
		return res.status(500).json({ message: err.message });
	}

	const page = await Page.create({ title, slug, content, metaTitle, metaDescription, coverImage, coverImagePublicId });     //Creates and saves a CMS(Content Management System) page to the database
	res.status(201).json({ success: true, page });          //Sends success response with created page
};

export const updatePage = async (req, res) => {       //Controller to update a specific page by ID (private) ADMIN only route
const page = await Page.findById(req.params.id);      //Finds the page by ID from request parameters


if (!page) return res.status(404).json({ message: "Page not found" });
page.title = req.body.title || page.title;            //Updates title if provided in request body
page.slug = req.body.slug || page.slug;                 //Updates slug if provided in request body
page.content = req.body.content || page.content;        //Updates content if provided in request body
page.metaTitle = req.body.metaTitle || page.metaTitle;        //Updates metaTitle if provided in request body
page.metaDescription = req.body.metaDescription || page.metaDescription;  //Updates metaDescription if provided in request body

// If there's a new cover image file, replace existing image in Cloudinary
if (req.file) {
	try {
		if (page.coverImagePublicId) {
			await cloudinary.uploader.destroy(page.coverImagePublicId).catch(() => {});
		}
		const result = await cloudinary.uploader.upload(req.file.path, { folder: "pages" });
		page.coverImage = result.secure_url;
		page.coverImagePublicId = result.public_id;
		await unlink(req.file.path).catch(() => {});
	} catch (err) {
		if (req.file) await unlink(req.file.path).catch(() => {});
		return res.status(500).json({ message: err.message });
	}
}

await page.save();                                       //Saves the updated page to the database
res.status(200).json({ success: true, page });
};


export const getPage = async (req, res) => {        //fetches page using SEO friendly slug (public route)
const page = await Page.findOne({ slug: req.params.slug });   //Finds the page by slug from request parameters allows clean url like /pages/about-us instead of using database IDs  
if (!page) return res.status(404).json({ message: "Page not found" });
res.status(200).json({ success: true, page });
};

export const deletePage = async (req, res) => {     //Controller to delete a specific page by ID (private) ADMIN only route
	const page = await Page.findById(req.params.id);
	if (!page) return res.status(404).json({ message: "Page not found" });
	try {
		if (page.coverImagePublicId) await cloudinary.uploader.destroy(page.coverImagePublicId).catch(() => {});
	} catch (err) {
		// continue
	}
	await page.remove();
	res.status(200).json({ message: "Page deleted" });
};


//“This controller provides full CRUD functionality for CMS pages.
// It includes validation for required fields and rich text content to ensure data integrity.
// Admins can create, read, update, and delete pages securely.”
