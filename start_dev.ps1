# Skrypt uruchamiający środowisko deweloperskie (Backend + Frontend)

Write-Host "🚀 Uruchamianie Myniu Lite..." -ForegroundColor Cyan

$root = (Get-Location).Path

if (!(Test-Path "$root\backend") -or !(Test-Path "$root\frontend")) {
    Write-Error "Błąd: Uruchom ten skrypt z głównego katalogu projektu."
    exit
}

# 1. Backend (nowe okno)
Start-Process powershell -WorkingDirectory "$root\backend" -ArgumentList "-NoExit", "-Command", "if (Test-Path .venv) { .\.venv\Scripts\Activate.ps1 }; python app.py"

# 2. Frontend (nowe okno)
Start-Process powershell -WorkingDirectory "$root\frontend" -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Gotowe! Serwery działają w osobnych oknach." -ForegroundColor Yellow