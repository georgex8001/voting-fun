const { execSync } = require("child_process");

async function run(cmd) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`▶️  ${cmd}`);
  console.log("=".repeat(60));
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (error) {
    console.error(`\n❌ Command failed: ${cmd}`);
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   🏗️  Full fhEVM Coprocessor Test Flow on Sepolia   ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("\n");

  console.log("📋 Test Flow:");
  console.log("  1. Deploy PollFactorySepolia contract");
  console.log("  2. Create a poll with encrypted initial counts");
  console.log("  3. Cast an encrypted vote");
  console.log("\n");

  await run("npx hardhat run scripts/deploy_sepolia_coprocessor.js --network sepolia");
  
  console.log("\n⏳ Waiting 5 seconds for blockchain to settle...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await run("npx hardhat run scripts/create_poll_with_fhe.js --network sepolia");
  
  console.log("\n⏳ Waiting 5 seconds for blockchain to settle...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await run("npx hardhat run scripts/vote_encrypted.js --network sepolia");

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║          ✅ All steps completed successfully!         ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("\n");
  console.log("📊 Summary:");
  console.log("  - Contract deployed and verified on Sepolia");
  console.log("  - Poll created with FHE encrypted vote counts");
  console.log("  - Encrypted vote submitted and confirmed");
  console.log("\n");
  console.log("🎉 Your fhEVM voting system is working on Sepolia!");
  console.log("\n");
}

main().catch((error) => {
  console.error("\n❌ Full test flow failed:", error);
  process.exit(1);
});

