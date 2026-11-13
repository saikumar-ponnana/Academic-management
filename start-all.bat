@echo off
echo ====================================================
echo Launching Gayatri Vidya Parishad — ELC Center System
echo ====================================================
start "ELC Backend (Port 8000)" cmd /k "start-backend.bat"
start "ELC Frontend (Port 5173)" cmd /k "start-frontend.bat"
echo Both servers are launching in separate windows!
echo Open your browser at: http://localhost:5173
pause

