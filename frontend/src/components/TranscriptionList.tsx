import type { Transcription } from "../types/transcription";

export default function TranscriptionList({
  items,
}: {
  items: Transcription[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Last 30 Days</h2>

      {items.length === 0 && (
        <p className="text-gray-400 text-sm">No transcriptions found</p>
      )}

      <div className="space-y-4">
        {items.map((t) => (
          <div
            key={t._id}
            className="p-4 rounded-xl bg-black/40 border border-gray-700"
          >
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{t._id}</span>
              <span>{new Date(t.createdAt).toLocaleString()}</span>
            </div>

            <p className="text-sm text-gray-200">{t.transcription}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
