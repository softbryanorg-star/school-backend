import jwt from "jsonwebtoken";
import Admin from "../model/admin.js";

export const protectAdmin = async (req, res, next) => {  //Middleware to protect admin routes by verifying JWT tokens
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")   //It Checks if the Authorization header exists and starts with 'Bearer'
  ) {
    token = req.headers.authorization.split(" ")[1];   //It Extracts the token part from the 'Bearer <token>' format
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);   //It Verifies the token using the secret key from environment variables
    req.admin = await Admin.findById(decoded.id).select("-password");  //It Fetches the admin user from the database using the ID from the token payload and attaches it to the request object, excluding the password field
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
