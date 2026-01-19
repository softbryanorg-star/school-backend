import express from "express";       ////i imported express the framework used to build http api's
import { protectAdmin } from "../middleware/authMiddleware.js";      //Imports authentication middleware This middleware Reads the JWT token from request headers Verifies it and Attaches the admin user to req.admin Any route using protectAdmin becomes private
import upload from "../middleware/uploadMiddleware.js";            //Imports Multer upload middleware which Handles Receiving files from the frontend and Saving them temporarily on disk for further processing
import { loginLimiter } from "../middleware/rateLimiter.js";       //Protects sensitive routes from brute-force attacks and Limits how many login attempts can be made per IP  This is security best practice

/* 
CONTROLLERS
 */
import { adminLogin,requestPasswordReset, resetPassword, changePassword ,addAdmin
 } from "../controllers/adminController.js";    //Imports auth-related business logic Routes should never contain logic directly; they should delegate to controllers

import {
  createPage,
  updatePage,
  deletePage,
} from "../controllers/pageController.js";  //Imports page management business logic for CMS functionality 
import { getPage } from "../controllers/pageController.js";  //Imports page retrieval logic for CMS functionality

import {
  createNews,
  getAllNews,
  deleteNews,
} from "../controllers/newsController.js";

import {
  uploadImage,
  deleteImage,
} from "../controllers/galleryController.js";   //Imports gallery management business logic for uploading and deleting images
import { getGallery } from "../controllers/galleryController.js";  //Imports gallery retrieval logic

import {
  getSchoolInfo,
  updateSchoolInfo,
} from "../controllers/schoolInfoController.js";        //Imports school info management business logic for retrieving and updating school information

import {
  getAllMessages,
  deleteMessage,
} from "../controllers/contactController.js";        //Imports contact message management business logic for retrieving and deleting messages received from the contact form

/* 
   ROUTER INIT
*/
const router = express.Router();             //Creates a modular router which Keeps routes clean and organized snd it also Allows mounting under /api/admin

/* 
   AUTH FOR ADMIN
   ====================== */
router.post("/login", loginLimiter, adminLogin);       //admin login route protected by rate limiter to prevent brute-force attacks
router.post("/forgot-password", requestPasswordReset);   //password recovery flow  
router.post("/reset-password", resetPassword);           // public because admin may be logged out
router.put("/change-password", protectAdmin, changePassword);    //Private root only logged in admins can change passwords
router.post("/add", protectAdmin, addAdmin);                      //alows creating additional admins but only a logged in admin cab do this

/* 
  FOR PAGES (CMS)
    */
router.post("/pages", protectAdmin, upload.single("image"), createPage);       //Create new page 
router.put("/pages/:id", protectAdmin, upload.single("image"), updatePage);
router.delete("/pages/:id", protectAdmin, deletePage);
router.get("/pages/:slug", protectAdmin, getPage);

/* 
  FOR NEWS / ANNOUNCEMENTS
*/
router.post("/news", protectAdmin, upload.single("image"), createNews);
router.get("/news", protectAdmin, getAllNews);
router.delete("/news/:id", protectAdmin, deleteNews);

/* 
  FOR GALLERY
 */
router.post("/gallery", protectAdmin, upload.single("image"), uploadImage);    //Handles image upload from form field named 'image' 
router.delete("/gallery/:id", protectAdmin, deleteImage);
router.get("/gallery", protectAdmin, getGallery);

/* 
   FOR SCHOOL INFO
  */
router.get("/school-info", protectAdmin, getSchoolInfo);
router.post("/school-info", protectAdmin, upload.single("logo"), updateSchoolInfo);
router.put("/school-info", protectAdmin, upload.single("logo"), updateSchoolInfo);

/*
 FOR  CONTACT MESSAGES
 */
router.get("/messages", protectAdmin, getAllMessages);
router.delete("/messages/:id", protectAdmin, deleteMessage);

export default router;
