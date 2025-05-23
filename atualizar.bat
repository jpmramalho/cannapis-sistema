@echo off
cd /d "%~dp0"
echo Atualizando repositório...

set /p mensagem=Digite a mensagem de commit: 
git add .
git commit -m "%mensagem%"
git push origin main

echo.
echo ✅ Atualização enviada para o GitHub!
pause
