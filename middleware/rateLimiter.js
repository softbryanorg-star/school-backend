import rateLimit from "express-rate-limit";   
//this dependendency tracks how many requests come from one ip

//Creates a rate limiter instance and i exported it so i can only apply it to only my login routes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes this is my time window for counting requests. Every ip gets a fresh count every 15 minutes
  max: 10,                   //i set it to maximum 10 request per ip after 10 failed login attempts that ip address is temperoralily blocked
  standardHeaders: true,    //it Sends modern rate-limit headers Frontend can read:Remaining attempts and Retry time
  legacyHeaders: false,     //Disables the old depreciated RateLimit headers
  message: { message: "Too many login attempts, please try again later." },
});

//rate limiter for general api routes but i made it less strict than the login limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute time window every ip address gets a fresh count every minute
  max: 100,               // i set it to a maximum of 100 requests per ip address
  standardHeaders: true,   // Sends modern rate-limit headers Frontend can read:Remaining attempts and Retry time
  legacyHeaders: false,    //Disables the old depreciated RateLimit headers
});

export default generalLimiter; 

//This middleware protects my API from abuse, brute-force attacks, and accidental overload.
