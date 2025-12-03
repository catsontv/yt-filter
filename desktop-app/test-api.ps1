# YouTube Monitor API Test Script
# Run this in PowerShell to test all API endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "YouTube Monitor API Test Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[Test 1] Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
    Write-Host "✓ API is running" -ForegroundColor Green
    Write-Host "  Version: $($health.version)" -ForegroundColor Gray
    Write-Host "  Status: $($health.status)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to connect to API" -ForegroundColor Red
    Write-Host "  Make sure the desktop app is running!`n" -ForegroundColor Red
    exit
}

# Test 2: Register Device
Write-Host "[Test 2] Registering device..." -ForegroundColor Yellow
try {
    $deviceId = "test-device-" + (Get-Random -Maximum 9999)
    $body = @{
        device_id = $deviceId
        device_name = "Test Chrome Browser (PowerShell)"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/register" -Method POST -Body $body -ContentType "application/json"
    $apiKey = $registerResponse.api_key
    
    Write-Host "✓ Device registered" -ForegroundColor Green
    Write-Host "  Device ID: $deviceId" -ForegroundColor Gray
    Write-Host "  API Key: $apiKey`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
    exit
}

# Test 3: Heartbeat
Write-Host "[Test 3] Sending heartbeat..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-API-Key" = $apiKey
    }
    
    $heartbeat = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/heartbeat/$deviceId" -Method GET -Headers $headers
    Write-Host "✓ Heartbeat sent" -ForegroundColor Green
    Write-Host "  Timestamp: $($heartbeat.timestamp)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Heartbeat failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Submit Watch History
Write-Host "[Test 4] Submitting watch history..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-API-Key" = $apiKey
    }
    
    $videos = @(
        @{
            video_id = "dQw4w9WgXcQ"
            title = "Rick Astley - Never Gonna Give You Up (Official Video)"
            channel_name = "Rick Astley"
            channel_id = "UCuAXFkgsw1L7xaCfnd5JJOw"
            thumbnail_url = "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
            video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            watched_at = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            duration = 213
        },
        @{
            video_id = "9bZkp7q19f0"
            title = "PSY - GANGNAM STYLE (강남스타일) M/V"
            channel_name = "officialpsy"
            channel_id = "UCrDkAvwZum-UTjHmzDI2iIw"
            thumbnail_url = "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg"
            video_url = "https://www.youtube.com/watch?v=9bZkp7q19f0"
            watched_at = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            duration = 253
        },
        @{
            video_id = "kJQP7kiw5Fk"
            title = "Luis Fonsi - Despacito ft. Daddy Yankee"
            channel_name = "Luis Fonsi"
            channel_id = "UC947o2SkVfDoFgNYRldYxZw"
            thumbnail_url = "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg"
            video_url = "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
            watched_at = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            duration = 281
        }
    )
    
    $body = @{
        videos = $videos
    } | ConvertTo-Json -Depth 10
    
    $watchHistory = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/watch-history" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✓ Watch history submitted" -ForegroundColor Green
    Write-Host "  Videos saved: $($watchHistory.count)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Watch history submission failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 5: Get Blocks
Write-Host "[Test 5] Fetching blocks..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-API-Key" = $apiKey
    }
    
    $blocks = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/blocks/$deviceId" -Method GET -Headers $headers
    Write-Host "✓ Blocks fetched" -ForegroundColor Green
    Write-Host "  Total blocks: $($blocks.count)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch blocks" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNow check your Desktop App:" -ForegroundColor White
Write-Host "  1. Go to Dashboard - should show 1 device" -ForegroundColor Gray
Write-Host "  2. Go to Watch History - should show 3 videos with thumbnails" -ForegroundColor Gray
Write-Host "  3. Go to Devices - should show 'Test Chrome Browser (PowerShell)'" -ForegroundColor Gray
Write-Host "`nPress any key to open the database folder..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Open database folder
Start-Process "explorer.exe" "`$env:APPDATA\youtube-monitor"
