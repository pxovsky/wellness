param([string]$message)

if (-not $message) {
    Write-Host "Blad: Musisz podac wiadomosc commita!" -ForegroundColor Red
    Write-Host "Uzycie: .\commit.ps1 'Twoja wiadomosc'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git status..." -ForegroundColor Cyan
git status

Write-Host "`nDodawanie plikow..." -ForegroundColor Green
git add .

Write-Host "Commitowanie: $message" -ForegroundColor Green
git commit -m "$message"

Write-Host "Pushowanie na main..." -ForegroundColor Green
git push origin main

Write-Host "GOTOWE! Commit i push zakonczoneL" -ForegroundColor Yellow
