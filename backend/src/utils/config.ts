import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const AZURE_KEY = process.env.AZURE_KEY || "";
export const AZURE_REGION = process.env.AZURE_REGION || "";
