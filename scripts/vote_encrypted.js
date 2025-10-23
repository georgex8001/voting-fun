const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

const fhevm = require("fhevmjs");

const SDK_CONFIG = {
  chainId: 11155111,
  networkUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY || process.env.INFURA_API_KEY}`,
  gatewayUrl: "https://gateway.sepolia.zama.ai/",
  relayerUrl: "https://relayer.testnet.zama.cloud",
  aclAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
};

async function main() {
  console.log("🗳️ Casting encrypted vote...\n");

  const { address: contractAddress } = JSON.parse(fs.readFileSync("deployment.json"));
  const [signer] = await ethers.getSigners();
  console.log("👤 Using wallet:", signer.address);
  
  const contract = await ethers.getContractAt("PollFactorySepolia", contractAddress);

  const pollId = 1;
  const selectedOptionIndex = 0; // YES = 0

  console.log(`📊 Voting for option ${selectedOptionIndex} (YES) in poll ${pollId}...`);

  console.log("🔐 Initializing fhevmjs (fetch public key)...");
  if (typeof fhevm.initFhevm === "function") {
    try { await fhevm.initFhevm(); } catch (_) {}
  }
  const publicKey = await fhevm.getPublicKeyFromNetwork(SDK_CONFIG.networkUrl);
  const sdk = await fhevm.createInstance({ ...SDK_CONFIG, publicKey });
  console.log("✅ SDK initialized");

  console.log("🔒 Encrypting vote...");
  // fhevmjs 顺序：contractAddress, userAddress
  const enc = sdk.createEncryptedInput(contractAddress, signer.address);
  enc.add32(selectedOptionIndex);
  const { handles, inputProof } = enc.encrypt();
  const ciphertext = handles[0];
  const attestation = inputProof;

  console.log("📡 Sending encrypted vote transaction...");
  const tx = await contract.vote(pollId, ciphertext, attestation);
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();

  console.log("✅ Vote submitted!");
  console.log("   Tx hash:", receipt.hash);
  console.log("   Block:", receipt.blockNumber);
}

main().catch((err) => {
  console.error("❌ vote failed:", err);
  console.error("Error details:", err.message);
  process.exit(1);
});

