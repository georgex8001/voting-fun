const hre = require("hardhat");

async function main() {
  console.log("🧪 部署测试合约（不使用 FHEVM）...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  const SimpleVotingTest = await hre.ethers.getContractFactory("SimpleVotingTest");
  const contract = await SimpleVotingTest.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ 测试合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  console.log("\n🧪 测试创建投票...");
  const tx = await contract.createPoll(
    "测试投票",
    ["选项A", "选项B"],
    86400
  );
  
  await tx.wait();
  console.log("✅ 测试投票创建成功!");
  
  const pollCount = await contract.pollCount();
  console.log("📊 投票数量:", pollCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


