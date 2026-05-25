import mongoose from "mongoose";

export async function connectMongo(url, { tries = 5, delayMs = 1000 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      await mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
      return mongoose;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}
