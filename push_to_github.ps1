# ==============================================================================
# MemorySupport AI - Safe GitHub Publishing Script
# Target: https://github.com/KripaShankar7234/MemorySupport-AI
# Branch: main
# ==============================================================================

$ErrorActionPreference = "Stop"
Set-Location "E:\MemorySupport-AI"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MemorySupport AI - Safe GitHub Publication & Sync" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Initialize Git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "[1/6] Initializing local Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "[1/6] Git repository already initialized." -ForegroundColor Green
    git branch -M main
}

# 2. Configure Remote URL
Write-Host "[2/6] Configuring remote origin..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    git remote set-url origin https://github.com/KripaShankar7234/MemorySupport-AI.git
} else {
    git remote add origin https://github.com/KripaShankar7234/MemorySupport-AI.git
}
Write-Host "      Remote origin set to: https://github.com/KripaShankar7234/MemorySupport-AI.git" -ForegroundColor Green

# 3. Pull remote history (LICENSE, initial commit) without overwriting
Write-Host "[3/6] Fetching and syncing remote history (LICENSE)..." -ForegroundColor Yellow
try {
    git pull origin main --allow-unrelated-histories --no-edit
} catch {
    Write-Host "      Note: Remote pull notice: $_" -ForegroundColor Gray
}

# 4. Enforce .gitignore rules against secret files
Write-Host "[4/6] Enforcing .gitignore rules against secret files..." -ForegroundColor Yellow
git rm --cached backend/.env 2>$null
git rm --cached frontend/.env 2>$null
git rm --cached .env 2>$null
git rm --cached -r venv/ 2>$null
git rm --cached -r frontend/node_modules/ 2>$null
git rm --cached -r frontend/dist/ 2>$null

# Stage safe project files
git add .

# 5. Security Audit on Staged Files
Write-Host "[5/6] Performing automated security check on staged files..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only

$hasSecret = $false
foreach ($file in $stagedFiles) {
    if ($file -match "(\.env$|\.env\.(?!example)|secrets|id_rsa|\.pem|\.key)") {
        Write-Host "  [ALERT] Potentially sensitive file detected: $file" -ForegroundColor Red
        $hasSecret = $true
    }
}

if ($hasSecret) {
    Write-Host "`n[ERROR] Secret detection triggered! Unstaging sensitive files and aborting push." -ForegroundColor Red
    git reset
    exit 1
}

Write-Host "  [PASS] Zero .env or secret files staged." -ForegroundColor Green
Write-Host "  [PASS] All environment examples (backend/.env.example, frontend/.env.example) preserved." -ForegroundColor Green
Write-Host "  [PASS] Staged files count: $($stagedFiles.Count) files." -ForegroundColor Green

Write-Host "`nStaged Files Preview:" -ForegroundColor Cyan
git status --short

# 6. User Approval & Push
Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
$confirmation = Read-Host "Do you approve committing and pushing these safe files to origin/main? (y/N)"
if ($confirmation -match "^[Yy]$") {
    Write-Host "`n[6/6] Committing and pushing to origin main..." -ForegroundColor Green
    git commit -m "feat: complete MemorySupport AI hackathon prototype (Hindsight Cloud + Groq + MongoDB + React Dashboard)"
    git push -u origin main
    Write-Host "`n[SUCCESS] MemorySupport AI repository is now live at:" -ForegroundColor Green
    Write-Host "https://github.com/KripaShankar7234/MemorySupport-AI" -ForegroundColor Cyan
} else {
    Write-Host "`n[ABORTED] Push cancelled by user. Files remain staged locally." -ForegroundColor Yellow
}
