# 前端环境配置指南

## 问题说明

您遇到的错误 `"Your instance has been created without the public blockchain key"` 已经修复。

## 已做的修复

### 1. 更新了 `frontend/src/hooks/useContract.js`

- ✅ 在 `initFhevmInstance` 函数中添加了公钥获取逻辑
- ✅ 在 `createPoll` 函数中添加了公钥验证
- ✅ 在 `vote` 函数中添加了公钥验证

### 2. 核心修改点

**在初始化 FHEVM 时获取公钥：**
```javascript
// 在初始化后获取公钥（关键步骤）
if (CONTRACT_ADDRESS) {
  console.log('🔑 为合约获取公钥...')
  const publicKey = fhevmInstanceCache.getPublicKey(CONTRACT_ADDRESS.toLowerCase())
  if (publicKey) {
    console.log('✅ 公钥已获取并缓存')
  }
}
```

**在使用前验证公钥：**
```javascript
// 获取公钥
const publicKey = instance.getPublicKey(CONTRACT_ADDRESS.toLowerCase())
if (!publicKey) {
  throw new Error('无法获取区块链公钥，请稍后重试')
}
```

## 需要手动创建的文件

### 创建 `frontend/.env` 文件

在 `frontend` 目录下创建 `.env` 文件，内容如下：

```bash
# Sepolia 网络配置
VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
VITE_RPC_URL=https://eth-sepolia.public.blastapi.io

# 合约地址（从 deployment.json 中获取）
VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
```

## 测试步骤

### 1. 创建环境配置文件

```powershell
cd frontend
notepad .env
```

粘贴上面的环境变量配置，保存并关闭。

### 2. 重启前端开发服务器

如果前端正在运行，请停止并重新启动：

```powershell
# 停止当前服务器 (Ctrl+C)

# 重新启动
npm run dev
```

### 3. 测试创建投票

1. 打开浏览器访问前端应用
2. 连接 MetaMask 钱包
3. 尝试创建一个新投票
4. 查看浏览器控制台，应该看到以下日志：

```
🔐 初始化 FHEVM SDK...
📚 使用 Zama 官方 Sepolia 配置
📋 FHEVM 完整配置: {...}
✅ FHEVM SDK 初始化成功！
🔑 为合约获取公钥...
✅ 公钥已获取并缓存
🔑 获取区块链公钥...
✅ 公钥获取成功
```

## 可能的额外问题

### 如果仍然出现公钥错误

这可能意味着 fhevmjs 需要从区块链异步获取公钥。请尝试以下方法：

1. **检查网络连接**：确保可以访问 Sepolia RPC 节点
2. **检查合约地址**：确认 `VITE_CONTRACT_ADDRESS` 是正确的合约地址
3. **清除浏览器缓存**：有时旧的缓存会导致问题

### 如果需要从区块链异步获取公钥

根据 fhevmjs 的版本，可能需要这样调用：

```javascript
// 这是另一种可能的实现方式
const publicKey = await instance.getPublicKey(CONTRACT_ADDRESS.toLowerCase())
```

如果当前方式不工作，请告诉我，我会进一步调整代码。

## 验证清单

- [ ] 创建了 `frontend/.env` 文件
- [ ] 环境变量中包含正确的合约地址
- [ ] 重启了前端开发服务器
- [ ] MetaMask 连接到 Sepolia 测试网
- [ ] MetaMask 账户有足够的 Sepolia ETH
- [ ] 浏览器控制台显示初始化成功的日志

## 下一步

如果上述步骤完成后仍有问题，请：

1. 截图浏览器控制台的完整错误信息
2. 分享 MetaMask 中显示的网络和账户信息
3. 确认您使用的 fhevmjs 版本（查看 `frontend/package.json`）

## 调试技巧

### 查看详细日志

在浏览器控制台中，可以看到详细的初始化过程：

```javascript
// 打开控制台（F12），查看以下日志
🔐 初始化 FHEVM SDK...
📋 FHEVM 完整配置: {
  chainId: 11155111,
  gatewayChainId: 55815,
  network: "https://eth-sepolia.public.blastapi.io...",
  relayerUrl: "https://relayer.testnet.zama.cloud",
  aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC"
}
```

### 手动测试 FHEVM 初始化

在浏览器控制台中运行：

```javascript
// 检查环境变量
console.log('CONTRACT_ADDRESS:', import.meta.env.VITE_CONTRACT_ADDRESS)
console.log('NETWORK_URL:', import.meta.env.VITE_NETWORK_URL)
```

## 联系支持

如果问题持续存在，可以：

1. 查看 Zama 官方文档：https://docs.zama.ai/
2. 在 Zama Discord 社区寻求帮助
3. 检查 GitHub Issues：https://github.com/zama-ai/fhevmjs/issues


