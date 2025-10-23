# 🚀 快速启动指南 - Gateway 自动 Fallback 功能

## 📋 功能概述

您的 Voting-Fun 应用现在具备：
- ✅ **自动检测 FHE Gateway 状态**（每 60 秒）
- ✅ **自动 fallback 到纯 EVM 模式**（Gateway 离线时）
- ✅ **自动恢复加密功能**（Gateway 恢复时）
- ✅ **实时状态显示**（Header 右上角徽章）
- ✅ **Toast 通知提示**（状态变化时）

---

## 🏃‍♂️ 快速开始

### 1. 启动前端
```bash
cd frontend
npm run dev
```

### 2. 访问应用
浏览器打开：`http://localhost:5173`

### 3. 连接钱包
点击"连接钱包"按钮，选择 MetaMask

### 4. 观察状态
查看 Header 右上角的状态徽章：

- 🟢 **FHE 加密在线** → Gateway 正常工作
- 🟡 **Fallback 模式** → Gateway 离线，使用标准 EVM
- 🟡 **检测中...** → 正在初始化或检测

---

## 🎯 测试场景

### ✅ 场景 1：正常使用
1. 连接钱包后，看到 🟢 **FHE 加密在线**
2. 创建投票 → 使用加密功能
3. 投票 → 使用加密投票

### ⚠️ 场景 2：Gateway 离线
1. 假设 Gateway 暂时不可用
2. 徽章自动变为 🟡 **Fallback 模式**
3. 收到 Toast 通知："⚠️ Gateway 暂时不可用，已切换到 Fallback 模式"
4. 继续使用应用 → 功能正常，但使用标准 EVM 模式

### 🔄 场景 3：Gateway 恢复
1. Gateway 恢复在线
2. 最多 60 秒后，徽章自动变回 🟢 **FHE 加密在线**
3. 收到 Toast 通知："🔐 Gateway 已恢复，加密功能现已可用"
4. 应用自动启用加密功能

---

## 🖥️ 控制台日志

启动应用时，您会看到以下日志：

```
🚀 启动应用，初始化 FHEVM...
🔐 初始化 FHEVM SDK...
✅ Gateway reachable: https://gateway.sepolia.zama.ai
✅ FHEVM SDK 初始化成功
🩺 启动 Gateway 健康轮询（每 60 秒）...
```

如果 Gateway 离线：

```
⚠️ Gateway unavailable: HTTP 503
🚧 Gateway 离线，进入 fallback 模式（纯 EVM）
🩺 启动 Gateway 健康轮询（每 60 秒）...
```

Gateway 恢复时：

```
✅ Gateway reachable: https://gateway.sepolia.zama.ai
🔁 Gateway 已恢复，尝试重新初始化 SDK...
✅ FHEVM SDK 初始化成功
🔄 FHE Status changed: down → up
```

---

## 📱 UI 展示

### Header 布局
```
┌─────────────────────────────────────────────────────────────┐
│ 🗳️ Voting-Fun  [🟢 FHE 加密在线] [网络: Sepolia]        │
│    保密投票系统                      [账户: 0x1234...5678]   │
│                                      [断开连接]               │
└─────────────────────────────────────────────────────────────┘
```

### 状态徽章样式

#### 在线状态（绿色）
```
┌──────────────────────┐
│ 🛡️  FHE 加密在线     │
└──────────────────────┘
```

#### Fallback 状态（橙色）
```
┌──────────────────────┐
│ ⚠️  Fallback 模式    │
└──────────────────────┘
```

#### 检测中状态（黄色，带旋转动画）
```
┌──────────────────────┐
│ 🔄  检测中...        │
└──────────────────────┘
```

---

## 🔧 技术细节

### 自动检测机制
- **初始检测**：应用启动时立即检测
- **定时轮询**：每 60 秒检测一次
- **检测方法**：请求 `https://gateway.sepolia.zama.ai/public_key`
- **判断标准**：
  - HTTP 200 且返回以 `0x04` 开头、长度 ≥ 66 的字符串 → 在线
  - 其他情况 → 离线

### 状态管理
```javascript
// 三种状态
"up"      → Gateway 在线，FHE 功能可用
"down"    → Gateway 离线，使用 Fallback
"unknown" → 初始化中或检测中
```

### Fallback 行为
- **Gateway 离线时**：
  - 合约调用仍然正常工作
  - 使用标准 EVM 交易（非加密）
  - 用户无需手动操作，自动切换

- **Gateway 恢复时**：
  - 自动重新初始化 SDK
  - 恢复加密功能
  - 用户无需刷新页面

---

## 🐛 故障排查

### 问题 1：一直显示 "检测中..."
**原因**：网络连接问题或 Gateway 完全无响应

**解决**：
1. 检查网络连接
2. 查看浏览器控制台日志
3. 确认 Sepolia 测试网正常

### 问题 2：频繁切换状态
**原因**：Gateway 不稳定或网络波动

**解决**：
1. 查看控制台日志确认问题
2. 等待 Gateway 稳定
3. 在 Fallback 模式下继续使用

### 问题 3：Toast 通知过多
**原因**：状态频繁变化

**行为**：这是正常的，说明在实时监控
**建议**：可以暂时忽略，系统会自动处理

---

## 📊 性能指标

### 轮询频率
- **间隔**：60 秒
- **超时**：默认浏览器 fetch 超时
- **重试**：自动持续轮询，无需手动重试

### 资源占用
- **CPU**：极低（每分钟一次轻量级 HTTP 请求）
- **内存**：最小（只维护状态变量和监听器）
- **网络**：极少（每分钟 ~1KB）

---

## 🎨 自定义配置

### 修改轮询间隔
编辑 `frontend/src/hooks/useContract.js`：

```javascript
// 将 60_000 改为你想要的毫秒数
// 例如：30 秒 = 30_000
pollingTimer = setInterval(async () => {
  // ...
}, 30_000); // ← 修改这里
```

### 修改徽章样式
编辑 `frontend/src/components/FheStatusBadge.jsx`：

```javascript
const getStatusConfig = () => {
  switch (status) {
    case 'up':
      return {
        // 修改颜色、文本等
        bgColor: 'bg-green-500/90', // ← 修改背景色
        text: 'FHE 加密在线',        // ← 修改文本
      }
    // ...
  }
}
```

### 禁用 Toast 通知
如果不想要 Toast 通知，在 `App.jsx` 中注释掉：

```javascript
// useFheStatusNotifications() // ← 注释这一行
```

---

## ✅ 验证清单

完成以下步骤确认功能正常：

- [ ] 前端启动成功
- [ ] 连接钱包成功
- [ ] Header 显示状态徽章
- [ ] 徽章显示 🟢 或 🟡 状态（不是一直 "检测中"）
- [ ] 控制台显示初始化日志
- [ ] 可以正常创建投票
- [ ] 可以正常投票

---

## 📚 相关文件

| 文件 | 作用 |
|------|------|
| `frontend/src/hooks/useContract.js` | Gateway 检测、轮询、状态管理 |
| `frontend/src/hooks/useFheStatusNotifications.js` | Toast 通知管理 |
| `frontend/src/components/FheStatusBadge.jsx` | 状态徽章组件 |
| `frontend/src/components/Header.jsx` | Header 布局（包含徽章） |
| `frontend/src/App.jsx` | 应用入口，初始化 SDK |

---

## 🆘 需要帮助？

### 查看详细文档
```bash
# 阅读完整更新说明
cat GATEWAY_AUTO_FALLBACK_UPDATE.md
```

### 查看控制台日志
打开浏览器开发者工具（F12）→ Console 标签

### 常见问题
1. **徽章不显示**：检查是否已连接钱包
2. **一直 fallback 模式**：确认 Gateway URL 正确
3. **Toast 不出现**：检查 `react-hot-toast` 是否正常工作

---

## 🎉 完成！

您的应用现在具备企业级的健壮性和优秀的用户体验！

**享受您的加密投票之旅！** 🗳️🔐

