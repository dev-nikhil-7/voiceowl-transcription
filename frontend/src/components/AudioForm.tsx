import { useState } from "react";
import { api } from "../services/api";

export default function AudioForm({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!audioUrl) return alert("Please enter audio URL");

    try {
      setLoading(true);
      const res = await api.post("/transcription", { audioUrl });
      onCreated(res.data.id);
      setAudioUrl("");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Submit Audio URL</h2>

      <input
        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder="Enter audio URL"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition font-semibold"
      >
        {loading ? "Processing..." : "Send for Transcription"}
      </button>

      <p className="text-xs text-gray-400 mt-3">
        Example: http://localhost:5000/uploads/test.m4a
      </p>
    </div>
  );
}
