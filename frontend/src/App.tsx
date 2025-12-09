import { useEffect, useState } from "react";
import { api } from "./services/api";
import type { Transcription } from "./types/transcription";
import AudioForm from "./components/AudioForm";
import TranscriptionList from "./components/TranscriptionList";
import "./App.css";

export default function App() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);

  async function fetchTranscriptions() {
    const res = await api.get("/transcriptions");

    const payload = res.data;
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
      ? payload.items
      : [];

    setTranscriptions(list);
  }

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🎙 VoiceOwl Transcription
        </h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <AudioForm
            onCreated={(id) => {
              setLastId(id);
              fetchTranscriptions();
            }}
          />
        </div>

        {lastId && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-green-500/20 border border-green-400 text-green-300 text-center">
            Transcription Created: <b>{lastId}</b>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <TranscriptionList items={transcriptions} />
        </div>
      </div>
    </div>
  );
}
