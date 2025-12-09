# VoiceOwl Developer Evaluation – Node.js + TypeScript

This project implements a minimal transcription service using **Node.js, TypeScript, Express, MongoDB, and Azure Speech-to-Text**.  
It includes a backend API, a React + TypeScript frontend, a workflow system (review → approval), and scalability design considerations.

---

## Part 1 – Backend API (Core Functionalities)

### Create Transcription (Mocked)

POST /api/v1/transcription

Request Body:

```json
{
  "audioUrl": "https://example.com/sample.mp3"
}
```

Flow:

- Mocks audio download
- Mocks transcription
- Saves to MongoDB:

```json
{
  "audioUrl": "...",
  "transcription": "transcribed text",
  "status": "transcribed",
  "createdAt": "..."
}
```

- Returns:

```json
{ "id": "mongo_id" }
```

---

### Azure Transcription

POST /api/v1/azure-transcription

- Uses Azure Speech-to-Text
- Falls back to stub if credentials are missing
- Saves with `source: "azure"`

---

### Fetch Last 30 Days Transcriptions

GET /api/v1/transcriptions

Returns all records created in the last 30 days.

---

## Part 2 – MongoDB Query & Indexing

Query:

```
createdAt >= now - 30 days
```

Recommended Index:

```js
db.transcriptions.createIndex({ createdAt: -1 });
```

Optional:

- TTL Index:

```js
db.transcriptions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
);
```

- Compound:

```js
{ source: 1, createdAt: -1 }
```

---

## Workflow System (Transcription → Review → Approval)

Workflow States:

```
transcribed → review → approved
```

Workflow APIs:

| Action                        | Method | Endpoint                           |
| ----------------------------- | ------ | ---------------------------------- |
| List completed transcriptions | GET    | /api/v1/transcriptions/transcribed |
| Send to review                | POST   | /api/v1/transcriptions/:id/review  |
| List review queue             | GET    | /api/v1/transcriptions/review      |
| Approve transcription         | POST   | /api/v1/transcriptions/:id/approve |

Workflow state is stored in MongoDB under the `status` field.

---

## Part 3 – Scalability & System Design

To support 10k+ concurrent requests:

### 1. Queue-Based Processing

- Use Redis Queue / BullMQ / AWS SQS
- API enqueues transcription jobs
- Worker services process asynchronously

### 2. Horizontal Scaling

- Docker containers
- Kubernetes / AWS ECS
- Auto-scaling

### 3. Caching & Database Optimization

- Redis caching
- MongoDB indexes on `createdAt` and `status`

### 4. Load Balancer

- Nginx or AWS ALB for traffic distribution

---

## Part 4 – Azure Speech Integration

- Azure Cognitive Services (Speech SDK)
- Environment variables:

```
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
```

- Supports language selection (e.g., `en-US`)
- Handles missing credentials gracefully

---

## Tech Stack

### Backend

- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- MongoMemoryServer (local testing)
- dotenv
- Jest

### Frontend

- Vite + React
- TypeScript
- Axios
- CSS / Tailwind

---

## Environment Variables

Create `.env` in backend root:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/voiceowl
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=your_region
```

If `MONGODB_URI` is not set, MongoMemoryServer is used automatically.

---

## Running Backend

```bash
npm install
npm run dev
```

Backend URL:

```
http://localhost:5000/api/v1
```

---

## Running Backend Tests

```bash
npm run test
```

---

## Frontend (React + TypeScript)

Located in `/frontend`.

### Features

- Audio URL input
- Calls `POST /api/v1/transcription`
- Shows transcription ID
- Lists all transcriptions
- Workflow actions (Review / Approve)
- Status badges

### Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

### Frontend Environment (optional)

Create `/frontend/.env`:

```env
VITE_API_BASE=http://localhost:5000/api/v1
```

---

## Assumptions

- Audio URLs are publicly accessible
- Transcription and download are mocked for evaluation
- Azure Speech runs if credentials are provided
- No authentication implemented
- Frontend is for testing/demo

---

## Improvements for Production

- Stream audio directly into Azure
- Store audio in S3 / Blob Storage
- Authentication & RBAC workflow
- Logging, metrics, distributed tracing
- Rate limiting
- Intelligent retry with backoff

---
