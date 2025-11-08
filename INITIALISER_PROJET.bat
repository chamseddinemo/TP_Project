@echo off
chcp 65001 >nul
echo ========================================
echo    INITIALISATION DU PROJET ERP-TP
echo ========================================
echo.

REM Vérifier Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe
    echo Veuillez installer Node.js depuis https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Verification de Node.js...
node --version
echo.

REM Vérifier MongoDB
echo [2/5] Verification de MongoDB...
where mongod >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AVERTISSEMENT] MongoDB n'est pas detecte
    echo.
    echo Options:
    echo   1. Installer MongoDB localement
    echo   2. Utiliser MongoDB Atlas (cloud)
    echo.
    echo Voir DEMARRAGE_RAPIDE.md pour plus d'infos
    echo.
) else (
    echo [OK] MongoDB detecte
    echo [INFO] Demarrage de MongoDB...
    net start MongoDB >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] MongoDB demarre
    ) else (
        echo [AVERTISSEMENT] Impossible de demarrer le service MongoDB
        echo Vous devrez le demarrer manuellement
    )
)
echo.

REM Installer les dépendances
echo [3/5] Installation des dependances...
echo.
echo Installation des dependances racine...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Echec de l'installation des dependances racine
    pause
    exit /b 1
)

echo.
echo Installation des dependances backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Echec de l'installation des dependances backend
    pause
    exit /b 1
)
cd ..

echo.
echo Installation des dependances frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Echec de l'installation des dependances frontend
    pause
    exit /b 1
)
cd ..
echo [OK] Toutes les dependances sont installees
echo.

REM Créer le fichier .env s'il n'existe pas
echo [4/6] Configuration de l'environnement...
cd backend
if not exist ".env" (
    echo [INFO] Creation du fichier .env...
    node create-env.js
    if %ERRORLEVEL% NEQ 0 (
        echo [AVERTISSEMENT] Impossible de creer le fichier .env automatiquement
        echo Veuillez le creer manuellement en copiant .env.example vers .env
    )
) else (
    echo [OK] Fichier .env existe deja
)
cd ..

REM Vérifier la connexion MongoDB et créer les utilisateurs
echo [5/6] Initialisation de la base de donnees...
cd backend
echo [INFO] Verification de la connexion MongoDB...
node setup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVERTISSEMENT] Impossible de se connecter a MongoDB
    echo Veuillez demarrer MongoDB avant de continuer
    echo.
    echo Executez: start-mongodb.bat
    echo.
    pause
    cd ..
    exit /b 1
)

echo.
echo [INFO] Creation des utilisateurs de test...
node seedAll.js
if %ERRORLEVEL% NEQ 0 (
    echo [AVERTISSEMENT] Erreur lors de la creation des utilisateurs
    echo Vous pouvez reessayer plus tard avec: cd backend ^&^& node seedAll.js
)
cd ..
echo.

REM Résumé
echo [6/6] Resume
echo ========================================
echo.
echo [OK] Installation terminee!
echo.
echo PROCHAINES ETAPES:
echo.
echo 1. Demarrer l'application:
echo    npm run dev
echo.
echo 2. Ou via VS Code:
echo    - Appuyez sur F5
echo    - Selectionnez "Lancer Backend + Frontend"
echo.
echo 3. Ouvrez votre navigateur:
echo    http://localhost:5173
echo.
echo 4. Connectez-vous avec:
echo    Email: admin@tp.com
echo    Mot de passe: admin123
echo.
echo ========================================
echo.
pause

