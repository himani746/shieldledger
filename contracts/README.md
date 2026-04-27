# ShieldLedger Contracts

## 1. Setup

```bash
npm install
cp .env.example .env
```

- Fill in `MUMBAI_RPC_URL` (get from alchemy.com, create free app on Polygon Mumbai)
- Fill in `DEPLOYER_PRIVATE_KEY` (generate fresh wallet, NEVER use a real wallet)
- Fill in `POLYGONSCAN_API_KEY` (get free from polygonscan.com/register)

## 2. Get test MATIC

- Go to faucet.polygon.technology
- Paste your wallet address
- Wait 1-2 minutes

## 3. Check balance

```bash
npx hardhat run scripts/check-balance.ts --network mumbai
```

## 4. Run tests

```bash
npx hardhat test
```

Must show `5 passing`.

## 5. Deploy

```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

- Copy the printed address into `.env` as `CONTRACT_ADDRESS`
- Also add `CONTRACT_ADDRESS` to `/ShieldLedger/backend/.env`

## 6. Export ABI

```bash
node scripts/exportAbi.js
```

## 7. Test the bridge service

```bash
node scripts/testAnchorService.js
```

## 8. Verify on Polygonscan

```bash
npx hardhat verify --network mumbai YOUR_CONTRACT_ADDRESS
```

## 9. Stress test

```bash
node scripts/stressTest.js
```

## 10. Gas costs

- ~46,000 gas per `anchorDocument` call
- ~$0.001 to $0.003 USD per document on Polygon
