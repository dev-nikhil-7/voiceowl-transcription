export type TranscriptionStatus = "transcribed" | "review" | "approved";

export interface CreateTranscriptionReq {
  audioUrl: string;
  language?: string;
}

export interface ReviewMetadata {
  reviewer?: string;
  comment?: string;
  reviewedAt?: string; //
}

export interface TranscriptionDoc {
  _id: string;
  audioUrl: string;
  transcription: string;
  source?: string; // "local" | "azure"
  status: TranscriptionStatus;

  review?: ReviewMetadata;

  createdAt?: string; //
  updatedAt?: string;
}
