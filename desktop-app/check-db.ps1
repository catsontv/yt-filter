# Database Inspection Script
# Run this to see what's actually in the database

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Database Inspection" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$dbPath = "$env:APPDATA\youtube-monitor\youtube-monitor.db"

if (!(Test-Path $dbPath)) {
    Write-Host "Database file not found at: $dbPath" -ForegroundColor Red
    exit
}

Write-Host "Database found at: $dbPath" -ForegroundColor Green
$size = (Get-Item $dbPath).Length
Write-Host "File size: $size bytes`n" -ForegroundColor Gray

# We'll use the API to query the database through IPC
# Since we can't directly query SQLite from PowerShell easily,
# let's check if we can connect to the API

try {
    Write-Host "Checking API..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
    Write-Host "✓ API is running`n" -ForegroundColor Green
    
    # Try to register a device and see if it persists
    Write-Host "Testing database write..." -ForegroundColor Yellow
    $testId = "db-test-" + (Get-Random -Maximum 999999)
    $body = @{
        device_id = $testId
        device_name = "Database Test Device"
    } | ConvertTo-Json
    
    $reg = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Write test successful" -ForegroundColor Green
    Write-Host "  Device ID: $testId" -ForegroundColor Gray
    Write-Host "  API Key: $($reg.api_key)`n" -ForegroundColor Gray
    
    # Now let's query to see all devices
    Write-Host "Attempting to read all devices..." -ForegroundColor Yellow
    Write-Host "(Note: This requires direct database access)" -ForegroundColor Gray
    Write-Host "Please check the DevTools Console in your app for actual data`n" -ForegroundColor Yellow
    
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Look at your YouTube Monitor app window" -ForegroundColor White
    Write-Host "2. The DevTools console should be open (if not, press F12)" -ForegroundColor White
    Write-Host "3. Look for messages like:" -ForegroundColor White
    Write-Host "   - 'Generating dashboard page...'" -ForegroundColor Gray
    Write-Host "   - 'Dashboard data: { devices: X, videos: Y, blocks: Z }'" -ForegroundColor Gray
    Write-Host "4. If you see 'devices: 0', the IPC query isn't working" -ForegroundColor White
    Write-Host "5. Copy and paste any error messages you see in red`n" -ForegroundColor White
    
    Write-Host "Press any key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    
} catch {
    Write-Host "✗ API not responding" -ForegroundColor Red
    Write-Host "Make sure the desktop app is running!" -ForegroundColor Red
}
