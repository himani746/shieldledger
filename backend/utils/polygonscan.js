function txUrl(txHash) {
  return `https://mumbai.polygonscan.com/tx/${txHash}`;
}

function addressUrl(address) {
  return `https://mumbai.polygonscan.com/address/${address}`;
}

module.exports = { txUrl, addressUrl };
