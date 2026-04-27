import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("DocumentRegistry", function () {
  let registry: any;
  let owner: any;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DocumentRegistry");
    registry = await Factory.deploy();
  });

  it("anchors a document and stores owner + timestamp", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("test-doc"));
    await registry.anchorDocument(hash, "ipfs://QmTest");
    const [exists, addr, ts] = await registry.verifyDocument(hash);
    expect(exists).to.equal(true);
    expect(addr).to.equal(owner.address);
    expect(ts).to.be.gt(0);
  });

  it("rejects duplicate anchoring of the same hash", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("duplicate"));
    await registry.anchorDocument(hash, "ipfs://QmFirst");
    await expect(
      registry.anchorDocument(hash, "ipfs://QmSecond")
    ).to.be.revertedWith("Hash already anchored");
  });

  it("returns false for a hash never anchored", async () => {
    const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("not-real"));
    const [exists] = await registry.verifyDocument(fakeHash);
    expect(exists).to.equal(false);
  });

  it("detects a tampered file via different hash", async () => {
    const realHash = ethers.keccak256(ethers.toUtf8Bytes("original"));
    const tamperedHash = ethers.keccak256(ethers.toUtf8Bytes("tampered"));
    await registry.anchorDocument(realHash, "");
    const [realExists] = await registry.verifyDocument(realHash);
    const [tamperedExists] = await registry.verifyDocument(tamperedHash);
    expect(realExists).to.equal(true);
    expect(tamperedExists).to.equal(false);
  });

  it("stores and retrieves metadata CID", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("meta-test"));
    await registry.anchorDocument(hash, "ipfs://QmMetadata");
    const cid = await registry.getMetadata(hash);
    expect(cid).to.equal("ipfs://QmMetadata");
  });
});
