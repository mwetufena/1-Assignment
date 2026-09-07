# Library & Resource Management — single-click startup.
# Builds both modules, starts the service in a background process,
# and launches the interactive client in the current terminal.
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$SkipClient
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$bal  = (Get-Command bal -ErrorAction SilentlyContinue)?.Source
if (-not $bal) { $bal = 'C:\Program Files\Ballerina\bin\bal.bat' }

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

if (-not $SkipBuild) {
    Step "Building library_service"
    Push-Location (Join-Path $root 'modules\library_service')
    & $bal build | Out-Null
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw "library_service build failed" }
    Pop-Location

    Step "Building library_client"
    Push-Location (Join-Path $root 'modules\library_client')
    & $bal build | Out-Null
    if ($LASTEXITCODE -ne 0) { Pop-Location; throw "library_client build failed" }
    Pop-Location
}

# Kill any previous instance
Get-Process java -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*library_service*' } | Stop-Process -Force -ErrorAction SilentlyContinue

Step "Starting service on http://localhost:9090"
$jar = Join-Path $root 'modules\library_service\target\bin\library_service.jar'
$svc = Start-Process -FilePath 'java' -ArgumentList @('-jar', $jar) -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'service.out.log') -RedirectStandardError (Join-Path $root 'service.err.log')

# Wait for readiness
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri 'http://localhost:9090/library/health' -UseBasicParsing -TimeoutSec 1
        $ready = $true
        break
    } catch { Start-Sleep -Seconds 1 }
}
if (-not $ready) {
    Write-Warning "Service did not respond in 30s. Check service.err.log"
    $svc | Stop-Process -Force
    exit 1
}
Write-Host "Service is up (PID $($svc.Id))." -ForegroundColor Green

if ($SkipClient) {
    Write-Host "Press Ctrl+C to stop the service. PID = $($svc.Id)" -ForegroundColor Yellow
    Wait-Process -Id $svc.Id
} else {
    Step "Launching interactive client"
    Push-Location (Join-Path $root 'modules\library_client')
    try {
        & $bal run .
    } finally {
        Pop-Location
        Write-Host "Stopping service..." -ForegroundColor Yellow
        $svc | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}
