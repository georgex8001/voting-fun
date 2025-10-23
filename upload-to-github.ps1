# 🚀 GitHub 自动上传脚本
# 使用 GitHub Token 自动创建仓库并推送代码

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 Upload to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取 GitHub Token
Write-Host "📝 Please enter your GitHub Personal Access Token:" -ForegroundColor Yellow
Write-Host "   (Create one at: https://github.com/settings/tokens)" -ForegroundColor Gray
Write-Host ""
$GITHUB_TOKEN = Read-Host "Token" -AsSecureString
$GITHUB_TOKEN_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($GITHUB_TOKEN)
)

if ([string]::IsNullOrWhiteSpace($GITHUB_TOKEN_Plain)) {
    Write-Host "❌ Error: GitHub token is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Enter your GitHub username:" -ForegroundColor Yellow
$GITHUB_USERNAME = Read-Host "Username"

if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
    Write-Host "❌ Error: GitHub username is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Enter repository name (default: voting-fun):" -ForegroundColor Yellow
$REPO_NAME = Read-Host "Repository name"
if ([string]::IsNullOrWhiteSpace($REPO_NAME)) {
    $REPO_NAME = "voting-fun"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Username: $GITHUB_USERNAME" -ForegroundColor White
Write-Host "  Repository: $REPO_NAME" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 确认继续
Write-Host "Continue? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Upload Process..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 1: 创建 GitHub 仓库
Write-Host "📦 Step 1: Creating GitHub repository..." -ForegroundColor Yellow

$repoData = @{
    name = $REPO_NAME
    description = "Voting-Fun - Fully Confidential Voting System powered by Zama FHEVM"
    private = $false
    auto_init = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "token $GITHUB_TOKEN_Plain"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
        -Method Post `
        -Headers $headers `
        -Body $repoData `
        -ContentType "application/json"
    
    Write-Host "  ✅ Repository created: $($response.html_url)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "  ⚠️  Repository already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ Error creating repository: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: 初始化 Git 仓库
Write-Host "📁 Step 2: Initializing Git repository..." -ForegroundColor Yellow

if (Test-Path .git) {
    Write-Host "  ⚠️  Git repository already exists, cleaning..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

git init
git branch -M main

Write-Host "  ✅ Git initialized" -ForegroundColor Green
Write-Host ""

# Step 3: 添加所有文件
Write-Host "📝 Step 3: Adding files..." -ForegroundColor Yellow
git add .
Write-Host "  ✅ Files added" -ForegroundColor Green
Write-Host ""

# Step 4: 提交
Write-Host "💾 Step 4: Creating commit..." -ForegroundColor Yellow
git commit -m "🎉 Initial commit: Voting-Fun - Confidential Voting System

- Smart contracts with FHEVM encryption
- Modern React frontend with English UI
- Automatic Gateway health monitoring
- Fallback mode support
- Comprehensive documentation
- Deployed on Netlify: https://dainty-sawine-83844d.netlify.app

Features:
✅ Fully encrypted voting using Zama FHEVM
✅ Real-time FHE status monitoring
✅ Automatic fallback when Gateway is offline
✅ Beautiful modern UI
✅ Complete documentation and guides

Tech Stack: Solidity, React, ethers.js, fhevmjs, TailwindCSS"

Write-Host "  ✅ Commit created" -ForegroundColor Green
Write-Host ""

# Step 5: 添加远程仓库
Write-Host "🔗 Step 5: Adding remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://$GITHUB_TOKEN_Plain@github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git remote add origin $remoteUrl
Write-Host "  ✅ Remote added" -ForegroundColor Green
Write-Host ""

# Step 6: 推送到 GitHub
Write-Host "🚀 Step 6: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "  (This may take a few minutes...)" -ForegroundColor Gray
Write-Host ""

try {
    git push -u origin main 2>&1 | Out-String | Write-Host
    Write-Host ""
    Write-Host "  ✅ Push completed!" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error pushing to GitHub: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Your project has been uploaded to GitHub!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Repository URL:" -ForegroundColor Yellow
Write-Host "   https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Live Demo:" -ForegroundColor Yellow
Write-Host "   https://dainty-sawine-83844d.netlify.app" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Visit your repository on GitHub" -ForegroundColor White
Write-Host "   2. Add topics/tags: blockchain, fhevm, zama, voting, privacy" -ForegroundColor White
Write-Host "   3. Update README.md with your demo URL" -ForegroundColor White
Write-Host "   4. Submit to Zama Developer Program" -ForegroundColor White
Write-Host ""

# 清理（移除包含 token 的 remote）
git remote remove origin
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

Write-Host "🔒 Security: Token has been removed from git config" -ForegroundColor Green
Write-Host ""

