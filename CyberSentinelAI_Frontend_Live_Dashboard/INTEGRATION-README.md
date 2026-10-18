# CyberSentinel AI frontend integration

This frontend is Next.js + React. The integration patch forwards `/api/analyze` to the existing Node.js Express backend at `http://127.0.0.1:3000/api/predict`. Do not replace the existing ML model or backend.

## Run it locally on Windows

1. Extract this ZIP into a separate folder; do not extract it over the backend project.
2. Open PowerShell in this frontend folder.
3. Install dependencies: `npm install` (or use Bun if already installed).
4. Copy `.env.local.example` to `.env.local`. The default backend URL is already correct for local development. Do not put the Gemini API key in the frontend environment file.
5. Start the existing FastAPI ML service on port 8000 and existing Node.js backend on port 3000, as you have already been doing. Check `http://127.0.0.1:3000/health`.
6. Start the frontend on port 3001: `npm run dev -- --port 3001`.
7. Open `http://localhost:3001`, go to Analyzer, choose a sample or enter feature values, and click Analyze traffic.

## Important

- Frontend port 3001 is intentional because the existing Express backend uses port 3000.
- Dashboard and Model Insights now check the actual Node.js and FastAPI health endpoints. Prediction charts/history are based on successful analyses in this local demo session and are not network-wide telemetry. The Analyzer loads the first matching labelled rows from `training_sample.csv` when the backend data folder is available, so a selected attack profile is sent to the real model instead of a hand-authored synthetic vector. Set `CYBERSENTINEL_SAMPLE_DATA` when the backend data is not in the default sibling folder; synthetic profiles remain the standalone fallback.
- The backend returns a model score and global feature-importance context, not calibrated class probabilities or sample-specific feature attributions. The UI wording avoids claiming those are available. Accuracy/F1 and training-distribution metrics are not shown as live because the backend health endpoints do not provide a verified evaluation report.
- No live packet capture or automatic blocking is implemented by this integration.
