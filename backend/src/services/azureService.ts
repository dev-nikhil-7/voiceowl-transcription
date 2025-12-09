import fs from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { AZURE_KEY, AZURE_REGION } from "../utils/config";

ffmpeg.setFfmpegPath(ffmpegPath.path);

// Detect file extension
function getFileExtension(url: string): string {
  return path.extname(url.split("?")[0]).toLowerCase();
}

// Download any audio format
async function downloadAudio(url: string): Promise<string> {
  const ext = getFileExtension(url) || ".wav";
  const filePath = path.join(os.tmpdir(), `audio_${Date.now()}${ext}`);

  const response = await axios.get(url, {
    responseType: "stream",
    timeout: 20000,
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return filePath;
}

// Convert only if needed
async function ensureWav(inputPath: string): Promise<string> {
  if (inputPath.toLowerCase().endsWith(".wav")) {
    console.log("Input is already WAV. Skipping conversion.");
    return inputPath;
  }

  console.log("Converting to WAV...");

  const wavPath = inputPath.replace(/\.\w+$/, ".wav");

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le") // For Azure it is required
      .format("wav")
      .save(wavPath)
      .on("end", () => resolve(wavPath))
      .on("error", reject);
  });
}

// Helper: timeout wrapper for a promise
function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  errMsg = "Operation timed out"
) {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errMsg)), ms)
    ),
  ]);
}

// Send WAV to Azure (single attempt)
async function transcribeWavOnce(
  wavPath: string,
  language = "en-US",
  sdkTimeoutMs = 15000
): Promise<string> {
  if (!AZURE_KEY || !AZURE_REGION) {
    throw new Error("Azure credentials missing");
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    AZURE_KEY,
    AZURE_REGION
  );
  speechConfig.speechRecognitionLanguage = language;

  const audioConfig = sdk.AudioConfig.fromWavFileInput(
    fs.readFileSync(wavPath)
  );
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  const azurePromise = new Promise<string>((resolve, reject) => {
    try {
      recognizer.recognizeOnceAsync((result) => {
        try {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result.text);
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            reject(new Error("No speech could be recognized"));
          } else {
            const cancel = sdk.CancellationDetails.fromResult(result);
            reject(
              new Error(`Canceled: ${cancel.reason} | ${cancel.errorDetails}`)
            );
          }
        } finally {
          try {
            recognizer.close();
          } catch (_) {}
        }
      });
    } catch (err) {
      try {
        recognizer.close();
      } catch (_) {}
      reject(err);
    }
  });

  // enforce a timeout around the SDK call
  return withTimeout(azurePromise, sdkTimeoutMs, "Azure recognition timed out");
}

// Retry wrapper with exponential backoff
async function transcribeWavWithRetries(
  wavPath: string,
  language = "en-US",
  attempts = 3,
  initialDelayMs = 500,
  sdkTimeoutMs = 15000
): Promise<string> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < attempts) {
    try {
      attempt += 1;
      return await transcribeWavOnce(wavPath, language, sdkTimeoutMs);
    } catch (err: any) {
      const isLast = attempt >= attempts;
      console.warn(
        `Azure transcription attempt ${attempt} failed: ${
          err?.message || err
        }. ${isLast ? "No more retries." : `Retrying in ${delay}ms...`}`
      );
      if (isLast) throw err;
      // wait with jitter
      const jitter = Math.floor(Math.random() * 100);
      await new Promise((res) => setTimeout(res, delay + jitter));
      delay *= 2; // exponential backoff
    }
  }

  // Should never reach here
  throw new Error("Azure transcription failed after retries");
}

// Final function for azure transcription (stub + retries + cleanup)
export async function azureSpeechFromUrl(
  audioUrl: string,
  language = "en-US",
  options?: {
    attempts?: number;
    initialDelayMs?: number;
    sdkTimeoutMs?: number;
  }
) {
  const {
    attempts = 3,
    initialDelayMs = 500,
    sdkTimeoutMs = 15000,
  } = options || {};

  const downloadedPath = await downloadAudio(audioUrl);
  const wavPath = await ensureWav(downloadedPath);

  try {
    // If keys are missing, return a stubbed transcription (do not throw)
    if (!AZURE_KEY || !AZURE_REGION) {
      console.log("Azure keys missing. Returning stubbed transcription.");
      return `Stubbed Azure transcription for ${path.basename(wavPath)}`;
    }

    // Real Azure flow with retries and timeout
    const text = await transcribeWavWithRetries(
      wavPath,
      language,
      attempts,
      initialDelayMs,
      sdkTimeoutMs
    );
    return text;
  } finally {
    // Clean up temp files from local
    try {
      if (fs.existsSync(downloadedPath)) fs.unlinkSync(downloadedPath);
    } catch (e) {}
    try {
      if (fs.existsSync(wavPath) && wavPath !== downloadedPath) {
        fs.unlinkSync(wavPath);
      }
    } catch (e) {}
  }
}
