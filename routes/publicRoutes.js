import express from "express";
import {
  getPageBySlug,
  getPublishedNews,
  getSchoolInfo,
  getGallery,
} from "../controllers/publicController.js";  //Imports public content retrieval logic
import { sendMessage } from "../controllers/contactController.js";  //Imports contact form message handling logic

const router = express.Router();

router.get("/pages/:slug", getPageBySlug);          //Public CMS page rendering Uses slug instead of ID for Seo
router.get("/news", getPublishedNews);              //only returns published news
router.get("/school-info", getSchoolInfo);          //Public school information retrieval
router.get("/gallery", getGallery);                 //Public gallery retrieval
router.post("/contact", sendMessage);                //Handles contact form submissions

export default router;


//* I separated admin and public routes to enforce security boundaries,
//  reduce accidental data exposure, and make the system scalable.
//  Admin routes require authentication and handle CMS operations,
//  while public routes are optimized for SEO and content delivery.”
