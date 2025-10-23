# 🔧 Netlify Environment Variables Setup

Your site is deployed! Now configure environment variables.

**Your Site**: https://dainty-sawine-83844d.netlify.app

---

## 📝 Step-by-Step Guide

### Step 1: Go to Site Settings

1. In your Netlify dashboard, click on your site: **dainty-sawine-83844d**
2. Click **"Site configuration"** in the left sidebar
3. Scroll down and click **"Environment variables"**

Or visit directly:
```
https://app.netlify.com/sites/dainty-sawine-83844d/configuration/env
```

---

### Step 2: Add Environment Variables

Click **"Add a variable"** and add these **3 variables**:

#### Variable 1: VITE_NETWORK_URL
```
Key:   VITE_NETWORK_URL
Value: https://eth-sepolia.public.blastapi.io
```

#### Variable 2: VITE_RPC_URL
```
Key:   VITE_RPC_URL
Value: https://eth-sepolia.public.blastapi.io
```

#### Variable 3: VITE_CONTRACT_ADDRESS
```
Key:   VITE_CONTRACT_ADDRESS
Value: 0x6e34D1C8B45D54585b42DcB700DebA775715CDe6
```

**Important**: 
- ✅ Make sure keys are EXACTLY as shown (case-sensitive)
- ✅ No spaces before or after values
- ✅ All values are for **Sepolia Testnet**

---

### Step 3: Redeploy

After adding all 3 environment variables:

1. Go back to **"Deploys"** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Deploy site"**
4. Wait 1-2 minutes for the deployment to complete

---

## ✅ Verify Deployment

After redeployment completes:

1. Visit: https://dainty-sawine-83844d.netlify.app
2. Click **"Connect MetaMask Wallet"**
3. Switch MetaMask to **Sepolia Testnet**
4. You should see:
   - ✅ Network: Sepolia
   - ✅ FHE Status badge (green or orange)
   - ✅ Poll List and Create Poll tabs

---

## 🧪 Test All Features

### Test 1: View Polls
- Click **"Poll List"** tab
- Should see existing polls or "No Polls Yet"

### Test 2: Create a Poll
- Click **"Create Poll"** tab
- Fill in title and options
- Click **"Create Poll"**
- Approve transaction in MetaMask
- Wait for confirmation

### Test 3: Vote
- Click on a poll from the list
- Select an option
- Click **"Vote"**
- Approve transaction
- Verify vote submitted

### Test 4: View Results
- Check if results are displayed (if poll ended)
- Should show vote counts and percentages

---

## 🎨 Optional: Custom Domain

If you want a custom domain like `voting-fun.com`:

1. Click **"Domain management"** in sidebar
2. Click **"Add domain"**
3. Follow the DNS configuration steps

---

## 📊 Current Configuration

| Setting | Value |
|---------|-------|
| **Site Name** | dainty-sawine-83844d |
| **URL** | https://dainty-sawine-83844d.netlify.app |
| **Network** | Sepolia Testnet |
| **Contract** | 0x6e34D1C8B45D54585b42DcB700DebA775715CDe6 |
| **Status** | ✅ Published |

---

## 🐛 Troubleshooting

### Issue: "Failed to connect"
- **Solution**: Check MetaMask is on Sepolia network

### Issue: "Contract not found"
- **Solution**: Verify environment variables are added correctly

### Issue: Blank page
- **Solution**: Check browser console for errors, may need to clear cache

### Issue: "Network Error"
- **Solution**: Make sure all 3 environment variables are set and redeployed

---

## 🎉 Success Checklist

- [ ] Environment variables added (all 3)
- [ ] Site redeployed
- [ ] Can connect MetaMask wallet
- [ ] Can view poll list
- [ ] Can create a new poll
- [ ] Can vote on a poll
- [ ] UI is in English

---

**Next Steps**: Add environment variables, then trigger a new deployment!

**Your site**: https://dainty-sawine-83844d.netlify.app

