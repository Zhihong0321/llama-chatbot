# Railway Quick Start Guide

**Repository**: https://github.com/Zhihong0321/llama-chatbot

---

## ✅ Configuration Files Added

Your repository now includes Railway auto-configuration:

1. **railway.json** - Railway-specific configuration
2. **nixpacks.toml** - Build system configuration  
3. **package.json** (root) - Node.js project detection
4. **Procfile** - Process configuration (fallback)

Railway will **automatically detect and configure** your project!

---

## 🚀 Deploy in 3 Steps

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `Zhihong0321/llama-chatbot`

### Step 2: Set Environment Variable
In Railway dashboard → Variables tab:
```env
VITE_API_BASE_URL=https://eternalgy-rag-llamaindex-production.up.railway.app
```

### Step 3: Deploy
Click **"Deploy"** - Railway will automatically:
- ✅ Detect Node.js project
- ✅ Install dependencies
- ✅ Build the frontend
- ✅ Start the preview server
- ✅ Assign a public URL

---

## 📋 What Railway Will Do Automatically

### Build Phase
```bash
cd frontend && npm ci && npm run build
```

### Start Phase
```bash
cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT
```

### Environment
- Node.js 20.x
- Port: Automatically assigned by Railway
- Host: 0.0.0.0 (accessible externally)

---

## ⏱️ Expected Timeline

- **Build Time**: ~2-3 minutes
- **Deploy Time**: ~30 seconds
- **Total**: ~3-4 minutes

---

## ✅ Post-Deployment Checklist

Once deployed, test your Railway URL:

1. **Homepage**
   - [ ] Loads without errors
   - [ ] Navigation works

2. **Agent Management**
   - [ ] Can create new agent
   - [ ] Can view agent list
   - [ ] Can edit agent
   - [ ] Can delete agent

3. **Vault Management**
   - [ ] Can create new vault
   - [ ] Can view vault list
   - [ ] Can delete vault

4. **Document Upload**
   - [ ] Can select file
   - [ ] Upload progress shows
   - [ ] Document appears in list

5. **Chat**
   - [ ] Can start chat
   - [ ] Can send message
   - [ ] Receives response
   - [ ] Message history persists

---

## 🔧 Troubleshooting

### Build Fails

**Error**: "Could not determine how to build"
- ✅ **Fixed!** Configuration files added

**Error**: "npm install failed"
- Check Node.js version (requires 18+)
- Verify `frontend/package.json` exists

### App Doesn't Start

**Error**: "Port already in use"
- Railway automatically assigns port via `$PORT`
- No action needed

**Error**: "Cannot find module"
- Rebuild the project
- Check build logs for errors

### API Calls Fail

**Error**: "CORS error"
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend CORS allows your Railway domain

**Error**: "Network error"
- Test backend API directly
- Verify backend is running

---

## 📊 Monitoring

### Railway Dashboard
- **Deployments**: View build logs
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs

### View Logs
```bash
# In Railway dashboard
Click "View Logs" button

# Or use Railway CLI
railway logs
```

---

## 🔄 Redeploy

### Automatic Redeployment
Railway automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

### Manual Redeployment
In Railway dashboard:
1. Go to Deployments
2. Click "Redeploy"

---

## 💰 Cost Estimate

**Hobby Plan**: $5/month
- Includes $5 usage credit
- ~550 hours of runtime
- Sufficient for this app

**Pro Plan**: $20/month
- Includes $20 usage credit
- More resources available

---

## 🎯 Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ App starts and shows "Running"
- ✅ Public URL is accessible
- ✅ Homepage loads correctly
- ✅ API calls work (check Network tab)
- ✅ No console errors

---

## 📞 Need Help?

1. **Check Logs**: Railway dashboard → View Logs
2. **Review Docs**: See `RAILWAY-DEPLOYMENT.md` for detailed guide
3. **Test Locally**: Run `npm run build && npm run preview` in frontend/
4. **Railway Support**: https://discord.gg/railway

---

## 🎉 You're Ready!

Your repository is now optimized for Railway deployment with:
- ✅ Auto-configuration files
- ✅ Proper build commands
- ✅ Environment setup
- ✅ Process management

**Just deploy and test!** 🚀
