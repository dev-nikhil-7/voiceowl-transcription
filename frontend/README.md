# VoiceOwl Frontend (React + TypeScript)

This is the frontend application for the VoiceOwl Transcription System.  
It provides a simple user interface to submit audio URLs for transcription and view transcription results

---

## Features

- Input field to submit an `audioUrl`
- Sends requests to:
  - `POST /api/v1/transcription`
- Displays:
  - Generated **Transcription ID**
  - List of all transcriptions using `GET /api/v1/transcriptions`
- Clean, minimal, and responsive UI

---

## Tech Stack

- **Vite + React**
- **TypeScript**
- **Axios** for API communication
- **Tailwind CSS / Basic CSS** for styling

---

## Project Structure

src/
├── components/
│ ├── AudioForm.tsx
│ └── TranscriptionList.tsx
│
├── services/
│ └── api.ts
│
├── types/
│ └── transcription.ts
│
├── App.tsx
├── main.tsx
└── App.css

---

## Prerequisites

- Node.js v18 or above
- Backend server running on:

---

## Installation & Run

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start at:

http://localhost:5173

## Environment Variables (Optional)

To override the backend API base URL, create a .env file inside the frontend directory:

VITE_API_BASE=http://localhost:5000/api/v1
