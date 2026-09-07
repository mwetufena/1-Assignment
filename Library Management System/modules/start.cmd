@echo off
REM -----------------------------------------------------------------
REM Library & Resource Management — single-click startup for the IDE.
REM Builds both modules, then launches the service in a new window
REM and the interactive client in a second window.
REM -----------------------------------------------------------------
setlocal
set "ROOT=%~dp0"
set "BAL=bal"
where %BAL% >nul 2>nul
if errorlevel 1 (
    set "BAL=C:\Program Files\Ballerina\bin\bal.bat"
)

echo.
echo [1/3] Building library_service...
pushd "%ROOT%modules\library_service"
call "%BAL%" build
if errorlevel 1 ( popd & echo Build failed. & exit /b 1 )
popd

echo.
echo [2/3] Building library_client...
pushd "%ROOT%modules\library_client"
call "%BAL%" build
if errorlevel 1 ( popd & echo Build failed. & exit /b 1 )
popd

echo.
echo [3/3] Starting service in a new window on http://localhost:9090 ...
start "library_service" cmd /k "java -jar ""%ROOT%modules\library_service\target\bin\library_service.jar"""

echo Waiting for service to be ready...
powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { try { $null = Invoke-WebRequest -Uri 'http://localhost:9090/library/health' -UseBasicParsing -TimeoutSec 1; Write-Host 'Service is up.'; exit 0 } catch { Start-Sleep -Seconds 1 } }; Write-Host 'Service did not respond in 30s.'"

echo.
echo Starting interactive client in a new window...
start "library_client" cmd /k "cd /d ""%ROOT%modules\library_client"" && ""%BAL%"" run ."

endlocal
