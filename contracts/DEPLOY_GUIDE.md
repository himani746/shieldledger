# ShieldLedger Deployment Guide

## Step 1 — Generate wallet (run once)
node scripts/generateWallet.js
This creates a new wallet and saves the private key to .env automatically.

## Step 2 — Get Alchemy RPC URL
1. Go to alchemy.com and sign up free
2. Create new app — Chain: Polygon — Network: Polygon Amoy
3. Click API Key — copy the HTTPS URL
4. Open .env and paste it as MUMBAI_RPC_URL

## Step 3 — Get free test MATIC
1. Go to faucet.polygon.technology
2. Select Polygon Amoy
3. Paste your DEPLOYER_ADDRESS from .env
4. Click Submit — wait 2 minutes

## Step 4 — Check balance
node scripts/checkBalance.js
Must show: "STATUS: Ready to deploy"

## Step 5 — Deploy to local (no MATIC needed)
In terminal 1: npx hardhat node
In terminal 2: node scripts/fullDeploy.js localhost

## Step 6 — Deploy to Amoy testnet (needs MATIC)
node scripts/fullDeploy.js amoy

## Step 7 — Verify contract on Polygonscan
npx hardhat verify --network amoy CONTRACT_ADDRESS

## Step 8 — Test the full flow
node scripts/testAnchorService.js
