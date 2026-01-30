# P24 Payment Demo

Demo aplikacji pokazującej pełny flow płatności online
(zamówienie → płatność → webhook → aktualizacja statusu).

## Tech stack
- Backend: Node.js, Express
- Database: SQLite
- Frontend: React + TypeScript + Vite
- Payments: Przelewy24 (sandbox / webhook simulation)
- Dev tools: ngrok

## Features
- Tworzenie zamówień
- Status płatności (pending / paid / failed)
- Webhook (notify) aktualizujący status
- Frontend polling statusu
- Strona statusu płatności

## Flow
1. Klient tworzy zamówienie
2. Otrzymuje status `pending`
3. Po otrzymaniu webhooka status zmienia się na `paid`
4. Frontend aktualizuje widok bez odświeżania strony

## Run locally

### Backend
```bash
cd backend
npm install
node index.js

Frontend
cd frontend
npm install
npm run dev