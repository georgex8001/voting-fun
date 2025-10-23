# ⚡ 快速启动指南

使用已提供的测试钱包快速完成部署

---

## 📋 前提条件

✅ 您已经提供了测试钱包助记词
✅ 钱包里有测试 ETH
✅ 已创建 `.env` 文件（包含助记词）

---

## 🚀 一键部署流程

### 方法一：全自动部署（推荐）⚡

一条命令完成所有操作：

```bash
npm run quick-start
```

这会自动：
1. ✅ 安装所有依赖
2. ✅ 编译智能合约
3. ✅ 部署到 Sepolia 测试网
4. ✅ 显示合约地址

**预计时间**: 3-5 分钟

---

### 方法二：分步执行

如果想更细致地控制过程：

#### 第1步：安装依赖

```bash
npm install
```

#### 第2步：检查钱包（可选）

```bash
npm run setup
```

这会显示：
- 钱包地址
- 账户余额
- 私钥（如需要）

#### 第3步：编译合约

```bash
npm run compile
```

#### 第4步：部署合约

```bash
npm run deploy:sepolia
```

成功后会显示：
```
✅ 合约部署成功!
📍 合约地址: 0x1234...5678
🔗 在 Etherscan 查看: https://sepolia.etherscan.io/address/0x1234...5678
```

**复制并保存合约地址！**

---

## 🎨 配置和测试前端

### 第1步：进入前端目录

```bash
cd frontend
```

### 第2步：安装前端依赖

```bash
npm install
```

### 第3步：创建前端环境配置

创建 `frontend/.env` 文件：

```env
# 替换为上一步部署的合约地址
VITE_CONTRACT_ADDRESS=0x你的合约地址

# Sepolia Chain ID
VITE_CHAIN_ID=11155111

# Sepolia RPC URL
VITE_RPC_URL=https://rpc.sepolia.org
```

### 第4步：启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

### 第5步：测试功能

在浏览器中：
1. ✅ 连接 MetaMask 钱包
2. ✅ 切换到 Sepolia 网络
3. ✅ 创建一个测试投票
4. ✅ 尝试投票
5. ✅ 检查投票列表

---

## 📝 完整的命令清单

```bash
# 在项目根目录
npm install                    # 安装依赖
npm run setup                  # 检查钱包（可选）
npm run compile                # 编译合约
npm run deploy:sepolia         # 部署到 Sepolia

# 或者一键完成
npm run quick-start

# 然后配置和测试前端
cd frontend
npm install
# 创建 frontend/.env 文件，填入合约地址
npm run dev
```

---

## ✅ 成功标志

### 合约部署成功
看到以下信息说明成功：
```
✅ 合约部署成功!
📍 合约地址: 0x...
🔗 在 Etherscan 查看: https://sepolia.etherscan.io/address/0x...
```

### 前端运行成功
浏览器显示：
- 渐变紫色背景
- "欢迎来到 Voting-Fun" 标题
- "连接 MetaMask 钱包" 按钮

---

## 🐛 常见问题

### Q: 提示 "账户余额为 0"？
**A**: 访问 https://sepoliafaucet.com/ 获取测试币

### Q: 部署失败，提示 "nonce too low"？
**A**: 等待几秒后重试，或者清除交易队列

### Q: 编译失败？
**A**: 
```bash
# 清除缓存后重新编译
rm -rf cache artifacts
npm run compile
```

### Q: 前端无法连接合约？
**A**: 
1. 检查 `frontend/.env` 中的合约地址是否正确
2. 检查 MetaMask 是否连接到 Sepolia
3. 检查钱包是否有测试币

### Q: MetaMask 提示 "用户拒绝交易"？
**A**: 这是正常的，确认交易即可

---

## 📊 预计完成时间

| 步骤 | 时间 |
|------|------|
| 安装依赖 | 2-3 分钟 |
| 编译合约 | 30 秒 |
| 部署合约 | 1-2 分钟 |
| 配置前端 | 1 分钟 |
| 测试功能 | 5-10 分钟 |
| **总计** | **10-15 分钟** |

---

## 🎯 检查清单

部署前：
- [ ] 已创建 `.env` 文件
- [ ] 助记词已填入 `.env`
- [ ] 钱包有测试 ETH
- [ ] 已安装 Node.js

部署后：
- [ ] 合约地址已复制
- [ ] 在 Etherscan 可以查看合约
- [ ] 前端 `.env` 已配置
- [ ] 前端可以正常访问
- [ ] 能够连接钱包
- [ ] 能够创建投票
- [ ] 能够参与投票

---

## 🎉 完成后的下一步

1. **上传到 GitHub**
   - 查看 `GITHUB_SETUP.md`
   - ⚠️ 确保不要提交 `.env` 文件！

2. **部署到 Netlify**
   - 查看 `DEPLOYMENT_GUIDE.md`
   - 需要您提供 Netlify API Key

3. **提交参赛**
   - 查看 `SUBMISSION_GUIDE.md`
   - 准备项目材料

---

## 📞 需要帮助？

- 查看 `START_HERE.md` - 完整指南
- 查看 `DEPLOYMENT_GUIDE.md` - 详细部署说明
- 查看 `update_debug_log.md` - 常见问题解决方案

---

**现在就开始吧！运行第一条命令：**

```bash
npm run quick-start
```

🚀 让我们开始吧！


