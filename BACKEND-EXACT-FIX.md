# EXACT CODE TO FIX CORS - COPY AND PASTE

**This is the EXACT code you need. Just copy and paste.**

---

## Option 1: If You Have app/main.py

Find your `app/main.py` file and make sure it looks like this:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="LlamaIndex RAG API",
    description="Conversational RAG API with LlamaIndex, FastAPI, and PostgreSQL",
    version="0.1.0"
)

# ============================================================================
# CORS MIDDLEWARE - MUST BE ADDED BEFORE ROUTERS
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://llama-chatbot-production.up.railway.app",  # Your frontend
        "http://localhost:5173",  # Local development
        "*"  # Or just use wildcard to allow all
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ============================================================================
# ROUTERS - ADD AFTER CORS MIDDLEWARE
# ============================================================================
from app.api import health, ingest, chat, documents, vaults

app.include_router(health.router, tags=["health"])
app.include_router(ingest.router, tags=["ingest"])
app.include_router(chat.router, tags=["chat"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(vaults.router, prefix="/vaults", tags=["vaults"])

@app.get("/")
async def root():
    return {
        "message": "LlamaIndex RAG API",
        "version": "0.1.0",
        "endpoints": ["/health", "/ingest", "/chat", "/documents", "/vaults"]
    }
```

---

## Option 2: If CORS Is Already There

If you already have CORS middleware, just make sure:

1. **It's BEFORE the routers** (order matters!)
2. **allow_origins includes your frontend URL or "*"**
3. **allow_methods includes all methods**

```python
# ✅ CORRECT ORDER
app.add_middleware(CORSMiddleware, ...)  # First
app.include_router(vaults.router, ...)   # Second

# ❌ WRONG ORDER
app.include_router(vaults.router, ...)   # First
app.add_middleware(CORSMiddleware, ...)  # Second - won't work!
```

---

## Option 3: Quick Test Fix

If you just want to test if CORS is the issue, use this minimal version:

```python
from fastapi.middleware.cors import CORSMiddleware

# Add this RIGHT AFTER creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow everything
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## How to Deploy

```bash
# Commit the change
git add app/main.py
git commit -m "fix: add CORS headers for vault endpoints"
git push origin main

# Railway will auto-deploy in 1-2 minutes
```

---

## How to Verify It Worked

### Test 1: Check Headers
```bash
curl -I https://eternalgy-rag-llamaindex-production.up.railway.app/vaults
```

Should see:
```
access-control-allow-origin: *
```

### Test 2: Browser Console
Open your frontend, open browser console, and run:
```javascript
fetch('https://eternalgy-rag-llamaindex-production.up.railway.app/vaults')
  .then(r => r.json())
  .then(data => console.log('SUCCESS:', data))
  .catch(err => console.error('FAILED:', err))
```

Should print: `SUCCESS: []`

### Test 3: Use the UI
1. Go to your frontend
2. Click "Vaults" in navigation
3. Click "Create Vault"
4. Should work without CORS errors

---

## Common Mistakes

### Mistake 1: Wrong Order
```python
# ❌ WRONG - Router added before CORS
app.include_router(vaults.router)
app.add_middleware(CORSMiddleware, ...)
```

### Mistake 2: Missing Import
```python
# ❌ WRONG - Forgot to import
# from fastapi.middleware.cors import CORSMiddleware
```

### Mistake 3: Typo in Origins
```python
# ❌ WRONG - Typo in URL
allow_origins=["https://llama-chatbot-production.up.railway.app"]  # Missing 's' in https
```

### Mistake 4: Router Not Included
```python
# ❌ WRONG - Forgot to include vault router
# app.include_router(vaults.router, prefix="/vaults", tags=["vaults"])
```

---

## Still Not Working?

If it still doesn't work after adding CORS:

1. **Check Railway logs** - Look for errors when starting the app
2. **Verify router is imported** - Make sure `from app.api import vaults` works
3. **Check file location** - Make sure `app/api/vaults.py` exists
4. **Restart Railway** - Sometimes needs a full restart

---

## Questions?

**Q: Why does /health work but /vaults doesn't?**  
A: Because /health was added before CORS, or CORS was added after /health. The vault router was added later without CORS.

**Q: Can frontend fix this?**  
A: No. CORS is a server-side security policy. Only backend can add CORS headers.

**Q: Is this a security risk?**  
A: Using `allow_origins=["*"]` allows all origins. For production, use specific URLs:
```python
allow_origins=[
    "https://llama-chatbot-production.up.railway.app",
    "http://localhost:5173"
]
```

**Q: How long does this take?**  
A: 5 minutes to add code, 2 minutes to deploy = 7 minutes total.

---

**Just copy the code from Option 1, paste it in your app/main.py, and deploy. That's it.**
