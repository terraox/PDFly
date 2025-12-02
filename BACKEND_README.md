# 🚀 PDFly Backend - Complete Guide

## ⚡ Quick Start (3 Simple Commands)

### Start the Backend:
```bash
./start-backend.sh
```

### Stop the Backend:
```bash
./stop-backend.sh
```

### Check if Running:
```bash
lsof -i :8080
```

---

## 🔑 Default Login Credentials
- **Email:** `admin@pdfly.io`
- **Password:** `pdfly_admin_pass`

---

## 📋 What Each Script Does

### `start-backend.sh`
- ✅ Checks if port 8080 is already in use
- ✅ Automatically navigates to the correct directory
- ✅ Starts the backend server
- ❌ **Prevents** starting duplicate instances

### `stop-backend.sh`
- 🛑 Finds and kills any backend process on port 8080
- ✅ Confirms successful termination

---

## ⚠️ If You See "BUILD FAILURE"

**This means the backend is already running!**

**Solution:**
1. Stop the existing instance: `./stop-backend.sh`
2. Start a fresh instance: `./start-backend.sh`

---

## 🗄️ Database Information
- **Type:** H2 In-Memory Database
- **Console:** http://localhost:8080/h2-console
- **JDBC URL:** `jdbc:h2:mem:pdflydb`
- **Username:** `sa`
- **Password:** `password`

**Note:** All data is lost when you stop the backend.

---

## 📝 Logs Location
`pdf-wiz-backend/startup_auto.log`

---

## 🆘 Troubleshooting

### "Port 8080 already in use"
```bash
./stop-backend.sh
./start-backend.sh
```

### "No plugin found for prefix 'spring-boot'"
**Don't run `mvn` manually.** Use `./start-backend.sh` instead.

### Backend won't start
1. Check Java version: `java -version` (need 17+)
2. Kill any zombie processes: `./stop-backend.sh`
3. Restart: `./start-backend.sh`

---

## ✅ That's It!

You should **never** need to run `mvn spring-boot:run` manually.
Just use the scripts. They handle everything.
