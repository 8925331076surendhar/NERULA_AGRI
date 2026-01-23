# PORTABLE MISSION PLANNER SETUP
# Run this file when you move this project to a New Laptop!

Write-Host "🌱 AgriSense Portable Setup" -ForegroundColor Green
Write-Host "---------------------------"

# 1. Inspect Local Folder
$localMP = Join-Path $PSScriptRoot "software\MissionPlanner\MissionPlanner.exe"

if (-not (Test-Path $localMP)) {
    Write-Host "❌ Error: Could not find local Mission Planner files." -ForegroundColor Red
    Write-Host "Expected at: $localMP"
    Pause
    Exit
}

Write-Host "✅ Found Portable Mission Planner"

# 2. Register Protocol for THIS specific folder
$regKey = "HKCU:\Software\Classes\missionplanner"
$cmdKey = "$regKey\shell\open\command"

try {
    if (-not (Test-Path $regKey)) { New-Item -Path $regKey -Force | Out-Null }
    if (-not (Test-Path $cmdKey)) { New-Item -Path $cmdKey -Force | Out-Null }

    Set-ItemProperty -Path $regKey -Name "(default)" -Value "URL:MissionPlanner Protocol"
    Set-ItemProperty -Path $regKey -Name "URL Protocol" -Value ""

    $cmdVal = "`"$localMP`" `"%1`""
    Set-ItemProperty -Path $cmdKey -Name "(default)" -Value $cmdVal
    
    Write-Host "✅ Registered successfully!" -ForegroundColor Green
    Write-Host "   Target: $localMP"
} catch {
    Write-Host "⚠️  Registry update failed. Try running as Admin." -ForegroundColor Yellow
}

Write-Host "`nReady! You can now use the dashboard."
Write-Host "Press any key to close..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
