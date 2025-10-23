# 🚀 Netlify Deployment Guide - Voting-Fun

Quick guide to deploy your Voting-Fun app to Netlify.

---

## 📋 Prerequisites

- ✅ Netlify Account (https://netlify.com)
- ✅ Netlify API Token (from Netlify dashboard)
- ✅ Contract deployed on Sepolia: `0x6e34D1C8B45D54585b42DcB700DebA775715CDe6`

---

## 🎯 Method 1: Deploy via Netlify CLI (Recommended)

### Step 1: Install Netlify CLI

```powershell
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```powershell
netlify login
```

This will open a browser window for authentication.

### Step 3: Build the Frontend

```powershell
cd frontend
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 4: Deploy to Netlify

```powershell
# Deploy to Netlify
netlify deploy --prod --dir=dist
```

When prompted:
- **Create & configure a new site**: Yes
- **Team**: Select your team
- **Site name**: voting-fun (or your preferred name)

### Step 5: Set Environment Variables

After deployment, add environment variables in Netlify dashboard:

**Go to**: Site Settings → Environment Variables → Add variables

```
VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
VITE_RPC_URL=https://eth-sepolia.public.blastapi.io
VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
```

Then redeploy:
```powershell
netlify deploy --prod --dir=dist
```

---

## 🌐 Method 2: Deploy via Netlify Dashboard

### Step 1: Build Locally

```powershell
cd frontend
npm run build
```

### Step 2: Upload to Netlify

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag and drop the `frontend/dist` folder
4. Wait for deployment to complete

### Step 3: Configure Environment Variables

1. Go to **Site Settings** → **Environment Variables**
2. Add the following variables:
   ```
   VITE_NETWORK_URL=https://eth-sepolia.public.blastapi.io
   VITE_RPC_URL=https://eth-sepolia.public.blastapi.io
   VITE_CONTRACT_ADDRESS=0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
   ```
3. Click **"Trigger deploy"** to rebuild with environment variables

---

## 🔄 Method 3: Deploy via Netlify API (Using Your API Token)

### Step 1: Get Your Netlify API Token

1. Go to https://app.netlify.com/user/applications
2. Click **"New access token"**
3. Give it a name: "Voting-Fun Deploy"
4. Copy the token (save it securely!)

### Step 2: Create Deploy Script

I'll create a PowerShell script for you:

```powershell
# deploy-netlify.ps1
$NETLIFY_TOKEN = "YOUR_API_TOKEN_HERE"
$SITE_NAME = "voting-fun"

# Build frontend
Set-Location frontend
npm run build

# Deploy using Netlify API
npx netlify-cli deploy --prod `
  --dir=dist `
  --auth=$NETLIFY_TOKEN `
  --site=$SITE_NAME

Set-Location ..
```

### Step 3: Run Deploy Script

```powershell
# Replace YOUR_API_TOKEN_HERE in the script first
.\deploy-netlify.ps1
```

---

## ✅ Verify Deployment

After deployment, you should see:

```
✅ Deploy is live!
🔗 Live URL: https://voting-fun.netlify.app
```

### Test Your Deployment

1. Visit your Netlify URL
2. Connect MetaMask (switch to Sepolia network)
3. Test features:
   - ✅ Connect wallet
   - ✅ View poll list
   - ✅ Create a poll
   - ✅ Vote on a poll
   - ✅ View results

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch"

**Solution**: Check environment variables are set correctly in Netlify dashboard.

### Issue: "Contract not found"

**Solution**: Verify `VITE_CONTRACT_ADDRESS` matches your deployed contract.

### Issue: "Network mismatch"

**Solution**: Ensure MetaMask is on Sepolia Testnet (Chain ID: 11155111).

---

## 📊 Current Configuration

✅ **Contract Address**: `0x6e34D1C8B45D54585b42DcB700DebA775715CDe6`  
✅ **Network**: Sepolia Testnet  
✅ **RPC URL**: https://eth-sepolia.public.blastapi.io  
✅ **Build Command**: `npm run build`  
✅ **Publish Directory**: `frontend/dist`  
✅ **Node Version**: 18

---

## 🎨 Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to **Site Settings** → **Domain Management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

---

## 📱 Share Your App

Once deployed, share your app URL:

```
🔗 Voting-Fun: https://your-site-name.netlify.app
📝 Description: Fully Confidential Voting System powered by Zama FHEVM
🎯 Features: End-to-end encrypted voting on blockchain
```

---

## 🚀 Quick Deploy Commands

```powershell
# Full deployment in 3 commands
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

**Last Updated**: 2025-10-23  
**Status**: Ready to Deploy ✅

