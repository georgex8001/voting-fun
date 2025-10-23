const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 SecretVoting 合约到 Sepolia 测试网...\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户地址:", deployer.address);

  // 查询账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ 错误: 账户余额为0，请先获取测试网ETH");
    console.log("💡 获取测试ETH: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // 部署合约
  console.log("📦 正在编译和部署合约...");
  const SecretVoting = await hre.ethers.getContractFactory("SecretVoting");
  const secretVoting = await SecretVoting.deploy();

  await secretVoting.waitForDeployment();
  const contractAddress = await secretVoting.getAddress();

  console.log("\n✅ 合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 在 Etherscan 查看:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("\n📋 部署信息:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 等待几个区块确认
  console.log("\n⏳ 等待区块确认...");
  await secretVoting.deploymentTransaction().wait(5);
  console.log("✅ 已确认!");

  console.log("\n🎉 部署完成!");
  console.log("\n📝 下一步:");
  console.log("1. 复制合约地址到前端配置文件");
  console.log("2. 更新 .env 文件中的 CONTRACT_ADDRESS");
  console.log("3. 运行前端项目测试功能");
  
  console.log("\n💡 创建测试投票示例:");
  console.log(`await contract.createPoll("你喜欢的编程语言?", ["JavaScript", "Python", "Rust"], 86400);`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:");
    console.error(error);
    process.exit(1);
  });


