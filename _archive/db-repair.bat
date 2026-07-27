@echo off
:: Devyajnam Database Diagnostic & Setup Utility
:: OS: Windows (PowerShell/CMD)

echo ========================================================
echo 🌼 Devyajnam Database Setup & Repair Utility
echo ========================================================
echo.

:: 1. Check PostgreSQL Installation
echo [Step 1] Checking PostgreSQL Installation...
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL client 'psql' was not found in System PATH.
    echo.
    echo Please install PostgreSQL using the official installer:
    echo https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
    echo.
) else (
    echo [SUCCESS] PostgreSQL is installed!
    for /f "tokens=*" %%i in ('psql --version') do echo %%i
)
echo.

:: 2. Verify and Start PostgreSQL Windows Service
echo [Step 2] Verifying PostgreSQL Windows Service...
sc query state= all | findstr /i "postgresql" > nul
if %errorlevel% neq 0 (
    echo [INFO] PostgreSQL service not registered locally.
    echo (We are using Supabase Cloud Postgres, so local service is optional.)
) else (
    echo [INFO] Found local PostgreSQL service. Attempting to start...
    :: Search for the exact service name
    for /f "tokens=1,2 delims=:" %%a in ('sc query state^= all ^| findstr /i "postgresql"') do (
        echo Starting service: %%b
        net start %%b >nul 2>&1
    )
    echo [SUCCESS] Service start command dispatched.
)
echo.

:: 3. Setup and Verify .env
echo [Step 3] Verifying .env Configuration...
if not exist ".env" (
    echo [ERROR] .env file is missing! Creating a new one...
    (
        echo DATABASE_URL="postgresql://postgres.ehiqtlofblrddauixeuz:Divya%%40Yagyam%%40123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"
        echo DIRECT_URL="postgresql://postgres.ehiqtlofblrddauixeuz:Divya%%40Yagyam%%40123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
        echo ADMIN_EMAIL="admin@devyajnam.com"
        echo ADMIN_PASSWORD="Admin@12345"
    ) > .env
    echo [SUCCESS] Created new .env file with URL-encoded Supabase credentials.
) else (
    echo [SUCCESS] .env file is present.
)
echo.

:: 4. Force Reload Next.js Cache & Sync Schema
echo [Step 4] Synchronizing Prisma Schema with Supabase Database...
echo Cleaning local Next.js build cache...
if exist ".next" rmdir /s /q .next

echo Running Prisma Generate...
call npx prisma generate

echo Running Prisma DB Push...
call npx prisma db push

echo.
echo ========================================================
echo [FINISH] Repair process finished!
echo.
echo IMPORTANT: If your Next.js Dev Server was already running, 
echo please close that terminal window (Press Ctrl+C) and run:
echo.
echo     npm run dev
echo ========================================================
pause
