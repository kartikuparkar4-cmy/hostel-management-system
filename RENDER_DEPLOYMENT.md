# Render.com Deployment Guide

## Quick Fix for Current Deployment

Your app is deployed but getting a "dist/index.html not found" error. Here's how to fix it:

### Update Build Command in Render Dashboard:

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **hostel-management-system** service
3. Go to **Settings** → Scroll to **Build & Deploy** section
4. Update the **Build Command** to:
   ```bash
   npm install && npm run build
   ```
5. Keep **Start Command** as:
   ```bash
   npm start
   ```
6. Click **Save Changes**
7. Click **Manual Deploy** → **Deploy latest commit**

### Environment Variables to Add:

Go to **Environment** tab and add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | `super-secret-jwt-key-hostel-system-2026` |
| `ADMIN_CODE` | `warden123` |
| `APP_URL` | `https://hostel-management-system-fgxp.onrender.com` |

**Optional (if using MongoDB Atlas):**
| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster.mongodb.net/hostel` |

### After Saving:

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: https://hostel-management-system-fgxp.onrender.com

---

## What the Build Process Does:

1. **`npm install`**: Installs all dependencies
2. **`npm run build`**: Runs Vite to build the React frontend into `/dist` folder
3. **`npm start`**: Starts the Express server in production mode
4. Server serves the built files from `/dist` folder

---

## Testing After Deployment:

### 1. Check Health Endpoint:
```bash
curl https://hostel-management-system-fgxp.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Hostel Management System API",
  "timestamp": "2026-09-29T..."
}
```

### 2. Test Login:
Open: https://hostel-management-system-fgxp.onrender.com

**Admin Login:**
- Email: `warden@hostel.edu`
- Password: `warden123`

**Student Login:**
- Email: `alex@student.edu`
- Password: `student123`

---

## Common Issues & Solutions:

### Issue: "dist/index.html not found"
**Cause:** Build command didn't run `vite build`
**Solution:** Update build command to: `npm install && npm run build`

### Issue: "Module not found" errors
**Cause:** Dependencies not installed
**Solution:** Make sure build command includes `npm install`

### Issue: Port errors
**Cause:** Render uses port 10000 by default
**Solution:** Set `PORT=10000` in environment variables (already done)

### Issue: Database connection errors
**Cause:** No MongoDB URI provided
**Solution:** App automatically uses fallback datastore (no action needed!)

---

## Logs & Debugging:

### View Logs:
1. Go to your Render dashboard
2. Click on your service
3. Click **Logs** tab
4. You should see:
   ```
   [Database] No MONGO_URI specified. Operating with persistent embedded datastore.
   [Hostel App] Server is running at http://0.0.0.0:10000
   ```

### Successful Deployment Indicators:
- ✅ Build completes without errors
- ✅ "Build successful 🎉" message appears
- ✅ Server starts and shows: "Your service is live 🎉"
- ✅ No "ENOENT: no such file or directory" errors

---

## Alternative: Deploy from Scratch

If you need to redeploy:

1. **Delete current service** (optional)
2. **Create new Web Service**:
   - Connect GitHub repo: `kartikuparkar4-cmy/hostel-management-system`
   - Name: `hostel-management-system`
   - Branch: `main`
   - Root Directory: Leave empty
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables** (see table above)

4. **Create Web Service**

5. Wait for deployment to complete!

---

## Performance Notes:

- **Free Tier**: Service spins down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds to wake up
- **Subsequent Requests**: Fast response times
- **Upgrade**: For always-on service, upgrade to paid plan ($7/month)

---

## Your Live URLs:

**Frontend:** https://hostel-management-system-fgxp.onrender.com
**API Health:** https://hostel-management-system-fgxp.onrender.com/api/health
**Login:** https://hostel-management-system-fgxp.onrender.com

---

## Support:

If issues persist:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Ensure GitHub repository has latest code
4. Try manual deploy from Render dashboard

**Note:** The fallback datastore means you don't need MongoDB - the app works perfectly without it!

---

**Your app is almost there! Just update the build command and redeploy! 🚀**
