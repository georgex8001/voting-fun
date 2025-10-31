# 🚀 Zama FHEVM 快速参考手册

> 下次项目快速查阅用

---

## ⚡ 快速启动模板

### **1. Gateway 管理（复制即用）**

```javascript
// hooks/useGatewayManager.js
import { useState, useEffect } from 'react';
import { createInstance } from 'fhevmjs';

const GATEWAY_CONFIG = {
  chainId: 11155111,
  networkUrl: "https://eth-sepolia.public.blastapi.io",
  gatewayUrl: "https://gateway.sepolia.zama.ai",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
};

export function useGatewayManager() {
  const [status, setStatus] = useState('unknown');
  const [instance, setInstance] = useState(null);
  
  const checkHealth = async () => {
    try {
      const resp = await fetch(`${GATEWAY_CONFIG.gatewayUrl}/public_key`);
      if (!resp.ok) return false;
      const key = await resp.text();
      return key.startsWith("0x04") && key.length >= 66;
    } catch {
      return false;
    }
  };
  
  useEffect(() => {
    const init = async () => {
      const isUp = await checkHealth();
      if (isUp) {
        const inst = await createInstance(GATEWAY_CONFIG);
        setInstance(inst);
        setStatus('up');
      } else {
        setInstance(null);
        setStatus('down');
      }
    };
    
    init();
    
    // 定时轮询
    const timer = setInterval(async () => {
      const isUp = await checkHealth();
      setStatus(isUp ? 'up' : 'down');
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  return { status, instance };
}
```

---

### **2. 双合约架构（复制即用）**

```javascript
// hooks/useContract.js
import { ethers } from 'ethers';

const CONTRACTS = {
  fhe: "0xYOUR_FHE_CONTRACT",
  fallback: "0xYOUR_FALLBACK_CONTRACT"
};

export function useContract(gatewayStatus) {
  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // 根据 Gateway 状态选择合约
    const address = gatewayStatus === 'up' 
      ? CONTRACTS.fhe 
      : CONTRACTS.fallback;
    
    const abi = [
      "function createPoll(string, string[], uint256) returns (uint256)",
      "function vote(uint256, uint256)",
      "function getPollInfo(uint256) view returns (uint256, string, string[], address, uint256, bool)",
      "function getResults(uint256) view returns (uint256[])",
    ];
    
    return new ethers.Contract(address, abi, signer);
  };
  
  return { getContract };
}
```

---

### **3. 状态徽章组件（复制即用）**

```jsx
// components/GatewayStatus.jsx
import { Shield, ShieldAlert, Loader } from 'lucide-react';

export default function GatewayStatus({ status }) {
  const config = {
    up: {
      icon: Shield,
      text: 'FHE 在线',
      bg: 'bg-green-500',
    },
    down: {
      icon: ShieldAlert,
      text: 'Fallback 模式',
      bg: 'bg-orange-500',
    },
    unknown: {
      icon: Loader,
      text: '检测中...',
      bg: 'bg-yellow-500',
    }
  }[status];
  
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} text-white`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">{config.text}</span>
    </div>
  );
}
```

---

## 🔧 常用代码片段

### **获取投票信息**
```javascript
const poll = await contract.getPollInfo(pollId);
// poll: [id, title, options[], creator, endTime, isActive]
```

### **投票**
```javascript
// Fallback 模式
await contract.vote(pollId, optionIndex);

// FHE 模式
const encrypted = await fhevmInstance.encrypt(optionIndex);
await contract.vote(pollId, encrypted.data, encrypted.proof);
```

### **获取结果**
```javascript
const results = await contract.getResults(pollId);
// results: [count1, count2, ...]
```

---

## ⚠️ 常见错误快速修复

### **错误 1: Gateway unavailable**
```javascript
// 检查
const resp = await fetch('https://gateway.sepolia.zama.ai/public_key');
console.log(resp.status);

// 修复
// → 实现 Fallback 机制
```

### **错误 2: execution reverted**
```javascript
// 检查
console.log("合约地址:", contractAddress);
console.log("函数签名:", contract.interface.fragments);

// 修复
// → 确认合约地址正确
// → 确认 ABI 匹配
```

### **错误 3: t is not a function**
```bash
# 修复
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

### **错误 4: No matching export**
```javascript
// 检查文件是否导出
export function useContract() { /* ... */ }

// 不要
export { createPoll, vote }  // 组件无法直接使用
```

---

## 📋 部署检查清单

### **合约部署**
- [ ] 编译成功: `npx hardhat compile`
- [ ] 测试通过: `npx hardhat test`
- [ ] 部署到 Sepolia: `npx hardhat run scripts/deploy.js --network sepolia`
- [ ] 记录合约地址到 `deployment.json`
- [ ] 在 Etherscan 验证合约

### **前端配置**
- [ ] 更新合约地址
- [ ] 更新 ABI
- [ ] 测试 Gateway 在线
- [ ] 测试 Gateway 离线
- [ ] 测试所有功能

### **用户体验**
- [ ] 钱包连接流畅
- [ ] 状态提示清晰
- [ ] 错误处理完善
- [ ] 加载状态明确
- [ ] 交互响应及时

---

## 🎯 性能优化

```javascript
// ✅ 好：批量获取
const [poll, results, hasVoted] = await Promise.all([
  contract.getPollInfo(pollId),
  contract.getResults(pollId),
  contract.hasVoted(pollId, account)
]);

// ❌ 差：逐个获取
const poll = await contract.getPollInfo(pollId);
const results = await contract.getResults(pollId);
const hasVoted = await contract.hasVoted(pollId, account);
```

---

## 📞 快速帮助

### **官方资源**
- 文档: https://docs.zama.ai/
- 状态: https://status.zama.ai/
- Discord: https://discord.gg/zama

### **常用链接**
- Sepolia Faucet: https://sepoliafaucet.com/
- Sepolia Etherscan: https://sepolia.etherscan.io/
- MetaMask: https://metamask.io/

---

**保存此文件，下次项目快速查阅！** 🚀





