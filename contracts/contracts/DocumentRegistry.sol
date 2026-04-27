// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {
  struct DocumentRecord {
    address owner;
    uint256 timestamp;
    string metadataCID;
    bool exists;
  }

  mapping(bytes32 => DocumentRecord) private registry;
  event DocumentAnchored(bytes32 indexed hash, address indexed owner, uint256 timestamp);

  function anchorDocument(bytes32 hash, string calldata metadataCID) external {
    require(!registry[hash].exists, "Hash already anchored");
    registry[hash] = DocumentRecord(msg.sender, block.timestamp, metadataCID, true);
    emit DocumentAnchored(hash, msg.sender, block.timestamp);
  }

  function verifyDocument(bytes32 hash) external view returns (bool, address, uint256) {
    DocumentRecord memory r = registry[hash];
    return (r.exists, r.owner, r.timestamp);
  }

  function getMetadata(bytes32 hash) external view returns (string memory) {
    require(registry[hash].exists, "Hash not found");
    return registry[hash].metadataCID;
  }
}
