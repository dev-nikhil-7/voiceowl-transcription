import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { Transcription } from "../models/transcription.model";

/**
 * Move an existing transcription to "review"
 * POST /transcriptions/:id/review
 */
export async function moveToReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid id" });

    const doc = await Transcription.findById(id).exec();
    if (!doc) return res.status(404).json({ error: "Transcription not found" });

    // Only change status if it's not already approved
    if (doc.status === "approved") {
      return res
        .status(400)
        .json({ error: "Cannot move an approved transcription to review" });
    }

    doc.status = "review";
    await doc.save();

    return res.json({ id: doc._id, status: doc.status });
  } catch (err: any) {
    console.error("moveToReview error:", err);
    return res.status(500).json({ error: "Failed to move to review" });
  }
}

/**
 * Approve a transcription
 * POST /transcriptions/:id/approve
 */
export async function approveTranscription(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid id" });

    const doc = await Transcription.findById(id).exec();
    if (!doc) return res.status(404).json({ error: "Transcription not found" });

    if (doc.status !== "review")
      return res
        .status(400)
        .json({ error: "Only items in review can be approved" });

    doc.status = "approved";
    // Optionally capture reviewer metadata: req.body.reviewer, req.body.comment
    if (req.body.reviewer || req.body.comment) {
      doc.set("review", {
        reviewer: req.body.reviewer || undefined,
        comment: req.body.comment || undefined,
        reviewedAt: new Date(),
      });
    }
    await doc.save();

    return res.json({ id: doc._id, status: doc.status });
  } catch (err: any) {
    console.error("approveTranscription error:", err);
    return res.status(500).json({ error: "Failed to approve transcription" });
  }
}

export async function listTranscribed(req: Request, res: Response) {
  try {
    const items = await Transcription.find({
      status: "transcribed",
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(items);
  } catch (err) {
    console.error("listTranscribed error:", err);
    res.status(500).json({ error: "Failed to fetch transcribed items" });
  }
}

/**
 * List all items currently in review
 * GET /transcriptions/review
 */
export async function listReview(req: Request, res: Response) {
  try {
    const items = await Transcription.find({ status: "review" })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return res.json(items);
  } catch (err: any) {
    console.error("listReview error:", err);
    return res.status(500).json({ error: "Failed to list review items" });
  }
}
