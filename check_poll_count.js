const { ethers } = require("hardhat");

async function main() {
  const fallbackAddress = "0x1032d41F45c22b7dA427f234A0F418c02DA0f3A0";
  
  const abi = [
    "function pollCount() view returns (uint256)"
  ];
  
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");
  const contract = new ethers.Contract(fallbackAddress, abi, provider);
  
  console.log("\n🔍 查询 Fallback 合约的真实 pollCount...\n");
  console.log("合约地址:", fallbackAddress);
  
  const count = await contract.pollCount();
  console.log("\n📊 链上真实 pollCount:", count.toString());
  console.log("\n这是区块链上的真实数据，两个浏览器都应该显示这个数字。\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



