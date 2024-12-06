import express from "express";
import {
  getBeachDetails,
  getAllBeaches,
} from "../Controllers/beach.controller.js";

const router = express.Router();

// Route to get details of a specific beach
router.get("/:beachId", getBeachDetails);

// Route to get all beaches
router.get("/", getAllBeaches);

export default router;
