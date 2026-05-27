# Deployment Architecture Report — Python Edition

Generated for Render **free tier** deployment (no shell access).

---

## 1. Current deployment configuration

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint (API + static site) |
| `DEPLOY_RENDER.md` | Step-by-step deploy guide |
| `vercel.json` | Optional Vercel frontend (not required for Render) |
| `vite.config.ts` | Dev proxy `/api` → `localhost:5000` |
| `server/src/index.js` | API entry + auto-bootstrap on start |

**Active stack:** `client/` + `server/` only.

**Legacy (not deployed):** `backend/` Django, PostgreSQL, Supabase comments in old settings.

---

## 2. Services required today

| Service | Required? | Role |
|---------|-----------|------|
| MongoDB Atlas | **Yes** | All data (users, lessons, progress) |
| Render Web Service | **Yes** | Express API |
| Render Static Site | **Yes** | React frontend |
| Supabase | **No** | Not referenced in client/server |
| PostgreSQL | **No** | Legacy Django only |
| Redis | **No** | Not used |

---

## 3. Supabase verification

| Area | Used? | Evidence |
|------|-------|----------|
| Auth | No | JWT in `server/src/routes/auth.js` |
| Database | No | Mongoose + MongoDB |
| Storage | No | Avatar = URL string on user profile |
| Realtime | No | No Supabase client in `client/` |
| Profile | No | `server/src/routes/profile.js` → MongoDB |

**Conclusion:** Supabase env vars can be **removed** from Render/dashboard if they exist. They do not affect the Node/React app.

The only Supabase mention in the repo is a comment in `backend/python_edition_django/settings.py` (unused Django).

---

## 4. Environment variable audit

### REQUIRED (API — Render Web Service)

| Variable | Example | Notes |
|----------|---------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | Atlas connection string |
| `JWT_SECRET` | 32+ char random | Auth signing |
| `CLIENT_ORIGINS` | `https://app.onrender.com` | CORS — exact frontend URL |

### RECOMMENDED (API)

| Variable | Default | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | On Render |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `AUTO_SEED_ON_STARTUP` | `true` | Idempotent seed if DB empty |
| `ADMIN_EMAIL` | — | First admin account |
| `ADMIN_PASSWORD` | — | Change in production |
| `PORT` | `5000` | Render sets automatically |

### OPTIONAL (API)

| Variable | Notes |
|----------|-------|
| `PYTHON_BIN` | `python3` on Linux (compiler feature) |
| `SEED_SECRET` | Protects `POST /api/admin/bootstrap` |
| `ALLOW_RESET_TOKEN_RESPONSE` | Dev only — password reset token in response |

### REQUIRED (Frontend — Render Static Site)

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_API_BASE_URL` | `https://api.onrender.com/api` | Set at **build** time |

### OBSOLETE (safe to remove)

| Variable | Reason |
|----------|--------|
| `VITE_SUPABASE_URL` | Not in codebase |
| `VITE_SUPABASE_ANON_KEY` | Not in codebase |
| `DATABASE_URL` | Django/Postgres legacy |
| `SUPABASE_*` | Not used |
| `JWT_EXPIRES_IN` | Replaced by `JWT_ACCESS_EXPIRES_IN` + refresh tokens |

Templates: `server/.env.example`, `client/.env.example`

---

## 5. Seeding strategy (free tier)

**Implemented: Option A + Option B**

| Method | When | Wipes data? |
|--------|------|-------------|
| **Auto on startup** | `AUTO_SEED_ON_STARTUP=true` (default) | No — idempotent |
| **Admin API** | `POST /api/admin/bootstrap` | No — idempotent |
| **CLI** | `npm run seed` locally | `--force` wipes curriculum only |

Preserves: users, progress, bookmarks, XP.

---

## 6. Safe cleanup plan

| Action | Safe? |
|--------|-------|
| Remove Supabase env from Render | Yes |
| Remove unused `backend/` from deploy | Yes (already not deployed) |
| Delete `vercel.json` | Only if not using Vercel |
| Keep `render.yaml` | Yes |

---

## 7. Deployment order

1. Create MongoDB Atlas cluster + user + network access  
2. Deploy **API** Web Service with env vars (use placeholder `CLIENT_ORIGINS` first)  
3. Verify `/api/health` → bootstrap logs in Render logs  
4. Deploy **Static Site** with `VITE_API_BASE_URL`  
5. Update API `CLIENT_ORIGINS` to static URL → redeploy API  
6. Login as admin → verify lessons/challenges  
7. Change `ADMIN_PASSWORD` after first login  

---

## 8. Files changed for free-tier deployment

| File | Change |
|------|--------|
| `server/src/seed/bootstrap.js` | Idempotent seed logic |
| `server/src/index.js` | Auto-seed on startup, `0.0.0.0` bind |
| `server/src/config/db.js` | Retry connect, timeouts |
| `server/src/routes/admin.js` | `POST /admin/bootstrap` |
| `server/.env.example` | Clean template |
| `client/.env.example` | Frontend template |
| `DEPLOY_RENDER.md` | No shell instructions |
