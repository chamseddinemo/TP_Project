@echo off
chcp 65001 >nul
echo ========================================
echo    DEMARRAGE ERP-TP (Sans Admin)
echo ========================================
echo.

REM Vérifier MongoDB (sans essayer de le démarrer)
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
        echo Demarrage annule.
        pause
        exit /b 1
    )
)
echo.

REM Verifier et creer le fichier .env
echo [2/4] Verification de la configuration...
cd backend
if not exist ".env" (
    echo [INFO] Creation du fichier .env...
    node create-env.js
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Impossible de creer le fichier .env
        pause
        exit /b 1
    )
) else (
    echo [OK] Fichier .env existe
)
cd ..
echo.

REM Verifier la base de donnees
echo [3/4] Verification de la base de donnees...
cd backend
node setup-database.js >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Initialisation de la base de donnees...
    node seedAll.js
    if %ERRORLEVEL% NEQ 0 (
        echo [AVERTISSEMENT] Erreur lors de l'initialisation
        echo Vous pouvez reessayer plus tard avec: cd backend ^&^& node seedAll.js
    )
)
cd ..
echo.

REM Demarrer l'application
echo [4/4] Demarrage de l'application...
echo.
echo ========================================
echo    APPLICATION EN COURS
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Compte de test:
echo   Email: admin@tp.com
echo   Mot de passe: admin123
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.
echo ========================================
echo.

npm run dev



