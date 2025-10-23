const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying PollFactorySepolia to Sepolia Coprocessor network...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("PollFactorySepolia");
  const contract = await Factory.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✅ Deployed PollFactorySepolia at:", contractAddress);

  // Save deployment info
  const output = {
    network: "sepolia",
    address: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync("deployment.json", JSON.stringify(output, null, 2));
  console.log("💾 Saved deployment.json");

  // Verify
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log(code !== "0x" ? "✅ Contract verified on chain" : "❌ Deployment failed!");
  
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend/.env with new address:");
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Run: npx hardhat run scripts/create_poll_with_fhe.js --network sepolia");
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exit(1);
});

