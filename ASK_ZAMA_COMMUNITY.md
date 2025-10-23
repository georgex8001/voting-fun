# 📢 向 Zama 社区询问

## 🎯 当前情况

我们的 FHEVM 合约已经成功部署到 Sepolia，但是在调用 `createPoll` 函数时遇到 `execution reverted` 错误。

**原因分析**：
合约使用了 TFHE 操作（`TFHE.asEuint32()`, `TFHE.allow()` 等），但标准的 Sepolia EVM 可能不支持这些 TFHE precompiled contracts。

---

## 📝 询问模板

### 在 Zama Discord (#dev-support) 发帖：

```
Hi everyone! 👋

I'm participating in the Zama Developer Program (Builder Track + Bounty Track) and building a confidential voting dApp using FHEVM.

**Current Status:**
✅ Contract compiles successfully
✅ Contract deploys to Sepolia: 0x7feb12a8578460e5e24095e50f1a3F19Ae15bF9A
✅ Frontend configured with full Sepolia config (ACL, KMS, Gateway, Relayer)
❌ `createPoll` function fails with "execution reverted"

**Contract Code:**
The contract uses TFHE operations in createPoll:
```solidity
function createPoll(...) external returns (uint256) {
    // ...
    for (uint256 i = 0; i < _options.length; i++) {
        euint32 initialCount = TFHE.asEuint32(0);
        TFHE.allow(initialCount, address(this));
        newPoll.encryptedVotes.push(initialCount);
    }
    // ...
}
```

**My Configuration:**
- Using official Sepolia config from docs:
  - ACL: 0x687820221192C5B662b25367F70076A37bc79b6c
  - KMS: 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
  - Gateway Chain ID: 55815
  - Relayer: https://relayer.testnet.zama.cloud
- Deployed to Sepolia (Chain ID: 11155111)

**Questions:**
1. Should FHEVM contracts be deployed to a different network (not standard Sepolia)?
2. Is there a public Zama testnet with full TFHE support?
3. Or should I run a local fhEVM node with Docker for testing?
4. What's the recommended deployment target for the Developer Program?

**My Setup:**
- fhevmjs: 0.5.0
- Solidity: 0.8.24
- Frontend: React + fhevmjs SDK

Any guidance would be greatly appreciated! Thanks! 🙏
```

---

## 🔗 联系方式

- **Discord**: https://discord.gg/zama
  - 频道：#dev-support 或 #fhevm
  
- **Community Forum**: https://community.zama.ai
  
- **Telegram**: https://t.me/zama_fhe

---

## ⏱️ 预期等待时间

- Discord：几小时到1天
- Forum：1-3天
- 可能会得到官方团队或经验丰富的社区成员的回复

---

## 📊 可能的回复

### 回复 A：需要使用 Zama Devnet
```
"You need to deploy to Zama Devnet at [URL]..."
```
**行动**：更新 Hardhat 配置，重新部署

### 回复 B：使用本地节点
```
"For testing, use local fhEVM node with Docker..."
```
**行动**：运行 `npm run fhevm:start`，本地部署

### 回复 C：Sepolia 不支持
```
"Sepolia doesn't support TFHE operations. Use [alternative]..."
```
**行动**：按指示操作

---

## 🚀 获得回复后

**立即告诉我回复内容**，我会：
1. ✅ 更新所有配置
2. ✅ 重新部署合约
3. ✅ 调整前端配置
4. ✅ 完成测试
5. ✅ 准备提交材料

---

**现在就去发帖吧！** 💪

记得：
- 保持礼貌和专业
- 提供足够的技术细节
- 说明你在参加 Developer Program
- 如果有回复，立即告诉我！

