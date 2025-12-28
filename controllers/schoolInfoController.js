import SchoolInfo from "../model/SchoolInfo.js";       //imports the schoolinfo mongoose model this model stores global school details 
                                                      // and it is designed to have only one document in the database

// Controller to get and update global school information used across the website
   export const getSchoolInfo = async (req, res) => {
const info = await SchoolInfo.findOne();               //fetches the first and only school info document the find(one) is intentional because i dont want multiple school records
res.status(200).json(info);                   //sends school information as json and frontend consumes it to render logo, address, contact details and about section
};

// Controller to update global school information used across the website protected by admin autentification at route level
export const updateSchoolInfo = async (req, res) => {
let info = await SchoolInfo.findOne();  //checks if a schoolInfo document already exists ensures single record architecture
if (!info) {                          //if no record exists create one
	// Provide sensible SEO defaults when creating
	const body = { ...req.body };       //clone request body to avoid direct mutation 
	body.metaTitle = body.metaTitle || (body.schoolName ? `${body.schoolName} - Official` : "");   //sets default meta title using school name if not provided
	body.metaDescription = body.metaDescription || (body.about ? body.about.substring(0, 160) : ""); //sets default meta description using about section if not provided
	body.metaKeywords = body.metaKeywords || (body.schoolName ? body.schoolName.split(" ").slice(0, 8) : []);   //sets default meta keywords using school name words if not provided
	body.ogImage = body.ogImage || body.logo || "";     //sets ogImage to logo if not provided

	info = await SchoolInfo.create(body);   // It creates the initial SchoolInfo document using admin provided data from request body
} else {                                   //if schoolInfo already exist update instead of creating a new one
	Object.assign(info, req.body);         //merges updated fields into existing document ony fields sent in req.body are changed
	// Ensure existing record has SEO fields filled when missing
	if (!info.metaTitle && info.schoolName) info.metaTitle = `${info.schoolName} - Official`;       
	if (!info.metaDescription && info.about) info.metaDescription = info.about.substring(0, 160);
	if ((!info.metaKeywords || info.metaKeywords.length === 0) && info.schoolName)
		info.metaKeywords = info.schoolName.split(" ").slice(0, 8);
	if (!info.ogImage && info.logo) info.ogImage = info.logo;
	await info.save();                    //saves updated data to mongodb and triggers schema validations and timestamp(updated at)
}
res.status(200).json({ success: true, data: info });   //sends success response with updated school info data
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