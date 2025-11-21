# Quick Start - Testing Against Production API

## Your Production API Server

**URL**: `https://eternalgy-rag-llamaindex-production.up.railway.app`

**Status**: ✅ LIVE and running

**Available Endpoints**:
- `/health` - Health check
- `/ingest` - Document ingestion
- `/chat` - Chat with RAG
- `/documents` - Document management
- `/vaults` - Vault management
- `/agents` - Agent management
- `/docs` - API documentation (Swagger UI)

---

## Step 1: Configure Frontend

The `.env` file has been created with your production API URL:

```bash
cd frontend
cat .env
```

You should see:
```
VITE_API_BASE_URL=https://eternalgy-rag-llamaindex-production.up.railway.app
```

---

## Step 2: Install Dependencies

```bash
cd frontend
npm install
```

---

## Step 3: Start Frontend

```bash
npm run dev
```

The frontend will start at `http://localhost:5173` (or similar)

---

## Step 4: Open Browser and Test

1. Open browser: `http://localhost:5173`
2. Open DevTools (F12) → Network tab
3. Start testing!

---

## Quick Verification Tests

### Test 1: Check API Connection

Open browser console and run:
```javascript
fetch('https://eternalgy-rag-llamaindex-production.up.railway.app/')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "name": "LlamaIndex RAG API",
  "version": "0.1.0",
  "status": "running",
  "endpoints": {...}
}
```

### Test 2: List Vaults

```javascript
fetch('https://eternalgy-rag-llamaindex-production.up.railway.app/vaults')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Create a Test Vault

```javascript
fetch('https://eternalgy-rag-llamaindex-production.up.railway.app/vaults', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Vault',
    description: 'Testing API connection'
  })
})
  .then(r => r.json())
  .then(console.log)
```

---

## Full Test Plan

Follow the comprehensive test plan in **REAL-API-TEST-PLAN.md**

It includes:
- ✅ 30 detailed test cases
- ✅ Step-by-step instructions
- ✅ Expected results
- ✅ Pass/Fail checkboxes
- ✅ API request/response examples

---

## Troubleshooting

### CORS Errors

If you see CORS errors in the console, the API server needs to allow requests from your frontend origin.

**Solution**: Contact the API server administrator to add your frontend URL to CORS allowed origins.

### Connection Refused

If you see "Connection refused" or "Failed to fetch":
1. Check if API is still running: Visit `https://eternalgy-rag-llamaindex-production.up.railway.app/docs`
2. Check your internet connection
3. Check if Railway deployment is active

### 404 Not Found on Endpoints

If specific endpoints return 404:
1. Check the API documentation: `https://eternalgy-rag-llamaindex-production.up.railway.app/docs`
2. Verify endpoint paths match the API specification
3. Check if the API version has changed

---

## API Documentation

Full interactive API documentation available at:
**https://eternalgy-rag-llamaindex-production.up.railway.app/docs**

This Swagger UI shows:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Example payloads

---

## Next Steps

1. ✅ Frontend configured with production API URL
2. ⏭️ Start frontend: `npm run dev`
3. ⏭️ Open browser and test basic functionality
4. ⏭️ Follow REAL-API-TEST-PLAN.md for comprehensive testing
5. ⏭️ Document any issues or bugs found

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check API documentation for correct request format
4. Verify API server is running and accessible
