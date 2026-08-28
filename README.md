# Study_Pulse

StudyPulse is an AI-powered study-session tracker that allows students to record study sessions, monitor progress, earn XP through Study Quest, and receive AI-generated study insights. It will be installable as a Progressive Web App.

## Quick Start

### Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

### Backend (port 3000)
```bash
cd backend
npm install
npm run dev
```

### Health Check
```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

## Project Structure
```
Study_Pulse/
├── frontend/     # React + TypeScript + Vite
├── backend/      # Express + TypeScript
├── .gitignore
└── README.md
```