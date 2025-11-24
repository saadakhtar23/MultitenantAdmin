import express from "express";
import {protect} from "../middlewares/auth.js";
import { authorize } from '../middlewares/roles.js';
import { createOffer, getAllHr } from "../controllers/offerController.js";

const router = express.Router();

router.post("/", protect, authorize("RMG"), createOffer);
router.get("/hr", protect, authorize("RMG"), getAllHr);

export default router;