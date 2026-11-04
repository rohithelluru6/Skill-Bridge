# Skill Bridge PowerShell Startup Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Skill Bridge Full-Stack Web Application" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Swagger Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Student: student@skillbridge.edu / password123"
Write-Host "  Admin:   admin@skillbridge.edu   / admin123"
Write-Host ""

Set-Location -Path "$PSScriptRoot\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
