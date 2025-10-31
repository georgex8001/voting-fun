# GitHub 上传前的项目清理脚本
# PowerShell 版本

Write-Host "🧹 开始清理项目..." -ForegroundColor Green

# 需要删除的临时文档
$filesToDelete = @(
    "update_debug_log.md",
    "self_check_log.md",
    "PROJECT_HISTORY.md",
    "CURRENT_SESSION_SUMMARY.md",
    "CURRENT_STATUS_SUMMARY.md",
    "ASK_ZAMA_COMMUNITY.md",
    "AUTO_DEPLOY.md",
    "CONFIGURE_NOW.md",
    "CREATE_ENV_FILE.md",
    "COPROCESSOR_SOLUTION.md",
    "FHEVM_DEPLOYMENT_OPTIONS.md",
    "FINAL_TEST_GUIDE.md",
    "FIX_SUMMARY.md",
    "FOR_ZAMA_GPT.md",
    "FRONTEND_ENV_SETUP.md",
    "GATEWAY_ISSUE_DIAGNOSIS.md",
    "GET_ZAMA_CONFIG.md",
    "GITHUB_SETUP.md",
    "IMMEDIATE_ACTION_PLAN.md",
    "NEXT_STEPS_NOW.md",
    "QUICK_FIX_GUIDE.md",
    "QUICK_START.md",
    "QUICK_SWITCH.md",
    "READY_TO_DEPLOY.md",
    "READY_TO_UPDATE.md",
    "REQUEST_DEPLOY_SCRIPT.md",
    "RESUME_NEXT_TIME.md",
    "SOLUTION_FINAL.md",
    "START_HERE.md",
    "STATUS.md",
    "ZAMA_GPT_SOLUTION.md",
    "frontend/start-dev.bat",
    "setup-frontend-env.ps1",
    "GITHUB_UPLOAD_GUIDE.md",
    "cleanup-for-github.ps1"
)

# 删除文件
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ 已删除: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ 清理完成！" -ForegroundColor Green
Write-Host "`n📋 保留的重要文件:" -ForegroundColor Cyan
Write-Host "  - contracts/ (智能合约)"
Write-Host "  - frontend/ (前端应用)"
Write-Host "  - scripts/ (部署脚本)"
Write-Host "  - README.md"
Write-Host "  - TUTORIAL.md"
Write-Host "  - DEPLOYMENT_GUIDE.md"
Write-Host "  - USAGE_GUIDE.md"
Write-Host "  - SUBMISSION_GUIDE.md"
Write-Host "  - ZAMA_PROJECT_LESSONS_LEARNED.md"
Write-Host "  - QUICK_REFERENCE.md"
Write-Host "  - GATEWAY_AUTO_FALLBACK_UPDATE.md"
Write-Host "  - QUICK_START_GATEWAY_FALLBACK.md"

Write-Host "`n🚀 下一步:" -ForegroundColor Green
Write-Host "1. git init"
Write-Host "2. git add ."
Write-Host "3. git commit -m '🎉 Initial commit: Voting-Fun'"
Write-Host "4. git remote add origin https://github.com/YOUR_USERNAME/voting-fun.git"
Write-Host "5. git push -u origin main"




