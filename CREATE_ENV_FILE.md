# 📝 创建环境配置文件

按照以下步骤创建 `.env` 文件

---

## 🎯 在项目根目录创建 `.env` 文件

### Windows 用户（使用记事本）

1. 在项目根目录 `E:\ZAMAcode\voting-fun` 右键
2. 选择 "新建" → "文本文档"
3. 将文件名改为 `.env` （注意前面有个点，删除 .txt 后缀）
4. 用记事本打开，粘贴以下内容：

```env
# 助记词（已提供）
MNEMONIC=company canal cross misery duck gospel source pride safe virus spoon point

# Sepolia RPC URL（使用公共节点）
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# 合约地址（部署后填入）
CONTRACT_ADDRESS=
```

5. 保存文件（Ctrl + S）
6. 关闭记事本

### 或者使用 VS Code

1. 在 VS Code 中，点击左侧文件列表
2. 点击 "新建文件" 图标
3. 输入文件名: `.env`
4. 粘贴上面的内容
5. 保存（Ctrl + S）

### 或者使用命令行（最快）

```bash
# 在项目根目录执行
echo MNEMONIC=company canal cross misery duck gospel source pride safe virus spoon point > .env
echo SEPOLIA_RPC_URL=https://rpc.sepolia.org >> .env
echo CONTRACT_ADDRESS= >> .env
```

---

## ✅ 验证文件创建成功

### 检查文件是否存在

```bash
# Windows PowerShell
dir .env

# 或者 CMD
dir .env

# 或者 Git Bash
ls -la .env
```

应该看到文件存在。

---

## ⚠️ 重要提醒

1. **`.env` 文件不会被提交到 Git**
   - 已经在 `.gitignore` 中配置
   - 这是安全措施，保护您的私钥

2. **助记词已经公开**
   - 由于您在对话中分享了助记词
   - 建议只用于测试，不要存放有价值资产
   - 测试完成后可以创建新钱包

3. **确保文件位置正确**
   - `.env` 文件应该在项目根目录
   - 与 `package.json` 在同一级

---

## 🚀 创建完成后

继续执行部署命令：

```bash
npm run quick-start
```

这会自动完成所有部署步骤！

---

## 📂 正确的项目结构

```
E:\ZAMAcode\voting-fun\
├── .env                    ← 您刚创建的文件
├── .env.example
├── package.json
├── hardhat.config.js
├── contracts/
├── scripts/
├── frontend/
└── ...其他文件
```

---

**创建好 `.env` 文件后，就可以开始部署了！** 🚀


