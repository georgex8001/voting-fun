require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "cancun"
        }
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.MNEMONIC 
        ? { mnemonic: process.env.MNEMONIC }
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      chainId: 11155111,
      timeout: 60000  // 增加超时到 60 秒
    },
    // Zama Devnet（推荐：Sepolia Relayer 停机时使用）
    devnet: {
      url: "https://devnet.zama.ai",
      accounts: process.env.MNEMONIC 
        ? { mnemonic: process.env.MNEMONIC }
        : (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      chainId: 9000,
      timeout: 60000
    },
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

