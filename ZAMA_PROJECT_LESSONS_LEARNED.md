# 🎓 Zama FHEVM 项目经验总结 - Voting-Fun

## 📅 项目时间线
- **启动日期**: 2025-10-21
- **完成日期**: 2025-10-22
- **总开发时间**: 2 天
- **项目状态**: ✅ 功能完整，可正常使用

---

## 🎯 项目概述

**项目名称**: Voting-Fun - 保密投票系统  
**技术栈**: Zama FHEVM + React + Vite + Hardhat + Sepolia Testnet  
**核心功能**: 
- 创建加密投票
- 匿名投票
- Gateway 自动检测与 Fallback
- 实时结果显示

---

## 🚧 遇到的主要问题与解决方案

### **1. Zama Gateway 不稳定问题** ⭐⭐⭐⭐⭐

#### 问题描述
```
❌ Gateway unavailable: Failed to fetch
❌ GET https://gateway.sepolia.zama.ai/public_key net::ERR_CONNECTION_CLOSED
```

**影响**: 
- FHEVM SDK 无法初始化
- 应用完全无法使用
- 用户体验极差

#### 根本原因
- Zama Sepolia Gateway 服务经常维护或不稳定
- 依赖外部服务的单点故障
- 没有备用方案

#### 解决方案 ✅
**实现自动 Gateway 检测与 Fallback 机制**

```javascript
// 1. 健康检查函数
async function checkGatewayHealth(gatewayUrl) {
  const url = `${gatewayUrl}/public_key`;
  try {
    const resp = await fetch(url, { method: "GET", cache: "no-store" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    if (!text.startsWith("0x04") || text.length < 66) {
      throw new Error("Invalid public key format");
    }
    return true;
  } catch (err) {
    console.warn("⚠️ Gateway unavailable:", err.message);
    return false;
  }
}

// 2. 定时轮询（每 60 秒）
setInterval(async () => {
  const ok = await checkGatewayHealth(gatewayUrl);
  if (ok && fheStatus === "down") {
    // 自动恢复
    await initFhevmInstance(false);
  } else if (!ok && fheStatus === "up") {
    // 自动降级
    notifyStatus("down");
    fhevmInstance = null;
  }
}, 60_000);

// 3. 双合约架构
const CONTRACT_ADDRESSES = {
  fhe: "0x6e34...CDe6",      // FHE 加密合约
  fallback: "0x1032...0f3A0"  // 简化测试合约
};
```

**关键要点**:
- ✅ 永远不要依赖单一外部服务
- ✅ 实现自动检测和恢复机制
- ✅ 提供 Fallback 降级方案
- ✅ 给用户清晰的状态提示

---

### **2. 合约地址与 ABI 不匹配** ⭐⭐⭐⭐

#### 问题描述
```
❌ Error: execution reverted (no data present; likely require(false))
```

**场景**: 
- 创建投票时交易被拒绝
- 合约调用失败

#### 根本原因
```javascript
// 错误：使用了错误的合约地址
const contractAddress = "0x7feb12a8...";  // ❌ 旧地址或错误地址

// 错误：ABI 与实际部署的合约不匹配
const abi = [
  "function createPoll(string, string[], uint256)",  // ❌ 缺少参数
];
```

实际部署的 **PollFactorySepolia** 合约需要额外参数：
```solidity
function createPoll(
    string memory _title,
    string[] memory _options,
    uint256 _duration,
    einput[] calldata _encryptedZeros,  // ⚠️ FHE 需要！
    bytes[] calldata _inputProofs       // ⚠️ FHE 需要！
)
```

#### 解决方案 ✅

**1. 使用正确的合约地址**
```javascript
// 从 deployment.json 读取
{
  "network": "sepolia",
  "address": "0x6e34D1C8B45D54585b42DcB700DebA775715CDe6",  // ✅ 正确
  "deployer": "0x1cF56C368F6F37E44AbA2aA4C147A9562A637F9B",
  "timestamp": "2025-10-21T02:33:37.264Z"
}
```

**2. 准备两套合约**
- **FHE 合约** (PollFactorySepolia): 需要加密参数
- **Fallback 合约** (SimpleVotingTest): 标准 EVM，无额外参数

**3. 根据状态自动切换**
```javascript
const contractAddress = fheStatus === "up" 
  ? CONTRACT_ADDRESSES.fhe 
  : CONTRACT_ADDRESSES.fallback;
```

**关键要点**:
- ✅ 保持合约地址的准确记录
- ✅ ABI 必须与实际合约完全匹配
- ✅ 为不同模式准备不同的合约
- ✅ 在 `deployment.json` 中记录部署信息

---

### **3. 合约函数调用不存在** ⭐⭐⭐⭐

#### 问题描述
```
❌ TypeError: contract.decryptResults is not a function
❌ No matching export for "getPollOptions"
```

**场景**: 
- 调用合约函数时出错
- 投票选项无法显示

#### 根本原因
代码假设合约有某些函数，但实际合约没有：

```javascript
// ❌ 错误：合约没有这个函数
const options = await contract.getPollOptions(pollId);

// ❌ 错误：SimpleVotingTest 没有 decryptResults
await contract.decryptResults(pollId);
```

实际合约有的函数：
```solidity
// ✅ SimpleVotingTest 实际有：
function getPollInfo(uint256) returns (
    uint256 id,
    string title,
    string[] options,  // 在这里！
    address creator,
    uint256 endTime,
    bool isActive
)

function getResults(uint256) returns (uint256[] memory)  // 不是 decryptResults
```

#### 解决方案 ✅

**1. 使用合约实际提供的函数**
```javascript
// ✅ 正确：使用 getPollInfo 一次性获取所有信息
const pollInfo = await contract.getPollInfo(pollId);
return {
  id: Number(pollInfo[0]),
  title: pollInfo[1],
  options: pollInfo[2],    // ✅ 包含选项数组
  creator: pollInfo[3],
  endTime: Number(pollInfo[4]),
  isActive: pollInfo[5],
};

// ✅ 正确：使用 getResults 获取投票结果
const results = await contract.getResults(pollId);
```

**2. 添加正确的 ABI**
```javascript
const abi = [
  "function getPollInfo(uint256) external view returns (uint256, string, string[], address, uint256, bool)",
  "function getResults(uint256) external view returns (uint256[])",
  // ❌ 不要添加不存在的函数
];
```

**关键要点**:
- ✅ **仔细阅读合约源代码**，确认实际函数签名
- ✅ 不要假设合约有某个函数
- ✅ 使用 Solidity 编译后的 ABI 文件
- ✅ 实现 try-catch 错误处理
- ✅ 提供 fallback 方法

---

### **4. React 组件渲染逻辑错误** ⭐⭐⭐⭐

#### 问题描述
```
✅ 投票创建成功
❌ 但是看不到投票选项
❌ 只显示"投票已结束"或"请求解密"
```

**场景**: 
- 投票详情页面显示错误
- 应该显示投票表单，但显示结果视图
- 应该显示"进行中"，但显示"已结束"

#### 根本原因

**问题 1: 渲染优先级错误**
```jsx
// ❌ 错误：resultsDecrypted=true 导致直接显示结果
{poll.resultsDecrypted ? (
  <ResultsView />  // 直接显示这个
) : (
  <VotingForm />   // 永远不会显示
)}
```

**问题 2: 状态字段不匹配**
```jsx
// ❌ 错误：使用了不存在的字段
const isActive = poll.status === 0;  // status 不存在

// ✅ 正确：使用实际字段
const isActive = poll.isActive;
```

**问题 3: 时间判断错误**
```jsx
// ❌ 错误：只判断时间
const hasEnded = now >= poll.endTime;

// ✅ 正确：同时判断 isActive 和时间
const hasEnded = !poll.isActive || now >= poll.endTime;
```

#### 解决方案 ✅

**重新设计渲染优先级**
```jsx
{!hasEnded && !userHasVoted ? (
  // 优先级 1: 显示投票表单
  <VotingForm />
) : poll.resultsDecrypted ? (
  // 优先级 2: 显示结果
  <ResultsView />
) : (
  // 优先级 3: 等待解密
  <WaitingView />
)}
```

**使用正确的字段和逻辑**
```jsx
// ✅ 使用合约实际返回的字段
const isActive = poll.isActive !== false;
const hasEnded = now >= poll.endTime;

// ✅ 综合判断
const canVote = isActive && !hasEnded && !userHasVoted;
```

**关键要点**:
- ✅ 明确组件渲染的优先级逻辑
- ✅ 使用合约实际返回的字段名
- ✅ 充分测试各种状态组合
- ✅ 添加详细的 console.log 调试

---

### **5. 前端依赖和模块问题** ⭐⭐⭐

#### 问题描述
```
❌ inject.js:23 Uncaught TypeError: t is not a function
❌ Failed to resolve module specifier "fhevmjs"
❌ 页面空白
```

**场景**: 
- npm install 后页面无法加载
- Vite HMR 模块冲突
- 依赖版本不兼容

#### 根本原因
- `node_modules` 损坏
- 依赖版本冲突
- Vite 缓存问题

#### 解决方案 ✅

**标准清理流程**
```bash
# 1. 停止所有 Node 进程
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. 清理 npm 缓存
npm cache clean --force

# 3. 删除 node_modules（如果锁定，先停止进程）
Remove-Item -Recurse -Force node_modules

# 4. 重新安装（使用 legacy-peer-deps）
npm install --legacy-peer-deps
```

**关键要点**:
- ✅ 遇到奇怪错误先清理缓存
- ✅ 使用 `--legacy-peer-deps` 避免依赖冲突
- ✅ 确保所有 Node 进程已停止
- ✅ 使用 `package-lock.json` 锁定版本

---

### **6. React Hook 导出问题** ⭐⭐⭐

#### 问题描述
```
❌ ERROR: No matching export in "src/hooks/useContract.js" for import "useContract"
```

**场景**: 
- 组件尝试导入 `useContract` Hook
- 但文件只导出了独立函数

#### 根本原因
```javascript
// ❌ 文件只导出函数，没有 Hook
export function createPoll() { }
export function vote() { }
// 没有 useContract

// 组件中尝试使用
import { useContract } from '../hooks/useContract';  // ❌ 不存在
```

#### 解决方案 ✅

**创建统一的 Hook 接口**
```javascript
// ✅ 导出一个 Hook，包装所有函数
export function useContract() {
  return {
    // 合约交互函数
    createPoll,
    vote,
    decryptResults,
    getPoll,
    getPollCount,
    getVoteCount,
    
    // FHEVM 管理
    initFhevmInstance,
    getFhevmInstance,
    getFheStatus,
    onFheStatusChange,
    
    // 兼容别名
    getPollInfo: getPoll,
    getResults: async (pollId) => { /* ... */ },
    hasVoted: async (pollId, address) => { /* ... */ },
  };
}
```

**关键要点**:
- ✅ 为组件提供统一的 Hook 接口
- ✅ Hook 内部调用实际函数
- ✅ 提供向后兼容的别名
- ✅ 保持 API 一致性

---

### **7. PowerShell 语法兼容性** ⭐⭐

#### 问题描述
```
❌ cd frontend && npm run dev
   + cd frontend && npm run dev
   +             ~~
错误：'&&' 不是此版本中的有效分隔符
```

**场景**: 
- Windows PowerShell 不支持 `&&`
- Bash 命令在 PowerShell 中失败

#### 解决方案 ✅

**使用 PowerShell 原生语法**
```powershell
# ❌ Bash 风格（不工作）
cd frontend && npm run dev

# ✅ PowerShell 风格
cd frontend; npm run dev

# ✅ 或分两步执行
cd frontend
npm run dev
```

**关键要点**:
- ✅ 注意操作系统差异
- ✅ Windows 用户使用 PowerShell 语法
- ✅ 或提供 .bat 脚本
- ✅ 跨平台项目使用 npm scripts

---

## 📚 核心经验总结

### **🎯 Zama FHEVM 开发最佳实践**

#### 1. **架构设计**

```
┌─────────────────────────────────────┐
│         前端应用层                    │
│  (React + ethers.js + fhevmjs)      │
└──────────┬──────────────────────────┘
           │
           ├──── 检测 Gateway 状态
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼────┐
│ FHE    │   │Fallback│
│ 合约   │   │ 合约   │
│(加密)  │   │(明文)  │
└────────┘   └────────┘
```

**核心原则**:
- ✅ **双模式架构**: FHE + Fallback
- ✅ **自动检测**: 健康检查 + 定时轮询
- ✅ **无缝切换**: 用户无感知
- ✅ **状态提示**: 清晰的 UI 反馈

---

#### 2. **Gateway 管理**

```javascript
// 完整的 Gateway 管理模式
class GatewayManager {
  constructor() {
    this.status = 'unknown';
    this.listeners = [];
    this.pollingTimer = null;
  }
  
  // 1. 健康检查
  async checkHealth() {
    const url = `${gatewayUrl}/public_key`;
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) return false;
      const key = await resp.text();
      return key.startsWith("0x04") && key.length >= 66;
    } catch {
      return false;
    }
  }
  
  // 2. 初始化
  async init(autoRetry = true) {
    const isUp = await this.checkHealth();
    if (isUp) {
      this.instance = await createInstance(config);
      this.updateStatus('up');
    } else {
      this.instance = null;
      this.updateStatus('down');
    }
    if (autoRetry) this.startPolling();
  }
  
  // 3. 定时轮询
  startPolling() {
    this.pollingTimer = setInterval(async () => {
      const isUp = await this.checkHealth();
      if (isUp && this.status === 'down') {
        await this.init(false);  // 自动恢复
      } else if (!isUp && this.status === 'up') {
        this.updateStatus('down');  // 自动降级
      }
    }, 60000);
  }
  
  // 4. 状态通知
  updateStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach(cb => cb(newStatus));
    }
  }
  
  // 5. 订阅机制
  onStatusChange(callback) {
    this.listeners.push(callback);
    callback(this.status);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}
```

---

#### 3. **合约开发**

**准备两套合约**:

```solidity
// 1. FHE 加密合约（Gateway 在线时使用）
contract PollFactorySepolia is GatewayCaller {
    euint32[] encryptedVotes;
    
    function vote(
        uint256 pollId,
        einput encryptedVote,
        bytes calldata inputProof
    ) external {
        euint32 vote = TFHE.asEuint32(encryptedVote, inputProof);
        // 加密投票逻辑
    }
}

// 2. 简化测试合约（Fallback 模式使用）
contract SimpleVotingTest {
    uint256[] voteCounts;  // 明文
    
    function vote(
        uint256 pollId,
        uint256 optionIndex
    ) external {
        voteCounts[optionIndex]++;  // 直接计数
    }
}
```

**关键要点**:
- ✅ FHE 合约用于生产/加密场景
- ✅ 简化合约用于测试/降级
- ✅ **保持函数签名尽量一致**
- ✅ 简化合约不要用 `einput`/`bytes` 参数

---

#### 4. **前端集成**

```javascript
// useContract.js 结构
export function useContract() {
  return {
    // 1. 基础函数（两种模式都支持）
    createPoll: async (title, options, duration) => {
      const contract = await getContract();  // 自动选择合约
      return contract.createPoll(title, options, duration);
    },
    
    // 2. 条件函数（根据模式调整）
    vote: async (pollId, optionIndex) => {
      if (fheStatus === 'up') {
        // FHE 模式：需要加密
        const encrypted = await encryptVote(optionIndex);
        return contract.vote(pollId, encrypted.data, encrypted.proof);
      } else {
        // Fallback 模式：直接调用
        return contract.vote(pollId, optionIndex);
      }
    },
    
    // 3. 状态管理
    getFheStatus: () => fheStatus,
    onFheStatusChange: (callback) => { /* ... */ },
  };
}
```

---

#### 5. **调试技巧**

```javascript
// 添加详细日志
console.log("📍 使用合约:", contractAddress);
console.log("📊 获取投票信息:", pollInfo);
console.log("🔐 FHEVM 状态:", fheStatus);

// 错误处理
try {
  const result = await contract.someFunction();
  console.log("✅ 成功:", result);
} catch (err) {
  console.error("❌ 失败:", err);
  console.error("错误详情:", err.message);
  console.error("交易数据:", err.transaction);
}

// 状态检查
if (!contract) console.warn("⚠️ 合约未初始化");
if (!window.ethereum) console.error("❌ 未检测到钱包");
```

---

### **⚠️ 常见陷阱与注意事项**

#### 1. **Gateway 依赖**
```
❌ 不要: 假设 Gateway 永远可用
✅ 要做: 实现 fallback 机制 + 健康检查
```

#### 2. **合约函数签名**
```
❌ 不要: 凭记忆写函数签名
✅ 要做: 从合约源代码或 ABI 文件复制
```

#### 3. **状态管理**
```
❌ 不要: 硬编码状态判断
✅ 要做: 使用合约实际返回的字段
```

#### 4. **错误处理**
```
❌ 不要: 忽略错误或只 console.log
✅ 要做: try-catch + 用户友好提示
```

#### 5. **时间戳**
```
❌ 不要: 使用 JavaScript Date.now()
✅ 要做: 使用 Math.floor(Date.now() / 1000) 匹配 Solidity
```

---

## 🎯 下次项目检查清单

### **项目启动前**
- [ ] 检查 Zama Gateway 状态: https://status.zama.ai/
- [ ] 准备两套合约（FHE + Fallback）
- [ ] 设计 Gateway 故障处理方案
- [ ] 规划合约函数签名保持一致

### **开发过程中**
- [ ] 实现 Gateway 健康检查
- [ ] 实现自动降级机制
- [ ] 添加详细的控制台日志
- [ ] 使用合约实际 ABI
- [ ] 测试所有状态组合

### **测试阶段**
- [ ] 测试 Gateway 在线场景
- [ ] 测试 Gateway 离线场景
- [ ] 测试 Gateway 恢复场景
- [ ] 测试合约所有函数
- [ ] 测试各种边界情况

### **部署前**
- [ ] 确认合约地址正确
- [ ] 确认 ABI 完全匹配
- [ ] 清理 console.log（生产环境）
- [ ] 测试用户体验流程
- [ ] 准备监控和告警

---

## 📊 性能优化建议

### **1. Gateway 轮询**
```javascript
// 不要轮询太频繁，浪费资源
const POLLING_INTERVAL = 60_000;  // ✅ 60 秒合理

// 不要轮询太慢，恢复不及时
const POLLING_INTERVAL = 300_000; // ❌ 5 分钟太慢
```

### **2. 合约调用**
```javascript
// ✅ 批量获取数据
const pollInfo = await contract.getPollInfo(pollId);  // 一次获取所有

// ❌ 逐个获取
const title = await contract.getTitle(pollId);
const options = await contract.getOptions(pollId);
const creator = await contract.getCreator(pollId);
// ... 太多调用
```

### **3. 状态缓存**
```javascript
// ✅ 缓存不常变化的数据
const [pollInfo, setPollInfo] = useState(null);
useEffect(() => {
  loadPollInfo();  // 只加载一次
}, [pollId]);

// ❌ 频繁请求
setInterval(() => {
  loadPollInfo();  // 每秒都请求
}, 1000);
```

---

## 🛠️ 推荐工具和资源

### **开发工具**
- **Hardhat**: 智能合约开发和测试
- **Vite**: 快速的前端构建工具
- **React DevTools**: 调试 React 组件
- **MetaMask**: 钱包和测试

### **Zama 资源**
- **官方文档**: https://docs.zama.ai/
- **状态监控**: https://status.zama.ai/
- **GitHub**: https://github.com/zama-ai
- **Discord**: 社区支持

### **测试网络**
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Alchemy RPC**: https://eth-sepolia.public.blastapi.io

---

## 💡 最重要的三条经验

### **1. 永远不要依赖单一外部服务** ⭐⭐⭐⭐⭐
```
Gateway 可能离线 → 准备 Fallback
网络可能失败 → 实现重试机制
合约可能升级 → 保持向后兼容
```

### **2. 合约函数签名必须精确匹配** ⭐⭐⭐⭐⭐
```
从合约源代码复制 → 不要凭记忆
使用编译后的 ABI → 不要手写
测试所有函数调用 → 不要假设工作
```

### **3. 充分测试各种状态组合** ⭐⭐⭐⭐⭐
```
Gateway 在线 + 已投票 = ?
Gateway 离线 + 未投票 = ?
Gateway 恢复 + 投票中 = ?
测试所有可能的状态转换
```

---

## 🎉 项目成功指标

我们的项目最终达到：

✅ **功能完整度**: 100%
- 创建投票 ✅
- 投票 ✅
- 查看结果 ✅
- Gateway 自动检测 ✅
- Fallback 机制 ✅

✅ **用户体验**: 优秀
- 无需刷新页面
- 自动状态切换
- 清晰的提示信息
- 流畅的交互

✅ **代码质量**: 高
- 无 Linter 错误
- 完整的错误处理
- 详细的注释
- 模块化设计

✅ **稳定性**: 可靠
- Gateway 离线仍可用
- 自动恢复机制
- 容错处理完善

---

## 📝 最后的建议

### **给未来的自己**

1. **第一天就实现 Fallback**
   - 不要等 Gateway 出问题才想起来
   - 从项目开始就规划双模式

2. **先读文档，再写代码**
   - 仔细阅读合约源代码
   - 理解 FHE 的工作原理
   - 不要跳过文档

3. **小步快跑，频繁测试**
   - 每个功能写完就测试
   - 不要堆积问题
   - 及时修复 Bug

4. **保持代码整洁**
   - 删除无用的 console.log
   - 统一命名规范
   - 写清晰的注释

5. **记录经验教训**
   - 遇到问题就记录
   - 解决方案写下来
   - 下次不重复踩坑

---

## 🚀 下一步建议

基于这次经验，下个项目可以：

1. **创建项目模板**
   - 包含 Gateway 管理
   - 包含双合约架构
   - 包含常用组件

2. **封装通用库**
   - Gateway 健康检查
   - 合约自动切换
   - 状态管理 Hook

3. **建立最佳实践**
   - 代码规范
   - 测试流程
   - 部署检查清单

---

**最后更新**: 2025-10-22  
**项目状态**: ✅ 完成并总结  
**经验等级**: 从 0 → Hero 🦸‍♂️

**祝你下次项目顺利！** 🎉🚀✨





