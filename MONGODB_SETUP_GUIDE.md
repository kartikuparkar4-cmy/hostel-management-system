# 🗄️ MongoDB Connection Guide - Step by Step

## Current Status
❌ **MongoDB is NOT connected**  
✅ **App is working** (using fallback JSON file: `.hostel_data.json`)

Your app automatically falls back to a local JSON database when MongoDB isn't available. To connect MongoDB, follow one of these options:

---

## ⭐ OPTION 1: MongoDB Atlas (Cloud - FREE & RECOMMENDED)

### Why Atlas?
- ✅ **FREE forever** (512MB storage)
- ✅ **No installation** needed
- ✅ **Works instantly**
- ✅ **Access from anywhere**
- ✅ **Automatic backups**

### Step-by-Step Setup (5 minutes):

#### 1. **Create Free Account**
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up with Google/Email
- Choose **FREE M0 Cluster** (Shared)

#### 2. **Create Cluster**
- Click "Build a Database"
- Select **M0 FREE** tier
- Choose cloud provider: **AWS** (recommended)
- Region: Choose closest to you (e.g., `us-east-1`)
- Cluster Name: `HostelCluster` (or any name)
- Click "Create Cluster" (takes 3-5 minutes)

#### 3. **Create Database User**
- Go to **Database Access** (left sidebar)
- Click "Add New Database User"
- **Authentication Method**: Password
- **Username**: `hosteluser`
- **Password**: Click "Autogenerate Secure Password" (COPY THIS!)
- **Database User Privileges**: Select "Read and write to any database"
- Click "Add User"

**⚠️ SAVE YOUR PASSWORD!** Example: `xK9mP2nQ4vR8sT1u`

#### 4. **Allow Network Access**
- Go to **Network Access** (left sidebar)
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Or add your current IP
- Click "Confirm"

#### 5. **Get Connection String**
- Go to **Database** (left sidebar)
- Click "Connect" on your cluster
- Choose "Connect your application"
- **Driver**: Node.js
- **Version**: 5.5 or later
- Copy the connection string:
  ```
  mongodb+srv://hosteluser:<password>@hostelcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

#### 6. **Update .env File**
Open `.env` file and replace the MONGO_URI line:

**Before:**
```env
MONGO_URI="mongodb://localhost:27017/hostel"
```

**After:**
```env
MONGO_URI="mongodb+srv://hosteluser:YOUR_PASSWORD_HERE@hostelcluster.xxxxx.mongodb.net/hostel?retryWrites=true&w=majority"
```

**Replace:**
- `YOUR_PASSWORD_HERE` with your actual password (from step 3)
- `hostelcluster.xxxxx` with your actual cluster address

**Example:**
```env
MONGO_URI="mongodb+srv://hosteluser:xK9mP2nQ4vR8sT1u@hostelcluster.abc123.mongodb.net/hostel?retryWrites=true&w=majority"
```

#### 7. **Restart Your Server**
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

#### 8. **Verify Connection**
Look for this message in terminal:
```
[Database] Successfully connected to MongoDB via Mongoose!
```

✅ **DONE!** Your app is now using MongoDB Atlas!

---

## 🖥️ OPTION 2: Local MongoDB Installation (Advanced)

### For Windows:

#### 1. **Download MongoDB**
- Go to: https://www.mongodb.com/try/download/community
- Version: Latest (e.g., 8.0.x)
- Platform: Windows
- Package: MSI
- Click "Download"

#### 2. **Install MongoDB**
- Run the downloaded `.msi` file
- Choose "Complete" installation
- ✅ Check "Install MongoDB as a Service"
- ✅ Check "Run service as Network Service user"
- Data Directory: `C:\Program Files\MongoDB\Server\8.0\data`
- Log Directory: `C:\Program Files\MongoDB\Server\8.0\log`
- Click "Next" → "Install"

#### 3. **Verify Installation**
Open PowerShell and run:
```powershell
mongod --version
```

Should show MongoDB version info.

#### 4. **Start MongoDB Service**
```powershell
# Start MongoDB service
net start MongoDB

# Check if running
Get-Service MongoDB
```

#### 5. **Your .env is Already Configured!**
Your `.env` already has:
```env
MONGO_URI="mongodb://localhost:27017/hostel"
```

This will work automatically once MongoDB is installed.

#### 6. **Restart Your Server**
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

#### 7. **Verify Connection**
Look for:
```
[Database] Successfully connected to MongoDB via Mongoose!
```

#### 8. **Optional: Install MongoDB Compass (GUI)**
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- View your `hostel` database visually

---

## 🔍 How to Check Current Database Status

### Method 1: Server Logs
When you run `npm run dev`, look for:

**If MongoDB Connected:**
```
[Database] Attempting connection to MongoDB at mongodb://...
[Database] Successfully connected to MongoDB via Mongoose!
```

**If Using Fallback:**
```
[Database] No MONGO_URI specified. Operating with persistent embedded datastore.
```
OR
```
[Database] MongoDB connection failed (...). Using persistent fallback datastore.
```

### Method 2: Check Data File
If using fallback, data is stored in:
```
.hostel_data.json
```

If this file exists and is large, you're using the fallback.

---

## 🚀 Quick Start (MongoDB Atlas - Fastest)

```bash
# 1. Sign up at MongoDB Atlas (5 min)
https://www.mongodb.com/cloud/atlas/register

# 2. Create FREE cluster

# 3. Get connection string:
mongodb+srv://username:password@cluster.mongodb.net/hostel

# 4. Update .env:
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/hostel"

# 5. Restart server:
npm run dev

# ✅ Done!
```

---

## ❓ FAQ

### Q: Do I NEED MongoDB?
**A:** No! Your app works fine with the JSON fallback. MongoDB is optional but recommended for:
- Better performance
- Production deployment
- Data scaling
- Advanced queries

### Q: Can I migrate my current data to MongoDB?
**A:** Yes! Current data in `.hostel_data.json` will auto-migrate when you first connect to MongoDB.

### Q: Which option is better?
**A:** 
- **For Development/Testing**: JSON fallback (current) is fine
- **For Production**: MongoDB Atlas (Option 1) is best
- **For Learning**: Local MongoDB (Option 2)

### Q: How much does MongoDB Atlas cost?
**A:** The M0 (FREE) tier is:
- ✅ FREE forever
- ✅ 512MB storage
- ✅ Shared RAM & CPU
- ✅ Perfect for small-medium apps

### Q: Is my data safe with MongoDB Atlas?
**A:** Yes!
- ✅ Automatic backups
- ✅ 99.9% uptime SLA
- ✅ Encrypted connections
- ✅ Enterprise-grade security

### Q: Can I switch between MongoDB and JSON?
**A:** Yes! Just:
- **To use MongoDB**: Set valid `MONGO_URI` in `.env`
- **To use JSON**: Remove/comment out `MONGO_URI` in `.env`

---

## 🛠️ Troubleshooting

### Error: "MongoDB connection failed"

**Solution 1: Check .env file**
```env
# Make sure MONGO_URI is properly formatted:
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/hostel"

# NOT (missing quotes):
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hostel
```

**Solution 2: Check password special characters**
If password has special characters like `@`, `#`, `%`:
- URL-encode them: https://www.urlencoder.org/
- Example: `p@ss` becomes `p%40ss`

**Solution 3: Check network access (Atlas)**
- Go to Network Access in Atlas
- Make sure your IP is allowed (or allow 0.0.0.0/0)

**Solution 4: Restart server**
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Error: "MongooseServerSelectionError"
- **Atlas**: Check username/password
- **Local**: Make sure MongoDB service is running:
  ```powershell
  Get-Service MongoDB
  ```

### Can't connect to localhost:27017
- MongoDB is not installed OR not running
- Install MongoDB (Option 2) OR use Atlas (Option 1)

---

## 📊 Connection String Examples

### Local MongoDB (Default)
```env
MONGO_URI="mongodb://localhost:27017/hostel"
```

### MongoDB Atlas (Cloud)
```env
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/hostel?retryWrites=true&w=majority"
```

### Docker MongoDB
```env
MONGO_URI="mongodb://localhost:27017/hostel"
```

### Remote MongoDB Server
```env
MONGO_URI="mongodb://192.168.1.100:27017/hostel"
```

---

## 🎯 My Recommendation

### For You Right Now:

**Use MongoDB Atlas** (Option 1):
1. Takes only 5 minutes
2. No installation needed
3. FREE forever
4. Works on Render deployment too
5. Professional solution

**Steps:**
```bash
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster (M0)
3. Create database user
4. Get connection string
5. Update .env
6. Restart server
7. ✅ Done!
```

---

## 📞 Need Help?

If you get stuck:
1. Check server logs for error messages
2. Verify `.env` file syntax
3. Test connection string format
4. Check MongoDB Atlas network access
5. Restart server after changes

---

**Current Status**: Using JSON fallback (works fine!)  
**Recommended**: Setup MongoDB Atlas for production-ready database  
**Time Required**: 5 minutes (Atlas) or 15 minutes (Local)

---

**Last Updated**: September 29, 2026  
**Your Current Setup**: ✅ Working (JSON fallback)  
**MongoDB Status**: ❌ Not connected (optional)
