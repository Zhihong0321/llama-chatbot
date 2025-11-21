# URGENT: CORS Headers Missing for /vaults Endpoints

**Date**: November 21, 2025  
**Priority**: 🔴 CRITICAL - Blocking Production  
**Issue**: Vault endpoints return no CORS headers

---

## Error in Browser Console

```
Access to fetch at 'https://eternalgy-rag-llamaindex-production.up.railway.app/vaults' 
from origin 'https://llama-chatbot-production.up.railway.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

---

## Root Cause

The **new `/vaults` endpoints are missing CORS headers**. 

Other endpoints (`/health`, `/ingest`, `/chat`, `/documents`) work fine because they have CORS configured. The vault endpoints were added but CORS wasn't configured for them.

---

## What Backend Needs to Do

### Option 1: Add CORS to Vault Router (Recommended)

If using FastAPI with separate routers, ensure the vault router is included in CORS middleware:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://llama-chatbot-production.up.railway.app",
        "http://localhost:5173",  # For local development
        "*"  # Or use wildcard (less secure but works)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Make sure vault router is included AFTER middleware
from app.api import vaults
app.include_router(vaults.router, prefix="/vaults", tags=["vaults"])
```

### Option 2: Verify Middleware Order

CORS middleware must be added **BEFORE** including routers:

```python
# CORRECT ORDER:
app = FastAPI()
app.add_middleware(CORSMiddleware, ...)  # 1. Add CORS first
app.include_router(vault_router)          # 2. Then add routers

# WRONG ORDER:
app = FastAPI()
app.include_router(vault_router)          # ❌ Router added first
app.add_middleware(CORSMiddleware, ...)  # ❌ CORS won't apply to router
```

### Option 3: Check Router Configuration

If vault router is in a separate file (`app/api/vaults.py`), ensure it's properly imported and included:

```python
# app/main.py
from app.api.vaults import router as vault_router

app.include_router(
    vault_router,
    prefix="/vaults",
    tags=["vaults"]
)
```

---

## How to Test CORS Fix

### 1. Check Response Headers

```bash
curl -I https://eternalgy-rag-llamaindex-production.up.railway.app/vaults
```

Should return:
```
HTTP/1.1 200 OK
access-control-allow-origin: *
access-control-allow-methods: GET, POST, DELETE, OPTIONS
access-control-allow-headers: *
```

### 2. Test OPTIONS Preflight

```bash
curl -X OPTIONS https://eternalgy-rag-llamaindex-production.up.railway.app/vaults \
  -H "Origin: https://llama-chatbot-production.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return 200 with CORS headers.

### 3. Test from Browser

Open browser console and run:
```javascript
fetch('https://eternalgy-rag-llamaindex-production.up.railway.app/vaults')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return `[]` (empty array), not CORS error.

---

## Why Other Endpoints Work

The existing endpoints (`/health`, `/ingest`, `/chat`, `/documents`) already have CORS configured. You can verify:

```bash
# This works (returns CORS headers):
curl -I https://eternalgy-rag-llamaindex-production.up.railway.app/health

# This doesn't (missing CORS headers):
curl -I https://eternalgy-rag-llamaindex-production.up.railway.app/vaults
```

---

## Common FastAPI CORS Mistakes

### Mistake 1: Router Added Before Middleware
```python
# ❌ WRONG
app.include_router(vault_router)
app.add_middleware(CORSMiddleware, ...)
```

### Mistake 2: Restrictive Origins
```python
# ❌ TOO RESTRICTIVE
allow_origins=["http://localhost:5173"]  # Missing production URL
```

### Mistake 3: Missing Methods
```python
# ❌ MISSING DELETE
allow_methods=["GET", "POST"]  # Need DELETE for vault deletion
```

### Mistake 4: Router Not Included
```python
# ❌ FORGOT TO INCLUDE
# vault_router exists but never added to app
```

---

## Quick Fix (Temporary)

If you need a quick fix, use wildcard CORS (less secure but works):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)
```

Then tighten security later:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://llama-chatbot-production.up.railway.app",
        "http://localhost:5173"
    ],
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
```

---

## Expected Backend Code

Your backend should look something like this:

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, ingest, chat, documents, vaults

app = FastAPI(title="LlamaIndex RAG API")

# CORS middleware - MUST BE FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://llama-chatbot-production.up.railway.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers AFTER middleware
app.include_router(health.router, tags=["health"])
app.include_router(ingest.router, tags=["ingest"])
app.include_router(chat.router, tags=["chat"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(vaults.router, prefix="/vaults", tags=["vaults"])  # ← Make sure this is here!
```

---

## Verification Checklist

After deploying the fix:

- [ ] `curl -I /vaults` returns `access-control-allow-origin` header
- [ ] `curl -X OPTIONS /vaults` returns 200 with CORS headers
- [ ] Browser console shows no CORS errors
- [ ] Frontend can fetch vault list
- [ ] Frontend can create vaults
- [ ] Frontend can delete vaults

---

## Impact

**Current State**: 🔴 Vault feature completely broken  
**User Impact**: Cannot use vault management at all  
**Workaround**: None - this is a backend fix  

**After Fix**: ✅ Vault feature will work immediately (no frontend changes needed)

---

## Timeline

1. Backend adds CORS headers to vault endpoints
2. Backend deploys to Railway (1-2 minutes)
3. Frontend automatically works (no changes needed)
4. Users can create and manage vaults

---

## Contact

**Frontend Status**: ✅ Working correctly  
**Backend Status**: 🔴 Missing CORS headers on `/vaults`  
**Next Action**: Backend team add CORS configuration

---

## Related Files

- Backend CORS config (likely in `app/main.py` or `app/config.py`)
- Vault router (likely in `app/api/vaults.py`)

---

**This is a 5-minute backend fix. No frontend changes needed.**
