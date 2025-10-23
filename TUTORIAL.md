# 📚 Hello FHEVM 教程：构建保密投票系统

完整的 FHEVM 开发教程，从零开始构建一个保密投票 dApp

---

## 🎯 教程目标

通过本教程，你将学会：
- ✅ 理解全同态加密（FHE）的基本原理
- ✅ 使用 Zama FHEVM 编写保密智能合约
- ✅ 集成 fhevmjs SDK 到前端应用
- ✅ 部署和测试 FHE 应用

**适合人群**: 有基础 Solidity 和 JavaScript 知识的开发者

**预计时间**: 2-3 小时

---

## 📖 第一章：FHE 基础知识

### 1.1 什么是全同态加密（FHE）？

全同态加密（Fully Homomorphic Encryption）是一种特殊的加密技术，允许在加密数据上直接进行计算，而无需解密。

**传统加密**:
```
数据 → 加密 → 存储 → 解密 → 计算 → 加密 → 存储
         ❌ 计算前必须解密，暴露原始数据
```

**FHE 加密**:
```
数据 → 加密 → 存储 → 直接在加密数据上计算 → 存储
         ✅ 全程加密，永不暴露原始数据
```

### 1.2 FHEVM 简介

Zama 的 FHEVM 是一个支持 FHE 的以太坊虚拟机，让智能合约可以处理加密数据。

**核心特性**:
- 🔐 链上数据完全加密
- 🔢 支持加密算术运算（+, -, *, /, 比较等）
- 🔑 只有授权用户可以解密结果
- 🎯 兼容 Solidity 语法

### 1.3 FHEVM 加密类型

FHEVM 提供了多种加密数据类型：

| 类型 | 说明 | 范围 |
|------|------|------|
| `ebool` | 加密布尔值 | true/false |
| `euint8` | 加密 8 位整数 | 0-255 |
| `euint16` | 加密 16 位整数 | 0-65535 |
| `euint32` | 加密 32 位整数 | 0-4294967295 |
| `euint64` | 加密 64 位整数 | 0-2^64-1 |

本教程主要使用 `euint32` 和 `ebool`。

---

## 🛠️ 第二章：环境搭建

### 2.1 安装 Node.js 和 npm

```bash
# 检查 Node.js 版本（需要 >= 18.0.0）
node --version

# 检查 npm 版本
npm --version
```

### 2.2 创建项目

```bash
# 创建项目目录
mkdir my-fhe-voting
cd my-fhe-voting

# 初始化 npm 项目
npm init -y
```

### 2.3 安装 Hardhat

```bash
# 安装 Hardhat 和相关工具
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 初始化 Hardhat 项目
npx hardhat init
# 选择 "Create a JavaScript project"
```

### 2.4 安装 FHEVM 依赖

```bash
# 安装 FHEVM 库
npm install fhevm@^0.5.0

# 安装其他依赖
npm install dotenv
```

### 2.5 配置 Hardhat

编辑 `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun"
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

---

## 💡 第三章：编写智能合约

### 3.1 合约结构

创建 `contracts/SimpleVoting.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

contract SimpleVoting {
    // 我们将在这里编写代码
}
```

### 3.2 定义数据结构

```solidity
// 投票结构体
struct Poll {
    string title;              // 投票标题
    string[] options;          // 选项列表
    euint32[] encryptedVotes;  // 🔐 加密的投票计数
    uint256 endTime;           // 结束时间
    bool isActive;             // 是否激活
}

// 状态变量
mapping(uint256 => Poll) public polls;
uint256 public pollCount;
```

**关键点**: 
- `euint32[]` 存储加密的投票数
- 每个选项对应一个 `euint32` 计数器

### 3.3 创建投票

```solidity
function createPoll(
    string memory _title,
    string[] memory _options,
    uint256 _duration
) external returns (uint256) {
    pollCount++;
    uint256 pollId = pollCount;
    
    Poll storage newPoll = polls[pollId];
    newPoll.title = _title;
    newPoll.options = _options;
    newPoll.endTime = block.timestamp + _duration;
    newPoll.isActive = true;
    
    // 🔐 初始化加密投票计数为 0
    for (uint256 i = 0; i < _options.length; i++) {
        newPoll.encryptedVotes.push(TFHE.asEuint32(0));
    }
    
    return pollId;
}
```

**关键点**:
- `TFHE.asEuint32(0)` 创建加密的零值
- 每个选项初始化一个加密计数器

### 3.4 投票功能（核心）

```solidity
function vote(
    uint256 _pollId,
    einput _encryptedOptionIndex,
    bytes calldata inputProof
) external {
    Poll storage poll = polls[_pollId];
    require(poll.isActive, "Poll not active");
    
    // 🔐 转换加密输入
    euint32 optionIndex = TFHE.asEuint32(_encryptedOptionIndex, inputProof);
    
    // 🔐 加密投票逻辑
    for (uint256 i = 0; i < poll.options.length; i++) {
        // 检查是否选择了这个选项（加密比较）
        ebool isMatch = TFHE.eq(optionIndex, TFHE.asEuint32(uint32(i)));
        
        // 如果匹配，增加计数（加密选择）
        euint32 increment = TFHE.select(isMatch, TFHE.asEuint32(1), TFHE.asEuint32(0));
        
        // 加密加法
        poll.encryptedVotes[i] = TFHE.add(poll.encryptedVotes[i], increment);
    }
}
```

**详细解析**:

1. **`TFHE.asEuint32(_encryptedOptionIndex, inputProof)`**
   - 将用户提交的加密输入转换为 `euint32` 类型
   - `inputProof` 是零知识证明，确保输入有效

2. **`TFHE.eq(optionIndex, TFHE.asEuint32(uint32(i)))`**
   - 加密比较：检查用户选择的索引是否等于当前索引
   - 返回 `ebool` 类型（加密的布尔值）

3. **`TFHE.select(isMatch, TFHE.asEuint32(1), TFHE.asEuint32(0))`**
   - 加密选择：如果 `isMatch` 为真，返回 1，否则返回 0
   - 等价于加密的三元运算符

4. **`TFHE.add(poll.encryptedVotes[i], increment)`**
   - 加密加法：将增量加到计数器上
   - 全程不解密

**为什么这样设计？**
- 用户的投票选择始终保持加密状态
- 合约无法知道用户投给了哪个选项
- 只能知道最终的总计数（解密后）

### 3.5 查询功能

```solidity
function getPollInfo(uint256 _pollId) 
    external view returns (
        string memory title,
        string[] memory options,
        uint256 endTime,
        bool isActive
    ) 
{
    Poll storage poll = polls[_pollId];
    return (
        poll.title,
        poll.options,
        poll.endTime,
        poll.isActive
    );
}
```

---

## 🎨 第四章：前端集成

### 4.1 安装前端依赖

```bash
# 创建前端目录
mkdir frontend
cd frontend

# 使用 Vite 创建 React 项目
npm create vite@latest . -- --template react
npm install

# 安装区块链相关依赖
npm install ethers fhevmjs
```

### 4.2 初始化 FHEVM 客户端

创建 `frontend/src/fhevm.js`:

```javascript
import { createInstance } from 'fhevmjs'

let fhevmInstance = null

export async function initFHEVM() {
  if (fhevmInstance) return fhevmInstance
  
  fhevmInstance = await createInstance({
    chainId: 11155111, // Sepolia
    networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    gatewayUrl: 'https://gateway.zama.ai'
  })
  
  return fhevmInstance
}
```

### 4.3 加密投票选项

```javascript
import { ethers } from 'ethers'
import { initFHEVM } from './fhevm'

async function castVote(contractAddress, pollId, optionIndex) {
  // 初始化 FHEVM
  const fhevm = await initFHEVM()
  
  // 连接合约
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(contractAddress, ABI, signer)
  
  // 🔐 创建加密输入
  const encryptedInput = fhevm.createEncryptedInput(
    contractAddress,
    await signer.getAddress()
  )
  
  // 🔐 添加要加密的数据
  encryptedInput.add32(optionIndex)  // 加密投票选项索引
  
  // 🔐 生成加密输入和证明
  const { handles, inputProof } = encryptedInput.encrypt()
  
  // 🔐 提交加密投票
  const tx = await contract.vote(pollId, handles[0], inputProof)
  await tx.wait()
  
  console.log('投票成功！')
}
```

**关键步骤**:
1. 创建 `encryptedInput` 对象
2. 使用 `add32()` 添加要加密的数据
3. 调用 `encrypt()` 生成加密输入和证明
4. 将 `handles[0]` 和 `inputProof` 提交给合约

### 4.4 完整的投票组件

```javascript
import { useState } from 'react'
import { castVote } from './fhevm'

function VotingComponent({ pollId, options }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleVote = async () => {
    if (selectedOption === null) return
    
    try {
      setLoading(true)
      await castVote(CONTRACT_ADDRESS, pollId, selectedOption)
      alert('投票成功！')
    } catch (error) {
      console.error(error)
      alert('投票失败')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <h2>请选择您的选项</h2>
      {options.map((option, index) => (
        <label key={index}>
          <input
            type="radio"
            name="option"
            value={index}
            onChange={() => setSelectedOption(index)}
          />
          {option}
        </label>
      ))}
      <button onClick={handleVote} disabled={loading}>
        {loading ? '提交中...' : '提交投票'}
      </button>
    </div>
  )
}
```

---

## 🚀 第五章：部署和测试

### 5.1 编译合约

```bash
npx hardhat compile
```

### 5.2 编写部署脚本

创建 `scripts/deploy.js`:

```javascript
async function main() {
  const SimpleVoting = await ethers.getContractFactory("SimpleVoting")
  const voting = await SimpleVoting.deploy()
  await voting.waitForDeployment()
  
  console.log("合约地址:", await voting.getAddress())
}

main()
```

### 5.3 部署到 Sepolia

```bash
# 配置环境变量
echo "PRIVATE_KEY=your_private_key" > .env
echo "INFURA_API_KEY=your_infura_key" >> .env

# 部署
npx hardhat run scripts/deploy.js --network sepolia
```

### 5.4 测试流程

1. **创建投票**
```javascript
const tx = await contract.createPoll(
  "你最喜欢的语言？",
  ["JavaScript", "Python", "Rust"],
  86400  // 24小时
)
```

2. **投票**（前端调用 `castVote` 函数）

3. **查看结果**（投票结束后解密）

---

## 🎓 第六章：进阶主题

### 6.1 Gateway 解密机制

FHEVM 使用 Gateway 进行异步解密：

```solidity
import "fhevm/gateway/GatewayCaller.sol";

contract AdvancedVoting is GatewayCaller {
    function requestDecryption(uint256 pollId) external {
        Poll storage poll = polls[pollId];
        
        // 将加密数据转换为可解密格式
        uint256[] memory cts = new uint256[](poll.options.length);
        for (uint256 i = 0; i < poll.options.length; i++) {
            cts[i] = Gateway.toUint256(poll.encryptedVotes[i]);
        }
        
        // 请求解密
        Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );
    }
    
    // Gateway 回调函数
    function callbackDecryption(
        uint256 requestId,
        uint256[] memory decryptedResults
    ) public onlyGateway {
        // 处理解密结果
    }
}
```

### 6.2 访问控制

使用 FHEVM 的访问控制功能：

```solidity
import "fhevm/lib/TFHE.sol";

// 允许用户查看自己的加密投票
function allowUserAccess(uint256 pollId, address user) external {
    Poll storage poll = polls[pollId];
    for (uint256 i = 0; i < poll.encryptedVotes.length; i++) {
        TFHE.allow(poll.encryptedVotes[i], user);
    }
}
```

### 6.3 性能优化

**Gas 优化技巧**:
1. 使用合适的加密类型（`euint8` vs `euint32`）
2. 批量操作减少交易次数
3. 缓存加密值避免重复计算

---

## 🐛 第七章：常见问题

### Q1: 为什么投票要用循环？

**A**: 因为我们不能直接访问加密索引的值。循环检查每个选项是否匹配，是在加密状态下的唯一方法。

### Q2: 加密运算的 Gas 费用高吗？

**A**: 是的，FHE 运算比普通运算贵很多。但这是隐私保护的代价。

### Q3: 如何调试加密合约？

**A**: 
- 使用事件记录关键步骤
- 在本地测试网测试
- 使用 Hardhat 的 console.log（但无法打印加密值）

### Q4: 可以支持更复杂的计算吗？

**A**: 可以！FHEVM 支持：
- 加法、减法、乘法、除法
- 比较运算（>, <, ==）
- 位运算
- 条件选择

---

## 📚 第八章：学习资源

### 官方文档
- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [TFHE-rs 文档](https://docs.zama.ai/tfhe-rs)
- [fhevmjs 文档](https://docs.zama.ai/fhevmjs)

### 示例项目
- [保密ERC20](https://github.com/zama-ai/fhevm/examples/ConfidentialERC20)
- [保密NFT拍卖](https://github.com/zama-ai/fhevm/examples/BlindAuction)
- [保密AMM](https://github.com/zama-ai/fhevm/examples/ConfidentialAMM)

### 社区
- [Discord](https://discord.gg/zama)
- [Telegram](https://t.me/zama_fhe)
- [论坛](https://community.zama.ai/)

---

## 🎉 总结

恭喜你完成了 Hello FHEVM 教程！

你现在已经学会了：
- ✅ FHE 的基本原理
- ✅ 使用 FHEVM 编写智能合约
- ✅ 集成 fhevmjs 到前端
- ✅ 部署和测试 FHE 应用

### 下一步

1. **扩展功能**: 添加投票权重、多选投票等
2. **优化体验**: 改进 UI/UX
3. **参加比赛**: 提交到 Zama Developer Program
4. **分享经验**: 在社区分享你的项目

**继续探索 FHE 的无限可能！** 🚀

---

## 📞 获取帮助

遇到问题？联系我们：
- 在 GitHub 提 Issue
- 加入 Discord 频道
- 查看官方文档

**祝你开发愉快！** 💻


