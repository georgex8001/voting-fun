/**
 * 创建快速测试投票（1分钟后结束，方便测试解密功能）
 */

const hre = require("hardhat");

async function main() {
  console.log("🎮 创建快速测试投票...\n");

  // 合约地址（刚部署的）
  const contractAddress = "0xC6bb1eb417b4C0AC5D7E411d6b801608b1064811";

  // 获取合约实例
  const SecretVoting = await hre.ethers.getContractFactory("SecretVoting");
  const contract = SecretVoting.attach(contractAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("👤 账户:", signer.address);

  // 创建投票（60秒后结束）
  console.log("\n📝 创建测试投票...");
  const title = "你最喜欢的编程语言？";
  const options = ["JavaScript", "Python", "Rust", "Go"];
  const duration = 60; // 60秒 = 1分钟

  try {
    const tx = await contract.createPoll(title, options, duration);
    console.log("📤 交易已提交:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ 交易已确认");

    // 获取投票ID
    const pollCount = await contract.pollCount();
    console.log("\n🎉 投票创建成功!");
    console.log("📍 投票ID:", pollCount.toString());
    console.log("⏰ 将在 1 分钟后结束");
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    
    console.log("\n📝 下一步:");
    console.log("1. 等待 1 分钟");
    console.log("2. 刷新前端页面");
    console.log("3. 进入投票详情页");
    console.log("4. 点击 'Request Decryption' 按钮");
    console.log("5. 观察进度条！");

  } catch (error) {
    console.error("❌ 创建失败:", error.message);
    
    if (error.message.includes("At least 2 options required")) {
      console.log("\n💡 提示: 需要使用前端创建投票，因为需要 FHE 加密");
      console.log("   请在前端页面点击 'Create Poll' 按钮");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


