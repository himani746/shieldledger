export type DocumentStatus = "anchoring" | "confirmed" | "tampered";

export type MockDocument = {
  id: string;
  title: string;
  date: string;
  hash: string;
  status: DocumentStatus;
  txHash: string | null;
  block: number | null;
};

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: "1",
    title: "Supplier Contract Q1 2024",
    date: "2024-01-15",
    hash: "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    status: "confirmed",
    txHash: "0x02073afeb4957cfc3cf0a4557629854f3d9d40b7",
    block: 42891234,
  },
  {
    id: "2",
    title: "NDA with TechVendor Solutions",
    date: "2024-01-20",
    hash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    status: "anchoring",
    txHash: null,
    block: null,
  },
  {
    id: "3",
    title: "Invoice #4521 — January",
    date: "2024-01-22",
    hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    status: "tampered",
    txHash: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    block: 42891100,
  },
  {
    id: "4",
    title: "Employment Contract — Raj Kumar",
    date: "2024-01-25",
    hash: "0xdeadbeef1234567890abcdef1234567890abcdef",
    status: "confirmed",
    txHash: "0xabc123def456789012345678901234567890abcd",
    block: 42891500,
  },
  {
    id: "5",
    title: "Vendor Agreement — CloudServ",
    date: "2024-01-28",
    hash: "0xfeedface9876543210fedcba9876543210fedcba",
    status: "confirmed",
    txHash: "0x9876543210abcdef9876543210abcdef12345678",
    block: 42891750,
  },
];

export const MOCK_ORG = {
  name: "TechCorp Pvt Ltd",
  email: "admin@techcorp.com",
};

export const DEMO_HASH =
  "0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f";
export const TAMPERED_HASH = "0xdeadbeefdeadbeefdeadbeefdeadbeef00000000";
