# ShieldLedger - Setup Guide

Tamper-evident document notarization on Polygon blockchain with AWS S3 storage.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Hardhat (for local blockchain)
- AWS Account (for S3 storage)

## Quick Start

### 1. Database Setup

```bash
# Start PostgreSQL (if not running)
brew services start postgresql

# Create database and user
psql -U $(whoami) -d postgres
```

```sql
CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'secret';
CREATE DATABASE shieldledger OWNER postgres;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=4000
DATABASE_URL="postgresql://postgres:secret@localhost:5432/shieldledger"
JWT_SECRET="YOUR_JWT_SECRET_HERE"

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET=shieldledger-docs

FRONTEND_URL=http://localhost:3000
EOF

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start backend server
node src/index.js
```

Backend will run on `http://localhost:4000`

### 3. Blockchain Setup (Local Hardhat)

```bash
cd contracts

# Install dependencies
npm install

# Start local Hardhat node (in a new terminal)
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

The contract address will be displayed. Update `contracts/.env` if needed:

```bash
MUMBAI_RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEPLOYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Frontend .env.local is already configured
# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Architecture

```
Next.js 14 (Frontend)
    ↓ (API Proxy)
Node.js/Express (Backend)
    ↓
PostgreSQL (User/Document DB)
    ↓
Bull Queue (Async Jobs)
    ↓
Polygon/Hardhat (Blockchain)

Files → AWS S3 (AES-256 encrypted)
```

## Key Features

- **User Registration & Authentication** - JWT-based auth with bcrypt password hashing
- **Document Upload** - Multipart file upload to AWS S3 with encryption
- **Blockchain Anchoring** - SHA-3 hash anchored to Polygon smart contract
- **Document Verification** - Verify authenticity by hash or file upload
- **Certificate Generation** - PDF certificates with QR codes
- **Audit Trail** - Complete version history and signatory tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `PATCH /api/auth/password` - Update password

### Documents (Authenticated)
- `GET /api/documents` - List user's documents
- `POST /api/documents/upload` - Upload and anchor document
- `GET /api/documents/:id/certificate` - Download PDF certificate
- `GET /api/documents/:id/audit` - Download audit report
- `POST /api/documents/:id/signatories` - Invite signatory
- `POST /api/documents/:id/version` - Upload new version

### Verification (Public)
- `GET /api/verify?hash=<hash>` - Verify document by hash
- `POST /api/verify` - Verify document by file upload

### Prototype (Blockchain Direct)
- `POST /api/prototype/anchor` - Anchor hash directly
- `GET /api/prototype/verify?hash=<hash>` - Verify from blockchain
- `GET /api/prototype/documents` - List all blockchain anchors

## Troubleshooting

### Backend won't start
```bash
# Check if Postgres is running
psql -U postgres -d shieldledger -c "SELECT 1"

# Regenerate Prisma client
cd backend && npx prisma generate
```

### Frontend shows "Cannot GET /api/auth/error"
```bash
# Restart Next.js dev server
cd frontend
pkill -f "next dev"
npm run dev
```

### Blockchain connection fails
```bash
# Ensure Hardhat node is running
cd contracts
npx hardhat node

# Check contract is deployed
npx hardhat run scripts/deploy.js --network localhost
```

### AWS S3 upload fails
- Verify AWS credentials in `backend/.env`
- Check S3 bucket exists and has correct permissions
- Ensure bucket region matches `AWS_REGION`

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (ap-south-1)
- `AWS_S3_BUCKET` - S3 bucket name
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXTAUTH_URL` - NextAuth base URL (http://localhost:3000)
- `NEXTAUTH_SECRET` - NextAuth session secret

### Contracts (.env)
- `MUMBAI_RPC_URL` - Blockchain RPC URL
- `DEPLOYER_PRIVATE_KEY` - Deployer wallet private key
- `CONTRACT_ADDRESS` - Deployed contract address

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- NextAuth.js (Authentication)
- Framer Motion (Animations)
- React Hot Toast (Notifications)

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Bull (Job Queue)
- AWS SDK (S3)
- PDFKit (Certificate generation)
- Nodemailer (Email invites)

**Blockchain:**
- Hardhat
- Ethers.js v6
- Solidity 0.8.x
- Polygon Mumbai (Testnet)

## License

MIT
