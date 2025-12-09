import { Router } from "express";
import {
  postTranscription,
  getTranscriptions,
  postAzureTranscription,
} from "../controllers/transcription.controller";
import {
  moveToReview,
  approveTranscription,
  listReview,
  listTranscribed,
} from "../controllers/workflow.controller";
const router = Router();

router.post("/transcription", postTranscription);
router.post("/azure-transcription", postAzureTranscription);
router.get("/transcriptions", getTranscriptions);
router.get("/transcriptions/transcribed", listTranscribed);

// Move an existing transcription to review
router.post("/transcriptions/:id/review", moveToReview);

// Approve transcription
router.post("/transcriptions/:id/approve", approveTranscription);

// List items in review
router.get("/transcriptions/review", listReview);

export default router;
