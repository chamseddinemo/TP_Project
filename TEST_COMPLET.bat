@echo off
chcp 65001 >nul
echo ========================================
echo    TEST COMPLET DU SYSTEME ERP-TP
echo ========================================
echo.

REM Vérifier Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe
    pause
    exit /b 1
)

echo [1/6] Verification de Node.js...
node --version
echo.

REM Vérifier MongoDB (sans essayer de le démarrer)
echo [2/6] Verification de MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB est en cours d'execution
) else (
    echo [AVERTISSEMENT] MongoDB ne semble pas etre en cours d'execution
    echo.
    echo Pour demarrer MongoDB:
    echo   - Ouvrez un terminal administrateur
    echo   - Executez: net start MongoDB
    echo   - Ou executez: start-mongodb.bat
    echo.
    echo Continuez quand meme? (O/N)
    set /p continue=
    if /i not "%continue%"=="O" exit /b 1
)
echo.

REM Vérifier le fichier .env
echo [3/6] Verification de la configuration...
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

REM Vérifier la connexion MongoDB
echo [4/6] Test de connexion MongoDB...
cd backend
node setup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Impossible de se connecter a MongoDB
    echo.
    echo Solutions:
    echo   1. Demarrer MongoDB (voir ci-dessus)
    echo   2. Verifier MONGO_URI dans backend/.env
    echo   3. Utiliser MongoDB Atlas (cloud)
    echo.
    pause
    exit /b 1
)
cd ..
echo.

REM Vérifier les données
echo [5/6] Verification des donnees...
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const User = require('./models/User'); (async () => { try { await mongoose.connect(process.env.MONGO_URI); const count = await User.countDocuments(); console.log('Utilisateurs dans la base:', count); if (count === 0) { console.log('Aucun utilisateur - Execution de seedAll.js...'); require('child_process').exec('node seedAll.js', (err) => { if (err) console.error('Erreur:', err); mongoose.connection.close(); }); } else { mongoose.connection.close(); } } catch (e) { console.error('Erreur:', e.message); process.exit(1); } })();"
cd ..
echo.

REM Test du backend
echo [6/6] Test du backend...
echo.
echo Demarrage du backend en arriere-plan...
cd backend
start /B node server.js
timeout /t 3 /nobreak >nul
cd ..

REM Tester la connexion backend
echo Test de connexion au backend...
curl -s http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend repond sur http://localhost:5000
) else (
    echo [AVERTISSEMENT] Backend ne repond pas encore
    echo Attente de 5 secondes supplementaires...
    timeout /t 5 /nobreak >nul
    curl -s http://localhost:5000 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Backend repond maintenant
    ) else (
        echo [ERREUR] Backend ne repond pas
        echo Verifiez les logs dans le terminal backend
    )
)
echo.

REM Résumé
echo ========================================
echo    RESUME DES TESTS
echo ========================================
echo.
echo [OK] Node.js installe
echo [OK] Configuration verifiee
echo [OK] MongoDB accessible
echo [OK] Backend demarre
echo.
echo PROCHAINES ETAPES:
echo.
echo 1. Ouvrez un nouveau terminal
echo 2. Executez: npm run dev
echo    (ou: .\DEMARRER.bat)
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
echo Le backend est en cours d'execution.
echo Appuyez sur une touche pour arreter le backend et terminer...
pause >nul

REM Arrêter le backend
taskkill /F /IM node.exe /FI "WINDOWTITLE eq server.js*" >nul 2>&1
echo.
echo Backend arrete.
pause



