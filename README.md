# 🗳️ Voting-Fun - 保密投票系统
基于 Zama FHEVM 技术的完全保密链上投票 dApp

---

## ⚠️ 当前状态（2025-10-21）

**进度**: 99% 完成 ✅  
**状态**: ⏸️ 等待 Zama Sepolia Relayer 恢复  
**监控**: [https://status.zama.ai/](https://status.zama.ai/)

> **说明**: 所有代码和配置已完成，正在等待 Zama 基础设施恢复后进行最后测试。  
> **快速开始**: 查看 [`RESUME_NEXT_TIME.md`](RESUME_NEXT_TIME.md) 了解恢复步骤。  
> **完整进度**: 查看 [`STATUS.md`](STATUS.md) 了解详细状态。

---

## 📋 项目概述

Voting-Fun 是一个去中心化的保密投票系统，使用 Zama 的全同态加密（FHE）技术，确保投票过程完全保密。所有投票数据都在链上加密存储和计算，只有在投票结束后才会解密显示结果。

## ✨ 核心功能

- ✅ **创建投票**：任何人都可以创建投票，设置标题、选项和截止时间
- 🔐 **保密投票**：使用 FHEVM 加密技术，投票内容完全保密
- 📊 **查看结果**：投票结束后自动解密并显示结果
- 📜 **投票历史**：查看所有进行中和已结束的投票
- 🎨 **现代化UI**：美观易用的用户界面

## 🛠️ 技术栈

### 智能合约
- **Solidity** - 智能合约语言
- **FHEVM** - Zama 全同态加密虚拟机
- **Hardhat** - 开发和部署工具

### 前端
- **React** - 用户界面框架
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **ethers.js** - 区块链交互库
- **fhevmjs** - Zama Relayer SDK

### 部署
- **Sepolia Testnet** - 以太坊测试网
- **Netlify** - 前端托管平台
- **GitHub** - 代码托管

## 📁 项目结构

```
voting-fun/
├── contracts/              # 智能合约
│   └── SecretVoting.sol   # 保密投票合约
├── frontend/              # React前端应用
│   ├── src/
│   │   ├── components/   # React组件
│   │   ├── hooks/        # 自定义Hooks
│   │   ├── utils/        # 工具函数
│   │   └── App.jsx       # 主应用
│   ├── public/
│   └── package.json
├── scripts/               # 部署脚本
│   └── deploy.js
├── hardhat.config.js      # Hardhat配置
├── package.json           # 项目依赖
├── README.md             # 项目文档
├── update_debug_log.md   # 调试日志
└── self_check_log.md     # 自查日志
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- MetaMask 钱包
- Sepolia 测试网 ETH

### 安装依赖

```bash
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

# 部署到Sepolia测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 运行前端

```bash
cd frontend
npm run dev
```

## 🔑 环境变量配置

创建 `.env` 文件：

```env
# Sepolia 私钥（用于部署合约）
PRIVATE_KEY=your_private_key

# Infura API Key
INFURA_API_KEY=your_infura_key

# 合约地址（部署后填入）
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

## 🎯 如何使用

1. **连接钱包**：点击"Connect Wallet"连接MetaMask
2. **切换网络**：确保钱包连接到Sepolia测试网
3. **创建投票**：点击"Create Poll"创建新投票
4. **参与投票**：选择选项并提交（完全保密）
5. **查看结果**：投票结束后查看解密结果

## 🔐 隐私保护

- 投票内容在链上完全加密
- 使用 FHEVM 技术进行同态加密计算
- 只有在投票结束后才解密结果
- 无法追踪个人投票选择

## 📝 智能合约功能

### 核心函数

- `createPoll()` - 创建新投票
- `vote()` - 提交加密投票
- `endPoll()` - 结束投票并解密结果
- `getPollInfo()` - 获取投票信息
- `getResults()` - 获取投票结果

## 🏆 参赛信息

本项目参加 **Zama 开发者计划**：
- **Builder Track** - 月度最佳项目竞赛
- **Bounty Track** - "Hello FHEVM" 教程任务

## 📚 学习资源

- [Zama 官方文档](https://docs.zama.ai/)
- [FHEVM Solidity 指南](https://docs.zama.ai/fhevm)
- [Zama Developer Program](https://www.zama.ai/programs/developer-program)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

由 AI 助手协助技术小白完成 😊

---

**⚠️ 免责声明**：本项目仅用于学习和演示目的，未经审计，请勿在生产环境使用。


