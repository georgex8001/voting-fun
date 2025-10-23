# 前端环境配置脚本
# 用于快速创建 frontend/.env 文件

Write-Host "🚀 开始配置前端环境..." -ForegroundColor Green
Write-Host ""

# 获取合约地址
$deploymentFile = "deployment.json"
if (Test-Path $deploymentFile) {
    $deployment = Get-Content $deploymentFile | ConvertFrom-Json
    $contractAddress = $deployment.address
    Write-Host "✅ 从 deployment.json 读取合约地址: $contractAddress" -ForegroundColor Green
} else {
    Write-Host "⚠️  未找到 deployment.json，使用默认地址" -ForegroundColor Yellow
    $contractAddress = "0x6e34D1C8B45D54585b42DcB700DebA775715CDe6"
}

# 创建 .env 文件内容
$envContent = @"
# Sepolia 网络配置
VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
VITE_RPC_URL=https://eth-sepolia.public.blastapi.io

# 合约地址（从 deployment.json 中获取）
VITE_CONTRACT_ADDRESS=$contractAddress
"@

# 保存到 frontend/.env
$frontendDir = "frontend"
$envFile = Join-Path $frontendDir ".env"

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ 错误: frontend 目录不存在" -ForegroundColor Red
    exit 1
}

try {
    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force
    Write-Host ""
    Write-Host "✅ 成功创建 $envFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 配置内容:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Get-Content $envFile | ForEach-Object {
        Write-Host $_ -ForegroundColor White
    }
    Write-Host "─────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎯 下一步操作:" -ForegroundColor Yellow
    Write-Host "   1. cd frontend" -ForegroundColor White
    Write-Host "   2. npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 提示: 如果前端已经在运行，请重启开发服务器" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 创建文件失败: $_" -ForegroundColor Red
    exit 1
}


