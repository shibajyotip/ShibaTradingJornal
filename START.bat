@echo off
title TradeLog
cd /d "%~dp0"
SET PATH=C:\Program Files\nodejs;%PATH%

echo.
echo  TradeLog - Intraday Journal
echo  ----------------------------
echo  Folder: %~dp0
echo.

IF NOT EXIST "node_modules" (
    echo  Installing packages (first run only, please wait)...
    "C:\Program Files\nodejs\npm.cmd" install
    echo  Install done. Code: %errorlevel%
    echo.
)

echo  Starting dev server...
echo  Browser opens automatically. Do NOT close this window.
echo  --------------------------------------------------------
echo.

start "" cmd /c "timeout /t 25 /nobreak >nul && start http://localhost:5173"

"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo  ========================================
echo  Server stopped or failed (code: %errorlevel%)
echo  ========================================
echo.
pause
