const { ethers } = require("hardhat");

/**
 * 从助记词生成私钥并保存到 .env
 */
async function main() {
  const mnemonic = process.env.MNEMONIC;
  
  if (!mnemonic) {
    console.error("❌ 错误: 请在 .env 文件中设置 MNEMONIC");
    process.exit(1);
  }

  console.log("📝 从助记词生成私钥...\n");

  // 从助记词创建钱包
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  
  console.log("✅ 钱包信息:");
  console.log("地址:", wallet.address);
  console.log("私钥:", wallet.privateKey);
  
  // 检查余额
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
  );
  
  const walletWithProvider = wallet.connect(provider);
  const balance = await walletWithProvider.provider.getBalance(wallet.address);
  
  console.log("\n💰 账户余额:");
  console.log(ethers.formatEther(balance), "SepoliaETH");
  
  if (balance === 0n) {
    console.log("\n⚠️  警告: 账户余额为 0，请先获取测试币!");
    console.log("💡 访问: https://sepoliafaucet.com/");
  }
  
  console.log("\n✅ 设置完成！");
  console.log("📝 私钥已显示，您可以将其添加到 .env 文件（可选）");
  console.log("\n下一步: 运行部署脚本");
  console.log("命令: npm run deploy:sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


