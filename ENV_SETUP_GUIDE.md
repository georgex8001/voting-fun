# 🔧 环境配置指南

## 第一步：创建 .env 文件

请按照以下步骤操作：

### 1. 打开 CMD（命令提示符）

按 `Win + R`，输入 `cmd`，回车

### 2. 进入项目目录

```bash
cd /d E:\ZAMAcode\voting-fun
```

### 3. 创建 .env 文件

**方式 A：使用 echo 命令**（推荐）

复制下面的命令，在 CMD 中粘贴并回车：

```bash
echo # Zama Voting-Fun 环境配置 > .env
echo MNEMONIC=your twelve word mnemonic phrase goes here please replace >> .env
echo SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io >> .env
```

**方式 B：使用记事本创建**

```bash
notepad .env
```

然后粘贴以下内容：

```
# Zama Voting-Fun 环境配置
MNEMONIC=your twelve word mnemonic phrase goes here please replace
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

保存并关闭记事本。

---

## 第二步：填写助记词

### 1. 用记事本打开 .env 文件

```bash
notepad .env
```

### 2. 替换助记词

找到这一行：
```
MNEMONIC=your twelve word mnemonic phrase goes here please replace
```

替换为您的真实助记词（12个英文单词，用空格分隔），例如：
```
MNEMONIC=abandon ability able about above absent absorb abstract absurd abuse access accident
```

⚠️ **注意：** 上面只是示例！请替换为您自己的助记词！

### 3. 保存文件

按 `Ctrl + S` 保存，然后关闭记事本。

---

## 第三步：验证配置

在 CMD 中运行：

```bash
type .env
```

您应该看到您的配置内容（但助记词会显示出来，确保周围没有人看）。

---

## ✅ 配置完成！

现在您可以继续部署合约了！

返回聊天窗口告诉我："环境配置完成"，我会继续帮您部署。

---

## 🔒 安全提示

- ✅ .env 文件已在 .gitignore 中，不会上传到 GitHub
- ✅ 助记词仅存储在本地
- ⚠️ 请勿将 .env 文件分享给任何人
- ⚠️ 请勿在聊天中发送助记词

---

## ❓ 如果没有助记词怎么办？

如果您没有测试钱包的助记词，可以：

### 方式 1：从 MetaMask 导出

1. 打开 MetaMask
2. 点击右上角菜单
3. 设置 → 安全和隐私
4. 显示助记词
5. 输入密码
6. 复制 12 个单词

### 方式 2：创建新的测试钱包

```bash
npx hardhat run scripts/setup-from-mnemonic.js
```

这会创建一个新的测试钱包并显示助记词。

---

## 📞 需要帮助？

如果遇到任何问题，告诉我具体的错误信息，我会帮您解决！



