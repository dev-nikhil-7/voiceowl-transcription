import { Request, Response } from "express";
import {
  transcribeLocal,
  saveTranscription,
} from "../services/transcriptionService";
import { azureSpeechFromUrl } from "../services/azureService";

export async function postTranscription(req: Request, res: Response) {
  try {
    const { audioUrl } = req.body;
    if (!audioUrl)
      return res.status(400).json({ error: "audioUrl is required" });

    const transcription = await transcribeLocal(audioUrl);
    const doc = await saveTranscription(audioUrl, transcription, "local");
    return res.status(201).json({ id: doc._id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to transcribe" });
  }
}

export async function postAzureTranscription(req: Request, res: Response) {
  try {
    const { audioUrl, language } = req.body;
    if (!audioUrl) return res.status(400).json({ error: "audioUrl required" });

    const text = await azureSpeechFromUrl(audioUrl, language || "en-US");

    const doc = await saveTranscription(audioUrl, text, "azure");

    res.status(201).json({ id: doc._id });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
}
export async function getTranscriptions(req: Request, res: Response) {
  try {
    // get records created in last 30 days
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const docs = await (
      await import("../models/transcription.model")
    ).Transcription.find({ createdAt: { $gte: cutoff } })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ items: docs });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch transcriptions" });
  }
}
