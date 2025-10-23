# 📦 GitHub 设置指南

如何将项目上传到 GitHub 并配置仓库

---

## 第一步：创建 GitHub 仓库

### 1.1 在 GitHub 网站创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `voting-fun`
   - **Description**: `基于 Zama FHEVM 的保密投票系统 - Zama Developer Program`
   - **Public** ✅ （必须公开才能参赛）
   - **不要勾选** "Add a README file"（我们已经有了）
   - **不要添加** .gitignore（我们已经有了）
3. 点击 "Create repository"

---

## 第二步：初始化本地 Git 仓库

```bash
# 回到项目根目录
cd E:\ZAMAcode\voting-fun

# 初始化 Git 仓库
git init

# 查看当前状态
git status
```

---

## 第三步：添加文件到 Git

```bash
# 添加所有文件（.gitignore 会自动过滤不需要的文件）
git add .

# 查看将要提交的文件
git status

# 确认 .env 文件没有被添加（重要！）
```

**⚠️ 安全检查**：确保以下文件**没有**被添加：
- `.env`
- `frontend/.env`
- `node_modules/`
- 私钥文件

---

## 第四步：提交代码

```bash
# 第一次提交
git commit -m "feat: 完成 Voting-Fun 保密投票系统

- 实现基于 FHEVM 的保密投票智能合约
- 创建现代化的 React 前端界面
- 集成 fhevmjs SDK 和钱包连接
- 完整的部署和教程文档

项目特性：
- 完全保密的链上投票
- 支持多选项投票
- 投票结果加密存储
- Gateway 解密机制
- 响应式 UI 设计

参加 Zama Developer Program 2025"
```

---

## 第五步：连接远程仓库

```bash
# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/voting-fun.git

# 验证远程仓库
git remote -v

# 设置主分支名称
git branch -M main

# 推送到 GitHub
git push -u origin main
```

**如果推送失败**：
```bash
# 配置 Git 用户信息（如果还没配置）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 如果遇到认证问题，使用 Personal Access Token
# 访问 https://github.com/settings/tokens 生成 Token
# 推送时使用 Token 作为密码
```

---

## 第六步：完善 GitHub 仓库

### 6.1 添加主题标签（Topics）

在 GitHub 仓库页面：
1. 点击右侧的 ⚙️ 设置按钮（About 旁边）
2. 添加以下主题标签：
   ```
   fhe
   fhevm
   zama
   privacy
   voting
   blockchain
   ethereum
   solidity
   react
   web3
   homomorphic-encryption
   defi
   sepolia
   ```

### 6.2 设置仓库描述

在 About 设置中：
- **Description**: `🗳️ 基于 Zama FHEVM 的保密投票系统 | Privacy-Preserving Voting System using Fully Homomorphic Encryption`
- **Website**: 添加你的 Netlify 部署链接
- 勾选 ✅ **"Use your GitHub Pages website"**（如果有）

### 6.3 创建 Release（可选）

```bash
# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0 - Zama Developer Program Submission"

# 推送标签
git push origin v1.0.0
```

然后在 GitHub 上：
1. 进入 "Releases" 页面
2. 点击 "Draft a new release"
3. 选择 v1.0.0 标签
4. 填写 Release 说明
5. 发布

---

## 第七步：配置 GitHub Actions（可选）

创建 `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Dependencies
      run: npm install
      
    - name: Compile Contracts
      run: npx hardhat compile
      
    - name: Build Frontend
      run: |
        cd frontend
        npm install
        npm run build
```

提交并推送：
```bash
git add .github/workflows/ci.yml
git commit -m "ci: 添加 GitHub Actions 工作流"
git push
```

---

## 第八步：添加项目徽章（Badges）

在 README.md 顶部添加：

```markdown
# 🗳️ Voting-Fun - 保密投票系统

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.19.0-yellow)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![FHEVM](https://img.shields.io/badge/FHEVM-0.5.0-purple)
![Network](https://img.shields.io/badge/Network-Sepolia-orange)

基于 Zama FHEVM 技术的完全保密链上投票 dApp
```

---

## 第九步：创建项目文档结构

确保你的 README.md 包含：

- [x] 项目介绍和 Logo
- [x] 核心功能列表
- [x] 技术栈说明
- [x] 快速开始指南
- [x] 部署说明
- [x] 使用演示（截图或 GIF）
- [x] 架构图（可选）
- [x] 贡献指南
- [x] 许可证信息

---

## 🎬 第十步：录制演示 GIF（可选）

使用工具录制操作演示：

**推荐工具**:
- **ScreenToGif** (Windows)
- **Kap** (macOS)
- **Peek** (Linux)
- **LICEcap** (跨平台)

**演示内容**:
1. 连接钱包
2. 创建投票
3. 参与投票
4. 查看结果

保存为 `demo.gif` 并添加到 README：

```markdown
## 🎥 演示

![Demo](demo.gif)
```

提交：
```bash
git add demo.gif README.md
git commit -m "docs: 添加演示 GIF"
git push
```

---

## 📝 提交清单

在提交参赛前，确认：

- [ ] 代码已推送到 GitHub
- [ ] 仓库是**公开**的
- [ ] README.md 完整且格式正确
- [ ] 添加了主题标签（Topics）
- [ ] 设置了仓库描述
- [ ] .env 文件**没有**被提交
- [ ] 所有敏感信息已删除
- [ ] 代码可以成功编译
- [ ] 文档清晰易懂
- [ ] 包含部署指南
- [ ] 添加了 License 文件

---

## 🔒 安全检查

**重要**：确保以下内容**永远不要**提交到 GitHub：

```bash
# 检查是否误提交敏感信息
git log --all --full-history -- .env
git log --all --full-history -- frontend/.env

# 如果发现已提交，立即删除并重写历史
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**最佳实践**：
- 使用环境变量
- 使用 .env.example 文件
- 在 .gitignore 中排除敏感文件
- 定期审查提交历史

---

## 🌟 让项目更专业

### 添加 LICENSE 文件

创建 `LICENSE` 文件（MIT License）：

```
MIT License

Copyright (c) 2025 Voting-Fun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 添加 CONTRIBUTING.md

```markdown
# 贡献指南

感谢你对 Voting-Fun 的关注！

## 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 代码规范

- 使用 ESLint 检查代码
- 遵循 Solidity 最佳实践
- 添加必要的注释
- 更新相关文档

## 报告 Bug

请在 Issues 页面提交，包含：
- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息
```

提交：
```bash
git add LICENSE CONTRIBUTING.md
git commit -m "docs: 添加 LICENSE 和贡献指南"
git push
```

---

## 🎉 完成！

你的 GitHub 仓库现在已经：
- ✅ 代码完整上传
- ✅ 文档齐全
- ✅ 安全无泄漏
- ✅ 专业规范
- ✅ 准备好参赛

**仓库链接**: `https://github.com/你的用户名/voting-fun`

复制这个链接，准备提交到 Zama Developer Program！🚀


