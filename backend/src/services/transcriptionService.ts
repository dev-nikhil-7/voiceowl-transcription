import { Transcription } from "../models/transcription.model";
import { downloadWithRetry } from "./downloadService";

export async function transcribeLocal(audioUrl: string): Promise<string> {
  // mock download
  await downloadWithRetry(audioUrl, 3, 200);
  // mock transcription
  return "transcribed text";
}

export async function saveTranscription(
  audioUrl: string,
  transcription: string,
  source = "local"
) {
  const doc = await Transcription.create({
    audioUrl,
    transcription,
    source,
    createdAt: new Date(),
  });
  return doc;
}
