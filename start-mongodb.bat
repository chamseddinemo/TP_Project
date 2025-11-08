@echo off
echo ========================================
echo    DEMARRAGE DE MONGODB
echo ========================================
echo.

REM Vérifier si MongoDB est installé
where mongod >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] MongoDB n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Veuillez installer MongoDB depuis:
    echo https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo [INFO] MongoDB detecte
echo.

REM Vérifier si le dossier de données existe
if not exist "C:\data\db" (
    echo [INFO] Creation du dossier C:\data\db...
    mkdir "C:\data\db"
)

REM Vérifier si MongoDB est déjà en cours d'exécution
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] MongoDB est deja en cours d'execution
    echo.
    echo MongoDB fonctionne deja. Vous pouvez lancer l'application.
    echo.
    pause
    exit /b 0
)

REM Essayer de démarrer le service MongoDB d'abord
echo [INFO] Tentative de demarrage du service MongoDB...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCES] Service MongoDB demarre!
    echo.
    echo MongoDB est maintenant en cours d'execution.
    echo Vous pouvez maintenant lancer l'application.
    echo.
    pause
    exit /b 0
)

REM Si erreur d'accès, proposer une alternative
if %ERRORLEVEL% EQU 5 (
    echo [AVERTISSEMENT] Acces refuse - Privileges administrateur requis
    echo.
    echo Solutions:
    echo   1. Executer ce script en tant qu'administrateur (clic droit - Executer en tant qu'administrateur)
    echo   2. Ou demarrer MongoDB manuellement (voir ci-dessous)
    echo   3. Ou utiliser MongoDB Atlas (cloud)
    echo.
)

REM Si le service ne fonctionne pas, démarrer manuellement
echo [INFO] Le service ne peut pas etre demarre, demarrage manuel...
echo [INFO] Demarrage de MongoDB sur le port 27017...
echo.
echo Appuyez sur Ctrl+C pour arreter MongoDB
echo.

mongod --dbpath C:\data\db

pause

