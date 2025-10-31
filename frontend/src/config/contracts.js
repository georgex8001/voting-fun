/**
 * Contract Addresses Configuration
 * 合约地址配置（符合手册标准）
 */

// FHE 加密合约（Gateway 在线时使用）
export const CONTRACT_ADDRESSES = {
  // ✅ 生产级解密系统（2025-10-29）
  fhe: "0xC6bb1eb417b4C0AC5D7E411d6b801608b1064811",
  
  // Fallback 简化合约（Gateway 离线时自动切换）
  fallback: "0x1032d41F45c22b7dA427f234A0F418c02DA0f3A0"
};

// 合约 ABI（简化版，两个合约都支持）
export const CONTRACT_ABI = [
  // Fallback 版本（明文）
  "function createPoll(string title, string[] options, uint256 duration) external returns (uint256)",
  "function vote(uint256 pollId, uint256 optionIndex) external",
  // FHE 版本（加密参数）✅ 符合手册第3.5节
  "function createPoll(string title, string[] options, uint256 duration, bytes32[] encryptedZeros, bytes[] inputProofs) external returns (uint256)",
  "function vote(uint256 pollId, bytes32 encryptedOption, bytes inputProof) external",
  "function pollCount() external view returns (uint256)",
  "function polls(uint256) external view returns (uint256 id, string title, address creator, uint256 endTime, bool isActive)",
  "function getPollInfo(uint256 pollId) external view returns (uint256 id, string title, string[] options, address creator, uint256 endTime, bool isActive)",
  "function getResults(uint256 pollId) external view returns (uint256[] memory)",
  "function hasVoted(uint256 pollId, address voter) external view returns (bool)",
  // ✅ FHE 版本特有
  "function requestDecryption(uint256 pollId) external returns (uint256 requestId)",
  "function retryDecryption(uint256 pollId) external returns (uint256 newRequestId)",
  "function cancelExpiredPoll(uint256 pollId) external",
  // 事件
  "event PollCreated(uint256 indexed pollId, string title, address indexed creator, uint256 endTime)",
  "event VoteSubmitted(uint256 indexed pollId, address indexed voter)",
  "event DecryptionRequested(uint256 indexed requestId, uint256 indexed pollId, uint256 timestamp)",
  "event DecryptionRetrying(uint256 indexed requestId, uint256 indexed pollId, uint8 retryCount)",
  "event PollDecrypted(uint256 indexed pollId, uint32[] results)",
  "event PollExpired(uint256 indexed pollId, uint256 timestamp)"
];

export default CONTRACT_ADDRESSES;

