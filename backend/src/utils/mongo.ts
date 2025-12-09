import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MONGO_URI } from "./config";

let mongod: MongoMemoryServer | null = null;

export async function connectDB() {
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB (MONGO_URI)");
  } else {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("Connected to in-memory MongoDB");
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
