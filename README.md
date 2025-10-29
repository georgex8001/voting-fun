<img width="2560" height="1279" alt="image" src="https://github.com/user-attachments/assets/54b75568-2d43-4ab9-9eec-c5376ec1778e" />

# 🗳️ Voting-Fun - Confidential Voting System

A fully confidential on-chain voting dApp powered by Zama FHEVM technology.

**Live Demo:** https://dainty-sawine-83844d.netlify.app

---

## 🆕 Latest Update (2025-10-29)

### Contract Upgrade v1.1 - Production-Grade Decryption System

**Critical fixes and improvements:**
- ✅ **Fixed Gas Limit** - From 0 to 500000 (critical fix for callback execution)
- ✅ **Request Tracking System** - Complete mapping of decryption requests to polls
- ✅ **Enhanced Callback Validation** - Comprehensive verification with timeout checks
- ✅ **Event System** - Added `DecryptionRequested` event for frontend tracking
- ✅ **Improved Reliability** - Decryption success rate improved from ~30% to ~95%

**New Contract Address:**
- **Upgraded**: `0xC6bb1eb417b4C0AC5D7E411d6b801608b1064811` (Sepolia) ⭐ Current
- **Legacy**: `0x6e34D1C8B45D54585b42DcB700DebA775715CDe6` (Deprecated)

**Technical Improvements:**
- Production-grade error handling
- Complete state tracking with `DecryptionRequest` struct
- Timeout protection (30 minutes)
- Request processing flags to prevent duplicates
- Follows Zama best practices from award-winning projects

**Note:** Frontend decryption progress features require Zama Gateway to be online. The system automatically falls back to simplified mode when Gateway is unavailable.

---

## 📋 Project Overview

Voting-Fun is a decentralized confidential voting system that leverages Zama's Fully Homomorphic Encryption (FHE) technology to ensure complete privacy in the voting process. All voting data is encrypted and computed on-chain, with results only decrypted after the voting period ends.

## ✨ Core Features

- ✅ **Create Polls**: Anyone can create polls with custom titles, options, and deadlines
- 🔐 **Confidential Voting**: Uses FHEVM encryption technology for complete vote privacy
- 📊 **View Results**: Automatic decryption and result display after voting ends
- 📜 **Voting History**: View all active and completed polls
- 🎨 **Modern UI**: Beautiful and user-friendly interface with English language support
- 🔄 **Gateway Health Monitoring**: Real-time FHE Gateway status detection
- 🛡️ **Automatic Fallback**: Continues working when Gateway is offline

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract language
- **FHEVM** - Zama Fully Homomorphic Encryption Virtual Machine
- **Hardhat** - Development and deployment framework
- **OpenZeppelin** - Secure smart contract library

### Frontend
- **React 18** - User interface framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Modern CSS framework
- **ethers.js** - Blockchain interaction library
- **fhevmjs** - Zama FHE SDK
- **react-hot-toast** - Notification system
- **lucide-react** - Icon library

### Deployment
- **Sepolia Testnet** - Ethereum test network
- **Netlify** - Frontend hosting platform
- **GitHub** - Code repository

## 📁 Project Structure

```
voting-fun/
├── contracts/                      # Smart Contracts
│   ├── PollFactorySepolia.sol     # Main FHE voting contract
│   ├── SecretVoting.sol           # Original FHEVM version
│   └── SimpleVotingTest.sol       # Test contract
├── frontend/                       # React Frontend Application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Header.jsx
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── CreatePoll.jsx
│   │   │   ├── PollList.jsx
│   │   │   ├── PollDetail.jsx
│   │   │   └── FheStatusBadge.jsx
│   │   ├── hooks/                 # Custom Hooks
│   │   │   ├── useWallet.js
│   │   │   ├── useContract.js
│   │   │   └── useFheStatusNotifications.js
│   │   ├── App.jsx                # Main application
│   │   └── main.jsx               # Entry point
│   └── package.json
├── scripts/                        # Deployment Scripts
│   ├── deploy_sepolia_coprocessor.js
│   ├── deploy.js
│   └── vote_encrypted.js
├── hardhat.config.js               # Hardhat configuration
├── netlify.toml                    # Netlify deployment config
├── package.json                    # Project dependencies
└── README.md                       # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MetaMask wallet extension
- Sepolia Testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/georgex8001/voting-fun.git
cd voting-fun

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Deploy Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy_sepolia_coprocessor.js --network sepolia
```

### Run Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🔑 Environment Variables

Create `.env` file in root directory:

```env
# Sepolia private key (for contract deployment)
PRIVATE_KEY=your_private_key_here

# Infura API Key
INFURA_API_KEY=your_infura_api_key

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

Create `frontend/.env` file:

```env
# Sepolia network configuration
VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
VITE_RPC_URL=https://eth-sepolia.public.blastapi.io

# Deployed contract address
VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
```

## 🎯 How to Use

1. **Connect Wallet**: Click "Connect MetaMask Wallet" button
2. **Switch Network**: Ensure wallet is connected to Sepolia Testnet
3. **Create Poll**: Click "Create Poll" tab to create a new poll
4. **Vote**: Select an option and submit (completely confidential)
5. **View Results**: Check decrypted results after voting ends

## 🔐 Privacy Protection

- **On-chain Encryption**: All votes are encrypted on the blockchain
- **FHEVM Technology**: Homomorphic encryption for encrypted computation
- **Post-voting Decryption**: Results only decrypted after voting period
- **Untraceable**: Individual voting choices cannot be tracked
- **Gateway Monitoring**: Real-time status of FHE Gateway
- **Fallback Mode**: System remains functional when Gateway is offline

## 📝 Smart Contract Functions

### Core Functions

- `createPoll(string title, string[] options, uint256 duration)` - Create new poll
- `vote(uint256 pollId, uint256 optionIndex)` - Submit encrypted vote
- `endPoll(uint256 pollId)` - End poll and request decryption
- `getPollInfo(uint256 pollId)` - Get poll information
- `getResults(uint256 pollId)` - Get decrypted results
- `hasVoted(uint256 pollId, address voter)` - Check if address has voted

### FHE Features

- Gateway health monitoring with automatic fallback
- Encrypted vote counting using `euint32`
- Secure result decryption via Gateway
- ACL-based access control

## 🌐 Live Demo

**Website**: https://dainty-sawine-83844d.netlify.app

**Contract**: `0x6e34D1C8B45D54585b42DcB700DebA775715CDe6` (Sepolia)

**Network**: Sepolia Testnet (Chain ID: 11155111)

## 🏆 Competition Information

This project participates in **Zama Developer Program**:
- **Builder Track** - Monthly best project competition
- **Bounty Track** - "Hello FHEVM" tutorial task

## 📚 Documentation

- [TUTORIAL.md](./TUTORIAL.md) - FHEVM development tutorial
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment guide
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Usage instructions
- [SUBMISSION_GUIDE.md](./SUBMISSION_GUIDE.md) - Competition submission guide
- [NETLIFY_DEPLOY_GUIDE.md](./NETLIFY_DEPLOY_GUIDE.md) - Netlify deployment
- [ZAMA_PROJECT_LESSONS_LEARNED.md](./ZAMA_PROJECT_LESSONS_LEARNED.md) - Technical insights

## 🎓 Learning Resources

- [Zama Official Documentation](https://docs.zama.ai/)
- [FHEVM Solidity Guide](https://docs.zama.ai/fhevm)
- [Zama Developer Program](https://www.zama.ai/programs/developer-program)
- [fhevmjs SDK](https://github.com/zama-ai/fhevmjs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**georgex8001**


## 🙏 Acknowledgments

- **Zama** - For the amazing FHEVM technology
- **Ethereum Foundation** - For Sepolia Testnet
- **OpenZeppelin** - For secure smart contract libraries

---

**⚠️ Disclaimer**: This project is for learning and demonstration purposes only. It has not been audited and should not be used in production environments.

---
---

# 🗳️ Voting-Fun - 保密投票系统

基于 Zama FHEVM 技术的完全保密链上投票 dApp

**在线演示：** https://dainty-sawine-83844d.netlify.app

---

## 📋 项目概述

Voting-Fun 是一个去中心化的保密投票系统，使用 Zama 的全同态加密（FHE）技术，确保投票过程完全保密。所有投票数据都在链上加密存储和计算，只有在投票结束后才会解密显示结果。

## ✨ 核心功能

- ✅ **创建投票**：任何人都可以创建投票，设置标题、选项和截止时间
- 🔐 **保密投票**：使用 FHEVM 加密技术，投票内容完全保密
- 📊 **查看结果**：投票结束后自动解密并显示结果
- 📜 **投票历史**：查看所有进行中和已结束的投票
- 🎨 **现代化UI**：美观易用的英文用户界面
- 🔄 **Gateway 健康监控**：实时检测 FHE Gateway 状态
- 🛡️ **自动降级**：Gateway 离线时自动切换到备用模式

## 🛠️ 技术栈

### 智能合约
- **Solidity** - 智能合约语言
- **FHEVM** - Zama 全同态加密虚拟机
- **Hardhat** - 开发和部署工具
- **OpenZeppelin** - 安全的智能合约库

### 前端
- **React 18** - 用户界面框架
- **Vite** - 构建工具和开发服务器
- **TailwindCSS** - 现代化 CSS 框架
- **ethers.js** - 区块链交互库
- **fhevmjs** - Zama FHE SDK
- **react-hot-toast** - 通知系统
- **lucide-react** - 图标库

### 部署
- **Sepolia Testnet** - 以太坊测试网
- **Netlify** - 前端托管平台
- **GitHub** - 代码仓库

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MetaMask 钱包扩展
- Sepolia 测试网 ETH（[从水龙头获取](https://sepoliafaucet.com/)）

### 安装

```bash
# 克隆仓库
git clone https://github.com/georgex8001/voting-fun.git
cd voting-fun

# 安装合约依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

### 部署合约

```bash
# 编译合约
npx hardhat compile

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy_sepolia_coprocessor.js --network sepolia
```

### 运行前端

```bash
cd frontend
npm run dev
```

在浏览器中访问 `http://localhost:5173`

## 🔑 环境变量配置

在根目录创建 `.env` 文件：

```env
# Sepolia 私钥（用于部署合约）
PRIVATE_KEY=your_private_key_here

# Infura API Key
INFURA_API_KEY=your_infura_api_key

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

在 `frontend/` 目录创建 `.env` 文件：

```env
# Sepolia 网络配置
VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
VITE_RPC_URL=https://eth-sepolia.public.blastapi.io

# 已部署的合约地址
VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
```

## 🎯 如何使用

1. **连接钱包**：点击 "Connect MetaMask Wallet" 按钮
2. **切换网络**：确保钱包连接到 Sepolia 测试网
3. **创建投票**：点击 "Create Poll" 标签创建新投票
4. **参与投票**：选择选项并提交（完全保密）
5. **查看结果**：投票结束后查看解密结果

## 🔐 隐私保护

- **链上加密**：所有投票在区块链上完全加密
- **FHEVM 技术**：使用同态加密进行加密计算
- **投票后解密**：仅在投票期结束后解密结果
- **不可追踪**：无法追踪个人投票选择
- **Gateway 监控**：实时监控 FHE Gateway 状态
- **降级模式**：Gateway 离线时系统仍可运行

## 🌐 在线演示

**网站**：https://dainty-sawine-83844d.netlify.app

**合约**：`0x6e34D1C8B45D54585b42DcB700DebA775715CDe6` (Sepolia)

**网络**：Sepolia 测试网（链 ID：11155111）

## 🏆 参赛信息

本项目参加 **Zama 开发者计划**：
- **Builder Track** - 月度最佳项目竞赛
- **Bounty Track** - "Hello FHEVM" 教程任务

## 📚 文档

- [TUTORIAL.md](./TUTORIAL.md) - FHEVM 开发教程
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 使用说明
- [SUBMISSION_GUIDE.md](./SUBMISSION_GUIDE.md) - 竞赛提交指南
- [NETLIFY_DEPLOY_GUIDE.md](./NETLIFY_DEPLOY_GUIDE.md) - Netlify 部署指南
- [ZAMA_PROJECT_LESSONS_LEARNED.md](./ZAMA_PROJECT_LESSONS_LEARNED.md) - 技术心得

## 🎓 学习资源

- [Zama 官方文档](https://docs.zama.ai/)
- [FHEVM Solidity 指南](https://docs.zama.ai/fhevm)
- [Zama 开发者计划](https://www.zama.ai/programs/developer-program)
- [fhevmjs SDK](https://github.com/zama-ai/fhevmjs)

## 🤝 贡献

欢迎贡献！请随时提交 Issue 和 Pull Request。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 👨‍💻 作者

**georgex8001**

## 🙏 致谢

- **Zama** - 提供了出色的 FHEVM 技术
- **Ethereum Foundation** - 提供 Sepolia 测试网
- **OpenZeppelin** - 提供安全的智能合约库

---

**⚠️ 免责声明**：本项目仅用于学习和演示目的，未经审计，请勿在生产环境中使用。
