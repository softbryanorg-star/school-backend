export const notFound = (req, res, next) => {                    //Middleware to handle 404 Not Found errors
const error = new Error(`Not Found - ${req.originalUrl}`);       //Creates a new Error object with a message that includes the original URL requested
res.status(404);
next(error);
};

export const errorHandler = (err, req, res, next) => {             //General error handling middleware
res.status(res.statusCode || 500).json({                           //Sets the response status code to the existing status code or defaults to 500 (Internal Server Error)
message: err.message,                                              //Includes the error message in the response
stack: process.env.NODE_ENV === "production" ? null : err.stack,   //Includes the stack trace only in non-production environments for debugging purposes
});
};