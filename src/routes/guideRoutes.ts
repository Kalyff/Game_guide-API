import { Router } from "express";
import { createGuide, getGuideDetails, voteGuide, addComment } from "../controllers/guideController";

const router = Router();

router.post("/", createGuide);
router.get("/:id", getGuideDetails);
router.post("/:id/vote", voteGuide);
router.post("/:id/comments", addComment);

export default router;
