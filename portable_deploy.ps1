# AgriSense Portable Deploy Script
# Automatically downloads Git and pushes code without system installation.

$ErrorActionPreference = "Stop"
$WorkingDir = "e:\NERULA_AGRI-main\NERULA_AGRI-main"
$MinGitUrl = "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/MinGit-2.43.0-64-bit.zip"
$MinGitZip = "$WorkingDir\mingit.zip"
$MinGitDir = "$WorkingDir\mingit"
$GitExe = "$MinGitDir\cmd\git.exe"

Set-Location $WorkingDir

# 1. Check/Download MinGit
if (-not (Test-Path $GitExe)) {
    Write-Host "[1/5] Portable Git not found. Downloading..." -ForegroundColor Cyan
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $MinGitUrl -OutFile $MinGitZip
    } catch {
        Write-Error "Failed to download Git. Check internet connection."
        exit 1
    }

    Write-Host "Extracting Git..." -ForegroundColor Cyan
    Expand-Archive -Path $MinGitZip -DestinationPath $MinGitDir -Force
    Remove-Item $MinGitZip -Force
} else {
    Write-Host "[1/5] Portable Git found." -ForegroundColor Cyan
}

# 2. Config & Init (Using local git)
Write-Host "[2/5] Initializing Repository..." -ForegroundColor Cyan

# Fix SSL Cert Path (Critical for Portable Git)
$CertPath = "$MinGitDir\mingw64\ssl\certs\ca-bundle.crt"
if (-not (Test-Path $CertPath)) {
    # Fallback path for some mingit versions
    $CertPath = "$MinGitDir\usr\ssl\certs\ca-bundle.crt" 
}
& $GitExe config http.sslCAInfo "$CertPath"

& $GitExe init
& $GitExe config user.email "agrisense@bot.com"
& $GitExe config user.name "AgriSense Bot"
& $GitExe add .
& $GitExe commit -m "AgriSense Final Update: All Features"

# 3. Remote Setup
Write-Host "[3/5] Configuring Remote..." -ForegroundColor Cyan
& $GitExe branch -M main
try { & $GitExe remote remove origin 2>$null } catch {}
& $GitExe remote add origin "https://github.com/8925331076surendhar/NERULA_AGRI.git"

# 4. Push
Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "NOTE: A login window should appear on your screen. Please Login." -ForegroundColor Yellow
try {
    # Force authentication prompt
    & $GitExe push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] Code successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        throw "Git Push failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Error "Push failed. You might need to authenticate or check permissions."
    exit 1
}

Write-Host "`nDone."
