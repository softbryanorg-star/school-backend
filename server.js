import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Config/db.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import generalLimiter from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";   //Imports centralized error-handling middleware. Ensures consistent error responses across the app
// import testRoutes from "./routes/testRoutes.js"; //Also delete this one its part of the testing

dotenv.config();
connectDB();         //It Establishes database connection when the server starts. If DB fails, the app should not silently continue.

const server = express();
server.use(cors());
server.use(express.json());  //Parses incoming JSON request bodies Without this, req.body would be undefined
server.use(generalLimiter);   //Applies rate limiting to all routes to mitigate brute-force and DDoS attacks


//   Routes
server.use("/api", publicRoutes);
server.use("/api/admin", adminRoutes);
// server.use("/api/test", testRoutes);//THIS IS JUST FOR TESTING Once confirmed:
// ❌ DELETE this test route ❌ Do NOT deploy it
// This is only for local verification.

server.get('/', (req, res) => {   
    res.send('Hello Soft');
});

server.use(notFound);       // it Handles requests to non-existing routes and Returns a clean 404 response.
server.use(errorHandler);    // it Catches errors from route handlers and middleware, sending structured error responses.

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

