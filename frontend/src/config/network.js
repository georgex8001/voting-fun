/**
 * Network Configuration
 * 网络配置（符合手册标准）
 */

export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 11155111,
    chainIdHex: "0xaa36a7",
    name: "Sepolia Testnet",
    rpcUrls: [
      "https://eth-sepolia.public.blastapi.io",
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://rpc.ankr.com/eth_sepolia",
      "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
    ],
    gatewayUrl: "https://gateway.sepolia.zama.ai",
    explorerUrl: "https://sepolia.etherscan.io"
  },
  devnet: {
    chainId: 9000,
    chainIdHex: "0x2328",
    name: "Zama Devnet",
    rpcUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
    explorerUrl: "https://explorer.devnet.zama.ai"
  },
  localhost: {
    chainId: 31337,
    chainIdHex: "0x7a69",
    name: "Localhost",
    rpcUrl: "http://localhost:8545",
    gatewayUrl: "http://localhost:8545"
  }
};

// 当前使用的网络（从环境变量读取）
export const CURRENT_NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

// 获取当前网络配置
export function getNetworkConfig() {
  return NETWORK_CONFIG[CURRENT_NETWORK] || NETWORK_CONFIG.sepolia;
}

// 获取 RPC URL（使用第一个可用的）
export function getRpcUrl() {
  const config = getNetworkConfig();
  if (Array.isArray(config.rpcUrls)) {
    return config.rpcUrls[0];
  }
  return config.rpcUrl || import.meta.env.VITE_RPC_URL;
}

export default NETWORK_CONFIG;

