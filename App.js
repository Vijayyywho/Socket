import express from "express";
import postRoute from "./routes/post.route.js";
import cors from "cors"; // CORS support
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js"; // Ensure this is correctly imported
import templeRoute from "./routes/temple.route.js";
import beachRoute from "./routes/beach.route.js";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Adjust to your frontend URL
  credentials: true, // Allow credentials
  optionsSuccessStatus: 200, // For legacy browsers
};

app.use(cors(corsOptions)); // Use CORS middleware with options

app.use(express.json());
app.use(cookieParser());

// Use the review routes before post routes to keep the routes logical
app.use("/api/reviews", reviewRoute); // Register review routes before posts

app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/temple", templeRoute);
app.use("/api/beach", beachRoute);

app.listen(3000, () => {
  console.log("Server is On");
});
