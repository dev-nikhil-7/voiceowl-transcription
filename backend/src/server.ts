import express from "express";
import bodyParser from "body-parser";
import transcriptionRoutes from "./routes/transcription.routes";
import { PORT } from "./utils/config";
import { connectDB } from "./utils/mongo";
import cors from "cors";
const app = express();
app.use(bodyParser.json());
//serve static files
app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use("/api/v1", transcriptionRoutes);

app.get("/", (req, res) => res.send("VoiceOwl evaluation API"));

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start", err);
  process.exit(1);
});
