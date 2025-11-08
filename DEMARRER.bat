@echo off
chcp 65001 >nul
echo ========================================
echo    DEMARRAGE ERP-TP
echo ========================================
echo.

REM Verifier MongoDB (sans essayer de le démarrer - évite erreur accès refusé)
echo [1/4] Verification de MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB est en cours d'execution
) else (
    echo [ATTENTION] MongoDB ne semble pas etre demarre
    echo.
    echo Pour demarrer MongoDB:
    echo   1. Ouvrez un terminal en tant qu'administrateur
    echo   2. Executez: net start MongoDB
    echo   3. Ou executez: start-mongodb.bat (en admin)
    echo.
    echo Ou utilisez MongoDB Atlas (cloud) - voir CONFIGURATION.md
    echo.
    echo Voulez-vous continuer quand meme? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" (
        echo.
        echo Demarrage annule. Utilisez DEMARRER_SANS_ADMIN.bat pour plus d'options.
        pause
        exit /b 1
    )
)

REM Verifier et creer le fichier .env
echo [2/4] Verification de la configuration...
cd backend
if not exist ".env" (
    echo Creation du fichier .env...
    node create-env.js
)
cd ..

REM Verifier la base de donnees
echo [3/4] Verification de la base de donnees...
cd backend
node setup-database.js >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Initialisation de la base de donnees...
    node seedAll.js
)
cd ..

REM Demarrer l'application
echo [4/4] Demarrage de l'application...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Compte: admin@tp.com / admin123
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

npm run dev

