# PDFly Backend - Quick Start Guide

## ✅ Current Status
**Backend is RUNNING** on port 8080 (Process ID: 59755)

## 🚀 How to Start the Backend

### Option 1: Use the Helper Script (Recommended)
From the project root directory:
```bash
./start-backend.sh
```

### Option 2: Manual Start
```bash
cd pdf-wiz-backend
mvn spring-boot:run
```

## ⚠️ Common Errors & Solutions

### Error: "No plugin found for prefix 'spring-boot'"
**Cause:** You're in the wrong directory
**Solution:** Run from `pdf-wiz-backend` folder or use `./run_backend.sh`

### Error: "Port 8080 was already in use"
**Cause:** Backend is already running
**Solution:** 
1. Check if it's running: `lsof -i :8080`
2. Kill the process: `kill -9 <PID>`
3. Restart using the helper script

### Error: "Connection refused" to PostgreSQL
**Cause:** Remote database is unreachable
**Solution:** The app is now configured to use H2 database (no external dependencies needed)

## 🔑 Default Admin Credentials
- **Email:** `admin@pdfly.io`
- **Password:** `pdfly_admin_pass`

## 📝 Notes
- Database: H2 in-memory (data resets on restart)
- All generated passwords are logged to console for debugging
- Frontend must be on `http://localhost:3000`

## 🆘 Need Help?
Check the log file: `pdf-wiz-backend/startup_auto.log`
