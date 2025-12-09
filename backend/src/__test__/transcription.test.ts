import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import transcriptionRoutes from "../routes/transcription.routes";
import { connectDB, disconnectDB } from "../utils/mongo";

const app = express();
app.use(bodyParser.json());
app.use("/api/v1", transcriptionRoutes);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /api/v1/transcription", () => {
  it("creates a transcription and returns id", async () => {
    const res = await request(app)
      .post("/api/v1/transcription")
      .send({ audioUrl: "https://example.com/test.mp3" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("fails if audioUrl missing", async () => {
    const res = await request(app).post("/api/v1/transcription").send({});
    expect(res.status).toBe(400);
  });
});
