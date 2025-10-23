# 🚀 Netlify Deployment Script for Voting-Fun
# PowerShell script to deploy frontend to Netlify

Write-Host "🎯 Starting Netlify Deployment..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$SITE_NAME = "voting-fun"
$BUILD_DIR = "frontend/dist"

# Step 1: Check if Netlify CLI is installed
Write-Host "📦 Checking Netlify CLI..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found!" -ForegroundColor Red
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

Write-Host ""

# Step 2: Build Frontend
Write-Host "🔨 Building Frontend..." -ForegroundColor Yellow
Set-Location frontend

# Clean previous build
if (Test-Path dist) {
    Write-Host "🧹 Cleaning previous build..." -ForegroundColor Gray
    Remove-Item -Recurse -Force dist
}

# Run build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build completed!" -ForegroundColor Green
Write-Host ""

# Step 3: Check if logged in to Netlify
Write-Host "🔐 Checking Netlify authentication..." -ForegroundColor Yellow
$status = netlify status 2>&1

if ($status -like "*Not logged in*") {
    Write-Host "⚠️  Not logged in to Netlify" -ForegroundColor Yellow
    Write-Host "Opening browser for authentication..." -ForegroundColor Cyan
    netlify login
}

Write-Host ""

# Step 4: Deploy to Netlify
Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

netlify deploy --prod --dir=dist

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Copy your live URL from above" -ForegroundColor White
    Write-Host "2. Add environment variables in Netlify dashboard:" -ForegroundColor White
    Write-Host "   - VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io" -ForegroundColor Gray
    Write-Host "   - VITE_RPC_URL=https://eth-sepolia.public.blastapi.io" -ForegroundColor Gray
    Write-Host "   - VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6" -ForegroundColor Gray
    Write-Host "3. Trigger a redeploy from Netlify dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host "🎉 All done!" -ForegroundColor Green
Write-Host ""

