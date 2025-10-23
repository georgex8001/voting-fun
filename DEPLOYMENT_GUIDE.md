# 🚀 部署指南

完整的部署流程，从安装依赖到上线。

## 📋 前置准备

### 1. 安装必要工具
- ✅ Node.js >= 18.0.0
- ✅ Git
- ✅ MetaMask 浏览器扩展

### 2. 获取测试资源
- ✅ Sepolia 测试网 ETH：https://sepoliafaucet.com/
- ✅ Infura API Key：https://infura.io/
- ✅ GitHub 账号
- ✅ Netlify 账号：https://netlify.com/

---

## 第一步：安装依赖

```bash
# 安装项目根目录依赖（Hardhat 和合约）
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

---

## 第二步：配置环境变量

### 创建根目录 `.env` 文件

```bash
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 文件，填入：

```env
# 从 MetaMask 导出的私钥（不要泄露！）
PRIVATE_KEY=your_private_key_here

# 从 Infura 获取的 API Key
INFURA_API_KEY=your_infura_api_key

# Sepolia RPC URL（使用 Infura）
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

⚠️ **重要**：不要将 `.env` 文件提交到 Git！

---

## 第三步：编译智能合约

```bash
# 编译合约
npx hardhat compile
```

成功后会在 `artifacts/` 目录生成编译产物。

---

## 第四步：部署合约到 Sepolia

```bash
# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy.js --network sepolia
```

部署成功后，会显示：

```
✅ 合约部署成功!
📍 合约地址: 0x1234...5678
🔗 在 Etherscan 查看: https://sepolia.etherscan.io/address/0x1234...5678
```

**复制合约地址**，下一步需要用到！

---

## 第五步：配置前端环境变量

### 创建 `frontend/.env` 文件

```bash
cd frontend
cp .env.example .env
```

编辑 `frontend/.env`，填入部署的合约地址：

```env
# 上一步部署的合约地址
VITE_CONTRACT_ADDRESS=0x1234...5678

# Sepolia Chain ID
VITE_CHAIN_ID=11155111

# Sepolia RPC URL
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

---

## 第六步：本地测试前端

```bash
# 在 frontend 目录下
npm run dev
```

打开浏览器访问 `http://localhost:3000`，测试：

1. ✅ 连接 MetaMask 钱包
2. ✅ 切换到 Sepolia 网络
3. ✅ 创建测试投票
4. ✅ 进行投票
5. ✅ 查看结果

---

## 第七步：上传代码到 GitHub

### 初始化 Git 仓库

```bash
# 回到项目根目录
cd ..

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 完成 Voting-Fun 保密投票系统"

# 在 GitHub 创建新仓库后，添加远程仓库
git remote add origin https://github.com/你的用户名/voting-fun.git

# 推送到 GitHub
git push -u origin main
```

---

## 第八步：部署到 Netlify

### 方法一：通过 Netlify 网站（推荐）

1. 访问 https://app.netlify.com/
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub，授权访问
4. 选择 `voting-fun` 仓库
5. 配置构建设置（Netlify 会自动读取 `netlify.toml`）：
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. 点击 "Add environment variables"，添加：
   ```
   VITE_CONTRACT_ADDRESS=你的合约地址
   VITE_CHAIN_ID=11155111
   VITE_RPC_URL=你的RPC_URL
   ```
7. 点击 "Deploy site"

### 方法二：使用 Netlify CLI

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
cd frontend
netlify deploy --prod
```

---

## 第九步：测试部署的网站

访问 Netlify 提供的 URL（例如：`https://your-app.netlify.app`），确认：

1. ✅ 网站可以访问
2. ✅ 钱包可以连接
3. ✅ 创建投票功能正常
4. ✅ 投票功能正常
5. ✅ 结果显示正常

---

## 🎉 部署完成清单

- ✅ 合约已部署到 Sepolia
- ✅ 前端已部署到 Netlify
- ✅ 代码已上传到 GitHub
- ✅ 所有功能测试通过

---

## 📝 重要链接记录

填写完成后保存：

- **GitHub 仓库**: https://github.com/你的用户名/voting-fun
- **Netlify 网站**: https://你的应用.netlify.app
- **合约地址**: 0x...
- **Etherscan**: https://sepolia.etherscan.io/address/0x...

---

## 🆘 常见问题

### Q1: 部署合约时提示余额不足？
**A**: 访问 https://sepoliafaucet.com/ 获取测试 ETH

### Q2: Netlify 构建失败？
**A**: 检查环境变量是否正确配置，特别是 `VITE_CONTRACT_ADDRESS`

### Q3: 前端无法连接合约？
**A**: 
1. 确认 MetaMask 连接到 Sepolia 网络
2. 确认合约地址正确
3. 打开浏览器控制台查看错误信息

### Q4: 投票后无法看到结果？
**A**: 
1. 确认投票是否已结束
2. 确认是否已请求解密（需要创建者操作）
3. 解密需要等待 Gateway 处理

---

## 📚 相关资源

- [Hardhat 文档](https://hardhat.org/docs)
- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [Netlify 文档](https://docs.netlify.com/)
- [Ethers.js 文档](https://docs.ethers.org/)

---

**祝部署顺利！** 🚀


