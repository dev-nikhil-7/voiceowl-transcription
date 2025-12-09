import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Workflow Status Types
 */
export type TranscriptionStatus = "transcribed" | "review" | "approved";

/**
 * TypeScript Interface
 * This must ALWAYS match the schema fields
 */
export interface ITranscription extends Document {
  audioUrl: string;
  transcription?: string;
  source?: string;

  // Workflow state
  status: TranscriptionStatus;

  // Optional review metadata
  review?: {
    reviewer?: string;
    comment?: string;
    reviewedAt?: Date;
  };

  createdAt: Date;
  updatedAt?: Date;
}

/**
 *  Mongoose Schema
 */
const TranscriptionSchema = new Schema<ITranscription>(
  {
    audioUrl: {
      type: String,
      required: true,
    },

    transcription: {
      type: String,
    },

    source: {
      type: String,
      default: "local",
    },

    // Workflow field
    status: {
      type: String,
      enum: ["transcribed", "review", "approved"],
      default: "transcribed",
    },

    //  Review Metadata
    review: {
      reviewer: { type: String },
      comment: { type: String },
      reviewedAt: { type: Date },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);

/**
 * Final Model Export
 */
export const Transcription: Model<ITranscription> =
  mongoose.models.Transcription ||
  mongoose.model<ITranscription>("Transcription", TranscriptionSchema);
