@echo off
chcp 65001 >nul
echo ========================================
echo    TEST COMPLET DE TOUTES LES FONCTIONNALITES
echo ========================================
echo.

REM Vérifier que le backend est démarré
echo [1/4] Verification du backend...
curl -s http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Le backend n'est pas accessible sur http://localhost:5000
    echo.
    echo Veuillez demarrer le backend dans un autre terminal:
    echo   cd backend
    echo   npm run dev
    echo.
    echo Ou lancez: .\DEMARRER_SANS_ADMIN.bat
    echo.
    pause
    exit /b 1
)
echo [OK] Backend accessible
echo.

REM Vérifier MongoDB
echo [2/4] Verification de MongoDB...
cd backend
node setup-database.js >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] MongoDB n'est pas accessible
    echo.
    echo Demarrez MongoDB:
    echo   net start MongoDB (en admin)
    echo   ou
    echo   mongod --dbpath C:\data\db
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB accessible
cd ..
echo.

REM Installer axios si nécessaire
echo [3/4] Verification des dependances...
cd backend
if not exist "node_modules\axios" (
    echo Installation de axios pour les tests...
    npm install axios
)
cd ..
echo.

REM Exécuter les tests
echo [4/4] Execution des tests complets...
echo.
echo ========================================
echo    TESTS EN COURS
echo ========================================
echo.
echo Les tests vont verifier:
echo   - Connexion MongoDB
echo   - Serveur backend
echo   - Authentification (signup, login)
echo   - Tous les modeles
echo   - Toutes les routes API
echo   - Securite (routes protegees)
echo   - Performance
echo.
echo Cela peut prendre quelques instants...
echo.

cd backend
node test-all-features.js
set TEST_RESULT=%ERRORLEVEL%
cd ..

echo.
echo ========================================
if %TEST_RESULT% EQU 0 (
    echo    TOUS LES TESTS SONT REUSSIS!
    echo ========================================
    echo.
    echo ✅ Le systeme fonctionne a 100%%
    echo.
) else (
    echo    CERTAINS TESTS ONT ECHOUE
    echo ========================================
    echo.
    echo ⚠️  Verifiez les erreurs ci-dessus
    echo.
)

pause



