@echo off
chcp 65001 > nul
cls
echo ==============================================================================
echo   MENJALANKAN SUITE PENGUJIAN OTOMATIS FITUR LAHANSENSE
echo ==============================================================================
echo.

if exist "backend\.venv\Scripts\python.exe" (
    backend\.venv\Scripts\python.exe test_all_features.py
) else (
    python test_all_features.py
)

pause

