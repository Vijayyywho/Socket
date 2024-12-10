import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

import {
  addReview,
  deleteReview,
  getReviews,
} from "../Controllers/review.controller.js"; // Ensure this is the correct path, with lowercase 'controllers'

// Review routes
router.get("/:postId", getReviews); // Get all reviews for a specific post
router.post("/:postId", verifyToken, addReview); // Add a review to a specific post
router.delete("/:postId/:reviewId", verifyToken, deleteReview); // Delete a specific review

export default router;
