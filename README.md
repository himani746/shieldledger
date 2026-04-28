🛡️ ShieldLedger

**Immutable Document Notarization & AI-Powered Classification**

ShieldLedger is a decentralized "Global Notary" platform that anchors the SHA-3 cryptographic fingerprints of digital documents onto the Polygon blockchain. It provides a permanent, tamper-proof record that anyone can verify for free, without needing a centralized authority. 

🚀 The Problem

Digital document fraud costs organizations billions annually. Traditional solutions (like DocuSign) are centralized, expensive ($2–$5/envelope), and create "data silos". If the provider goes offline, your     proof of authenticity vanishes.  

✨ Key Features

  • Blockchain Anchoring: Permanent SHA-3 hashing on Polygon Mumbai for ~$0.001 per document.  
  
  • AI Classification: Integrated Google Gemini AI to automatically categorize documents (Contracts, NDAs, Invoices). 
  
  • Permissionless Verification: A public /verify engine that allows anyone to validate a document's integrity without an account.
  
  • Privacy-First: Only document hashes are stored on-chain; original files remain private and encrypted. 
  
  • Smart Certificates: Generates a "Proof of Integrity" PDF with a QR code for instant mobile verification.  
  

🛠️ Tech Stack

  • Frontend: Next.js 14, TypeScript, Tailwind CSS. 
  
  • Backend: Node.js, Express.js, Prisma v7.  
  
  • Infrastructure: Google Cloud Run, Cloud SQL (PostgreSQL), Redis (Memorystore).  
  
  • Web3: Solidity, Hardhat, Ethers.js, Polygon Mumbai.  
  
  • AI: Google Gemini API. 
  
  • Queue Management: Bull Queue & Redis for scalable transaction processing. 

🏗️ Architecture Flow

  1. Upload: User uploads a PDF to the Next.js frontend.
  2. 
  3. Process: Backend computes a SHA-3-256 hash and stores encrypted metadata in PostgreSQL.
  4. 
  5. Queue: A Bull worker picks up the job to manage gas costs and retries.
  6. 
  7. Anchor: The hash is written to the DocumentRegistry.sol smart contract on Polygon.
  
  8. Classify: Gemini AI extracts text and tags the document type for the dashboard.
     

🔧 Getting Started

**Prerequisites**

  • Docker & Docker Compose
  
  • Node.js (v18+)
  
  • Polygon Mumbai RPC URL (Alchemy/Infura)
  

🔮 Roadmap

  • Polygon Mainnet: Transitioning to production-ready mainnet deployment. 
  
  • ZK-Proofs: Privacy-preserving verification (Verify document age/status without revealing full text).
  
  • Browser Extension: One-click verification for PDFs opened in Chrome/Edge. 
  
  • Multi-chain Support: Expansion to Arbitrum and Base. 
  

🔗 Links

  • Live Demo: shieldledger.vercel.app   
  
  • GitHub: himani746/shieldledger    
  
