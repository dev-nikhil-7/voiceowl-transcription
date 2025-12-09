import axios from "axios";

export async function downloadWithRetry(
  url: string,
  attempts = 3,
  baseDelayMs = 200
): Promise<Buffer> {
  let lastError: any = null;
  for (let i = 0; i < attempts; i++) {
    try {
      // Mock behavior:
      if (url.includes("fail") && i < attempts - 1)
        throw new Error("Simulated download failure");
      // return a dummy buffer representing audio content
      return Buffer.from(`audio-binary-mock:${url}`);
    } catch (err) {
      lastError = err;
      const delay = baseDelayMs * Math.pow(2, i); // exponential backoff
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
