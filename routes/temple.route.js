import express from "express";
import {
  getTempleDetails,
  getAllTemples,
} from "../Controller/temple.controller.js";

const router = express.Router();

// Route to get temple details by ID
router.get("/:templeId", getTempleDetails);
router.get("/", getAllTemples);

export default router;
