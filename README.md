# ShieldLedger
Tamper-evident document notarisation on Polygon blockchain.

## Setup
1. cp .env.example .env
2. docker compose up
3. cd frontend && npm run dev
4. cd backend && npx prisma migrate dev

## Architecture
Next.js 14 → Node.js/Express → Bull Queue → Polygon Mumbai  
Files: AWS S3 (AES-256 encrypted)

## Live Demo
(URL added after deploy)
