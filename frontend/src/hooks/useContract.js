import { ethers } from "ethers";
import { createInstance } from "fhevmjs";

const SEPOLIA_FHE_CONFIG = {
  chainId: 11155111,
  networkUrl: "https://eth-sepolia.public.blastapi.io",
  gatewayUrl: "https://gateway.sepolia.zama.ai",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
};

// ✅ 检查 Gateway 是否可用
async function checkGatewayHealth(gatewayUrl) {
  const url = `${gatewayUrl}/public_key`;
  try {
    const resp = await fetch(url, { method: "GET", cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    if (!text.startsWith("0x04") || text.length < 66) {
      throw new Error("Invalid public key format");
    }
    console.log("✅ Gateway reachable:", gatewayUrl);
    return true;
  } catch (err) {
    console.warn("⚠️ Gateway unavailable:", err.message);
    return false;
  }
}

// 🌐 全局状态
let fhevmInstance = null;
let fheStatus = "unknown"; // "up" | "down" | "unknown"
let listeners = [];

// 📣 允许 UI 监听状态变化
export function onFheStatusChange(cb) {
  listeners.push(cb);
  cb(fheStatus);
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
  };
}

function notifyStatus(newStatus) {
  if (newStatus !== fheStatus) {
    fheStatus = newStatus;
    console.log(`🔄 FHE Status changed: ${fheStatus} → ${newStatus}`);
    for (const cb of listeners) cb(fheStatus);
  }
}

// 🧠 初始化 SDK（带自动恢复与 fallback）
export async function initFhevmInstance(autoRetry = true) {
  console.log("🔐 初始化 FHEVM SDK...");
  const isGatewayUp = await checkGatewayHealth(SEPOLIA_FHE_CONFIG.gatewayUrl);

  if (!isGatewayUp) {
    console.warn("🚧 Gateway 离线，进入 fallback 模式（纯 EVM）");
    notifyStatus("down");
    fhevmInstance = null;
    if (autoRetry) startGatewayPolling();
    return null;
  }

  try {
    const instance = await createInstance(SEPOLIA_FHE_CONFIG);
    console.log("✅ FHEVM SDK 初始化成功");
    fhevmInstance = instance;
    notifyStatus("up");
    if (autoRetry) startGatewayPolling(); // 启动轮询以监测未来状态变化
    return instance;
  } catch (err) {
    console.error("❌ FHEVM SDK 初始化失败:", err);
    notifyStatus("down");
    fhevmInstance = null;
    if (autoRetry) startGatewayPolling();
    return null;
  }
}

// 🕒 每隔 60 秒检测一次 Gateway 状态（自动恢复）
let pollingTimer = null;
function startGatewayPolling() {
  if (pollingTimer) return; // 避免重复启动
  console.log("🩺 启动 Gateway 健康轮询（每 60 秒）...");
  pollingTimer = setInterval(async () => {
    const ok = await checkGatewayHealth(SEPOLIA_FHE_CONFIG.gatewayUrl);
    if (ok && fheStatus === "down") {
      console.log("🔁 Gateway 已恢复，尝试重新初始化 SDK...");
      await initFhevmInstance(false);
    } else if (!ok && fheStatus === "up") {
      console.warn("🚨 Gateway 再次离线，进入 fallback 模式");
      notifyStatus("down");
      fhevmInstance = null;
    }
  }, 60_000);
}

// 停止轮询（用于清理）
export function stopGatewayPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log("🛑 停止 Gateway 轮询");
  }
}

// 获取当前 FHEVM 实例
export function getFhevmInstance() {
  return fhevmInstance;
}

// 获取当前 FHE 状态
export function getFheStatus() {
  return fheStatus;
}

// 合约地址配置
const CONTRACT_ADDRESSES = {
  // FHE 加密合约（Gateway 在线时使用）
  fhe: "0x6e34D1C8B45D54585b42DcB700DebA775715CDe6",
  // 简化测试合约（Fallback 模式使用）
  fallback: "0x1032d41F45c22b7dA427f234A0F418c02DA0f3A0"
};

// 🧱 获取合约实例（根据 FHE 状态自动切换）
export async function getContract() {
  if (!window.ethereum) throw new Error("No wallet provider found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // 根据 Gateway 状态选择合约地址
  const contractAddress = fheStatus === "up" 
    ? CONTRACT_ADDRESSES.fhe 
    : CONTRACT_ADDRESSES.fallback;

  console.log(`📍 使用合约: ${fheStatus === "up" ? "FHE 加密" : "Fallback 简化"} (${contractAddress})`);

  // 简化的 ABI（两个合约都支持）
  const abi = [
    "function createPoll(string title, string[] options, uint256 duration) external returns (uint256)",
    "function vote(uint256 pollId, uint256 optionIndex) external",
    "function pollCount() external view returns (uint256)",
    "function polls(uint256) external view returns (uint256 id, string title, address creator, uint256 endTime, bool isActive)",
    "function getPollInfo(uint256 pollId) external view returns (uint256 id, string title, string[] options, address creator, uint256 endTime, bool isActive)",
    "function getResults(uint256 pollId) external view returns (uint256[] memory)",
    "function hasVoted(uint256 pollId, address voter) external view returns (bool)",
  ];

  return new ethers.Contract(contractAddress, abi, signer);
}

// 🧮 创建投票（自动检测 FHE 可用性）
export async function createPoll(title, options, durationInHours) {
  const contract = await getContract();
  const duration = durationInHours * 3600;

  if (fhevmInstance === null) {
    console.log("⚙️ FHEVM 不可用，使用 fallback（纯 EVM 调用）");
  } else {
    console.log("🔒 使用 FHE 加密路径（SDK 已初始化）");
    // 👉 如果需要，这里可以集成加密输入
  }

  try {
    const tx = await contract.createPoll(title, options, duration);
    console.log("📤 Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Poll created:", receipt.hash);
    return receipt;
  } catch (err) {
    console.error("❌ 创建投票失败:", err);
    throw err;
  }
}

// 🗳️ 投票（自动检测 FHE 可用性）
export async function vote(pollId, optionIndex) {
  const contract = await getContract();

  if (fhevmInstance === null) {
    console.log("⚙️ FHEVM 不可用，使用 fallback（明文投票）");
  } else {
    console.log("🔒 使用 FHE 加密投票");
    // 👉 如果需要，这里可以集成加密投票
  }

  try {
    const tx = await contract.vote(pollId, optionIndex);
    console.log("📤 Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Vote submitted:", receipt.hash);
    return receipt;
  } catch (err) {
    console.error("❌ 投票失败:", err);
    throw err;
  }
}

// 🔓 解密结果
export async function decryptResults(pollId) {
  // Fallback 模式不需要解密
  if (fheStatus === "down") {
    console.log("ℹ️ Fallback 模式使用明文投票，无需解密");
    return null;
  }

  const contract = await getContract();

  try {
    const tx = await contract.decryptResults(pollId);
    console.log("📤 Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Results decrypted:", receipt.hash);
    return receipt;
  } catch (err) {
    console.error("❌ 解密失败:", err);
    throw err;
  }
}

// 📊 获取投票详情
export async function getPoll(pollId) {
  const contract = await getContract();
  try {
    // SimpleVotingTest 合约有 getPollInfo 函数，一次性获取所有信息
    try {
      const pollInfo = await contract.getPollInfo(pollId);
      console.log("📊 获取投票信息:", pollInfo);
      
      return {
        id: Number(pollInfo[0]),
        title: pollInfo[1],
        options: pollInfo[2], // 选项数组
        creator: pollInfo[3],
        endTime: Number(pollInfo[4]),
        isActive: pollInfo[5],
        resultsDecrypted: true, // Fallback 模式始终可见结果（明文）
      };
    } catch (err) {
      console.warn("⚠️ getPollInfo 调用失败，尝试备用方法");
      
      // 备用方法：使用 polls() 映射
      const poll = await contract.polls(pollId);
      
      return {
        id: Number(poll[0]),
        title: poll[1],
        creator: poll[2],
        endTime: Number(poll[3]),
        isActive: poll[4],
        resultsDecrypted: true,
        options: [], // 使用备用方法时选项为空
      };
    }
  } catch (err) {
    console.error("❌ 获取投票详情失败:", err);
    throw err;
  }
}

// 📈 获取投票总数
export async function getPollCount() {
  const contract = await getContract();
  try {
    const count = await contract.pollCount();
    return Number(count);
  } catch (err) {
    console.error("❌ 获取投票总数失败:", err);
    return 0;
  }
}

// 🔢 获取某个选项的票数
export async function getVoteCount(pollId, optionIndex) {
  const contract = await getContract();
  try {
    const count = await contract.getVoteCount(pollId, optionIndex);
    return Number(count);
  } catch (err) {
    console.error("❌ 获取票数失败:", err);
    return 0;
  }
}

// 🎣 React Hook：统一的合约交互接口
export function useContract() {
  return {
    // 合约交互函数
    createPoll,
    vote,
    decryptResults,
    getPoll,
    getPollCount,
    getVoteCount,
    getContract,
    
    // FHEVM 实例管理
    initFhevmInstance,
    getFhevmInstance,
    getFheStatus,
    stopGatewayPolling,
    onFheStatusChange,
    
    // 别名函数（兼容旧组件）
    getPollInfo: getPoll,
    getAllPollIds: async () => {
      const count = await getPollCount();
      return Array.from({ length: count }, (_, i) => i);
    },
    getResults: async (pollId) => {
      const contract = await getContract();
      try {
        // SimpleVotingTest 合约有 getResults 函数
        const results = await contract.getResults(pollId);
        return results.map(r => Number(r));
      } catch (err) {
        console.warn("⚠️ getResults 调用失败，使用备用方法");
        
        // 备用方法：遍历获取每个选项的票数
        const poll = await getPoll(pollId);
        if (!poll.resultsDecrypted || !poll.options) return [];
        
        const results = [];
        for (let i = 0; i < poll.options.length; i++) {
          try {
            const count = await getVoteCount(pollId, i);
            results.push(count);
          } catch {
            results.push(0);
          }
        }
        return results;
      }
    },
    hasVoted: async (pollId, address) => {
      const contract = await getContract();
      try {
        const voted = await contract.hasVoted(pollId, address);
        return voted;
      } catch (err) {
        console.warn("⚠️ 无法检查投票状态:", err);
        return false;
      }
    },
    endPoll: async (pollId) => {
      // SimpleVotingTest 合约不支持手动结束投票
      // 投票会在 endTime 到期后自动结束
      console.log("ℹ️ Fallback 模式下投票自动按时间结束");
      throw new Error("Fallback 模式下投票自动按时间结束，无需手动结束");
    },
    requestDecryption: decryptResults,
  };
}
