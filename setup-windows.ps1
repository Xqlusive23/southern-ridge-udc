# Southern Ridge UDC — install and run on Windows PowerShell
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed or not on PATH."
    Write-Host "Install the LTS build from https://nodejs.org then run this script again."
    exit 1
}

Write-Host "Node $(node -v)"
if (-not (Test-Path -LiteralPath "node_modules")) {
    Write-Host "Installing packages..."
    npm install
}

Write-Host "Starting http://127.0.0.1:43147"
Start-Process "http://127.0.0.1:43147"
npm run dev
