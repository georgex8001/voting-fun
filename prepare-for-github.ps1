# 🧹 GitHub 上传前项目清理脚本
# 清理所有临时文件、日志和调试文件，保留核心项目文件

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🧹 Preparing Project for GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 要删除的临时文档和日志文件
$filesToDelete = @(
    # 会话和调试日志
    "update_debug_log.md",
    "self_check_log.md",
    "PROJECT_HISTORY.md",
    "CURRENT_SESSION_SUMMARY.md",
    "CURRENT_STATUS_SUMMARY.md",
    
    # 临时指南文档
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
    "UPLOAD_TO_GITHUB.md",
    "NETLIFY_ENV_SETUP.md",
    
    # 临时脚本
    "frontend/start-dev.bat",
    "setup-frontend-env.ps1",
    "cleanup-for-github.ps1",
    "deploy-netlify.ps1",
    "prepare-for-github.ps1",
    "upload-to-github.ps1"
)

Write-Host "🗑️  Deleting temporary files..." -ForegroundColor Yellow
Write-Host ""

$deletedCount = 0
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Gray
        $deletedCount++
    }
}

Write-Host ""
Write-Host "✨ Cleanup completed! Deleted $deletedCount files." -ForegroundColor Green
Write-Host ""

# 显示保留的重要文件
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📋 Files Kept in Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📂 Core Directories:" -ForegroundColor Yellow
Write-Host "  ✅ contracts/          - Smart contracts" -ForegroundColor White
Write-Host "  ✅ frontend/           - React frontend app" -ForegroundColor White
Write-Host "  ✅ scripts/            - Deployment scripts" -ForegroundColor White
Write-Host ""

Write-Host "📄 Documentation:" -ForegroundColor Yellow
Write-Host "  ✅ README.md                          - Project overview" -ForegroundColor White
Write-Host "  ✅ TUTORIAL.md                        - FHEVM tutorial" -ForegroundColor White
Write-Host "  ✅ DEPLOYMENT_GUIDE.md                - Deployment guide" -ForegroundColor White
Write-Host "  ✅ USAGE_GUIDE.md                     - Usage instructions" -ForegroundColor White
Write-Host "  ✅ SUBMISSION_GUIDE.md                - Submission guide" -ForegroundColor White
Write-Host "  ✅ ZAMA_PROJECT_LESSONS_LEARNED.md   - Lessons learned" -ForegroundColor White
Write-Host "  ✅ QUICK_REFERENCE.md                 - Quick reference" -ForegroundColor White
Write-Host "  ✅ GATEWAY_AUTO_FALLBACK_UPDATE.md   - Gateway fallback" -ForegroundColor White
Write-Host "  ✅ QUICK_START_GATEWAY_FALLBACK.md   - Quick start" -ForegroundColor White
Write-Host "  ✅ NETLIFY_DEPLOY_GUIDE.md           - Netlify guide" -ForegroundColor White
Write-Host ""

Write-Host "⚙️  Configuration:" -ForegroundColor Yellow
Write-Host "  ✅ package.json" -ForegroundColor White
Write-Host "  ✅ hardhat.config.js" -ForegroundColor White
Write-Host "  ✅ netlify.toml" -ForegroundColor White
Write-Host "  ✅ .gitignore" -ForegroundColor White
Write-Host "  ✅ LICENSE" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Project Ready for GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run: .\upload-to-github.ps1" -ForegroundColor White
Write-Host "  2. Enter your GitHub token when prompted" -ForegroundColor White
Write-Host "  3. Wait for upload to complete" -ForegroundColor White
Write-Host ""

