@echo off
echo ========================================
echo DESPLEGANDO FIXES PARA COMMUNITY API
echo ========================================

echo.
echo 1. Agregando archivos modificados...
git add netlify/functions/community-vote.js
git add netlify/functions/community-answers.js
git add netlify/functions/community-questions.js
git add netlify/functions/community-debug.js
git add netlify.toml
git add server.js

echo.
echo 2. Creando commit...
git commit -m "Fix community API: Use specific functions instead of generic

- Updated netlify.toml to use specific functions:
  * community-vote.js for voting endpoints
  * community-answers.js for answer endpoints
  * community-questions.js for question endpoints
- Fixed Supabase environment variables
- Added normalized vote types support
- Added community-debug endpoint for troubleshooting

This fixes the lambda response error by using proven working functions."

echo.
echo 3. Haciendo push al repositorio...
git push

echo.
echo ========================================
echo DEPLOYMENT COMPLETADO
echo ========================================
echo.
echo Proximos pasos:
echo 1. Ir a Netlify Dashboard
echo 2. Verificar que las variables de entorno esten configuradas:
echo    - SUPABASE_URL
echo    - SUPABASE_SERVICE_KEY
echo 3. Esperar que termine el despliegue automatico
echo 4. Probar los endpoints:
echo    - https://aprendeyaplica.ai/api/community/debug
echo    - Voting en la interfaz de community
echo.
pause