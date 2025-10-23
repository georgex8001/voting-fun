const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

// 使用 fhevmjs（通过模块对象访问）
const fhevm = require("fhevmjs");

const SDK_CONFIG = {
  chainId: 11155111,
  networkUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY || process.env.INFURA_API_KEY}`,
  gatewayUrl: "https://gateway.sepolia.zama.ai/",
  relayerUrl: "https://relayer.testnet.zama.cloud",
  aclAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
};

async function main() {
  console.log("🧠 Creating poll with encrypted zero counts...\n");

  const { address: contractAddress } = JSON.parse(fs.readFileSync("deployment.json"));
  const [signer] = await ethers.getSigners();
  console.log("👤 Using wallet:", signer.address);

  const contract = await ethers.getContractAt("PollFactorySepolia", contractAddress);

  console.log("🔐 Initializing fhevmjs (fetch public key)...");
  if (typeof fhevm.initFhevm === "function") {
    try { await fhevm.initFhevm(); } catch (_) {}
  }
  // 关键：从网络获取 Coprocessor 公钥
  const publicKey = await fhevm.getPublicKeyFromNetwork(SDK_CONFIG.networkUrl);
  const sdk = await fhevm.createInstance({ ...SDK_CONFIG, publicKey });
  console.log("✅ SDK initialized");

  const title = "Will Bitcoin reach $200,000 in 2025?";
  const options = ["YES", "NO"];
  const durationHours = 48;
  const duration = durationHours * 3600;

  const encryptedZeros = [];
  const attestations = [];

  for (let i = 0; i < options.length; i++) {
    console.log(`🔐 Encrypting initial 0 for option ${options[i]}...`);
    // fhevmjs 顺序：contractAddress, userAddress
    const enc = sdk.createEncryptedInput(contractAddress, signer.address);
    enc.add32(0);
    const { handles, inputProof } = enc.encrypt();
    encryptedZeros.push(handles[0]);
    attestations.push(inputProof);
  }

  console.log("\n📡 Sending createPoll transaction...");
  const tx = await contract.createPoll(title, options, duration, encryptedZeros, attestations);
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();

  console.log("✅ Poll created!");
  console.log("   Tx hash:", receipt.hash);
  console.log("   Block:", receipt.blockNumber);
}

main().catch((err) => {
  console.error("❌ createPoll failed:", err);
  console.error("Error details:", err.message);
  process.exit(1);
});

