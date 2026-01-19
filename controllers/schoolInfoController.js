import SchoolInfo from "../model/SchoolInfo.js";       //imports the schoolinfo mongoose model this model stores global school details 
													  // and it is designed to have only one document in the database
import cloudinary from "../utils/cloudinary.js";
import { unlink } from "fs/promises";

// Controller to get and update global school information used across the website
   export const getSchoolInfo = async (req, res) => {
const info = await SchoolInfo.findOne();               //fetches the first and only school info document the find(one) is intentional because i dont want multiple school records
res.status(200).json(info);                   //sends school information as json and frontend consumes it to render logo, address, contact details and about section
};

// Controller to update global school information used across the website protected by admin autentification at route level
export const updateSchoolInfo = async (req, res) => {
	let info = await SchoolInfo.findOne();
	if (!info) {
		// Provide sensible SEO defaults when creating
		const body = { ...req.body };
		body.metaTitle = body.metaTitle || (body.schoolName ? `${body.schoolName} - Official` : "");
		body.metaDescription = body.metaDescription || (body.about ? body.about.substring(0, 160) : "");
		body.metaKeywords = body.metaKeywords || (body.schoolName ? body.schoolName.split(" ").slice(0, 8) : []);
		body.ogImage = body.ogImage || body.logo || "";

		// Handle optional logo file upload
		if (req.file) {
			try {
				const result = await cloudinary.uploader.upload(req.file.path, { folder: "school-logo" });
				body.logo = result.secure_url;
				body.logoPublicId = result.public_id;
				await unlink(req.file.path).catch(() => {});
			} catch (err) {
				if (req.file) await unlink(req.file.path).catch(() => {});
				return res.status(500).json({ message: err.message });
			}
		}

		info = await SchoolInfo.create(body);
	} else {
		// If a new logo file is uploaded, replace previous logo in Cloudinary
		if (req.file) {
			try {
				if (info.logoPublicId) await cloudinary.uploader.destroy(info.logoPublicId).catch(() => {});
				const result = await cloudinary.uploader.upload(req.file.path, { folder: "school-logo" });
				info.logo = result.secure_url;
				info.logoPublicId = result.public_id;
				await unlink(req.file.path).catch(() => {});
			} catch (err) {
				if (req.file) await unlink(req.file.path).catch(() => {});
				return res.status(500).json({ message: err.message });
			}
		}

		Object.assign(info, req.body);
		// Ensure existing record has SEO fields filled when missing
		if (!info.metaTitle && info.schoolName) info.metaTitle = `${info.schoolName} - Official`;
		if (!info.metaDescription && info.about) info.metaDescription = info.about.substring(0, 160);
		if ((!info.metaKeywords || info.metaKeywords.length === 0) && info.schoolName)
			info.metaKeywords = info.schoolName.split(" ").slice(0, 8);
		if (!info.ogImage && info.logo) info.ogImage = info.logo;
		await info.save();
	}
	res.status(200).json({ success: true, data: info });
};


//“This controller manages global school information used across the website.
// It allows fetching and updating details like name, address, contact info, and SEO metadata.
// The design ensures only one school info record exists, simplifying data management and retrieval for the frontend.”


                              //WHY I LOVE MY DESIGN
//“School information is global system data, so I designed it as a single-document model.
//Using findOne() ensures there’s never duplication.
//The controller supports both first-time creation and future updates without needing separate endpoints.”

//WHY THIS IS BETTER THAN AN ID-BASED APPROACH
//  Approach	      Result
//findById()	    Risk of multiple records
//find()	         Extra logic to select correct record
//findOne()	          Clean single-source-of-truth  That why i used it