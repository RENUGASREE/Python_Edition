# Deploy Python Edition on Render (Free Tier) + MongoDB Atlas

This guide does **not** require Render Shell (unavailable on free tier).

Curriculum data seeds **automatically** when the API starts with an empty database.

---

## Architecture overview

```
[Browser]
    ↓
[Render Static Site]  ← React/Vite build (dist/)
    ↓  VITE_API_BASE_URL
[Render Web Service]  ← Node.js Express (server/)
    ↓  MONGODB_URI
[MongoDB Atlas]       ← Cloud database (free M0 tier)
```

| Component | Technology | Hosted on |
|-----------|------------|-----------|
| Frontend | React + Vite | Render Static Site |
| API | Express + JWT | Render Web Service |
| Database | MongoDB | MongoDB Atlas |
| Auth | JWT (custom) | API only |

**Supabase is NOT used** by the active app. Legacy Django/Postgres config in `backend/` is unused for this deployment.

---

## Part A — MongoDB Atlas (step by step)

### 1. Create a free cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / log in
3. Click **Build a Database** → choose **M0 FREE**
4. Pick a cloud region close to your Render region (e.g. `US East`)
5. Name the cluster (e.g. `PythonEdition`) → **Create**

### 2. Create a database user

1. Security → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: e.g. `python_edition_user`
4. Password: generate a strong password (save it)
5. Role: **Read and write to any database**
6. **Add User**

### 3. Allow network access (required for Render)

1. Security → **Network Access** → **Add IP Address**
2. For free tier / simplicity: **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Acceptable for student projects; tighten IPs later if needed
3. **Confirm**

### 4. Get connection string

1. Database → **Connect** → **Drivers**
2. Copy the connection string, e.g.:
   ```
   mongodb+srv://python_edition_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your real password (URL-encode special characters)
4. Add database name before `?`:
   ```
   mongodb+srv://python_edition_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/python_edition?retryWrites=true&w=majority
   ```

### 5. Test locally (optional)

In `server/.env`:
```
MONGODB_URI=mongodb+srv://...
```
Run `cd server && npm run dev` — log should show `MongoDB connected`.

---

## Part B — Deploy API (Render Web Service)

### 1. Create Web Service

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|-------|--------|
| Name | `python-edition-api` |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/index.js` |
| Instance Type | **Free** |

### 2. Environment variables (API)

In **Environment** tab, add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `CLIENT_ORIGINS` | `https://YOUR-FRONTEND.onrender.com` (set after frontend deploy) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `AUTO_SEED_ON_STARTUP` | `true` |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Strong admin password |
| `PYTHON_BIN` | `python3` |

**Interactive terminal** (compiler, lessons, challenges — real `input()` in console):

| Key | Value |
|-----|--------|
| `PYTHON_BIN` | `python3` (required on Render for live console) |
| `TERMINAL_TIMEOUT_MS` | `30000` (optional) |
| `TERMINAL_OUTPUT_WAIT_MS` | `220` (optional) |

**AI tutor** (pick one provider; without keys, offline keyword tutor is used):

| Key | Value |
|-----|--------|
| `OPENROUTER_API_KEY` | From [openrouter.ai/keys](https://openrouter.ai/keys) — full `sk-or-v1-...` value, no quotes. **401 User not found** = wrong/expired key; create a new one. |
| `OPENROUTER_SITE_URL` | Your frontend URL (optional, for OpenRouter rankings) |
| `OPENROUTER_APP_NAME` | `Python Edition` (optional) |
| `GEMINI_API_KEY` | Alternative — [Google AI Studio](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | Paid OpenAI (optional) |
| `AI_PROVIDER` | `auto` \| `openrouter` \| `gemini` \| `openai` |
| `AI_MODEL` | Default: `google/gemma-2-9b-it:free` (OpenRouter free). Or `meta-llama/llama-3.2-3b-instruct:free` |

Verify AI after deploy: `GET /api/health` includes `ai.enabled: true`, or log in and open **AI Assistant** (badge shows “Live AI”).

Optional:
| `SEED_SECRET` | Random string — required header for manual re-seed via admin API |

### 3. Health check

- Health Check Path: `/api/health`
- Expect: `{ "status": "ok", "db": "connected", "autoSeed": true }`

### 4. Automatic seeding (no shell)

On first deploy with empty database, startup logs show:

```
[startup] Running idempotent curriculum bootstrap...
[bootstrap] Inserted 36 lessons
...
```

**You do not run `npm run seed` on Render.**

### 5. Manual re-seed (if needed)

As admin, call from browser console or Postman:

```http
POST https://YOUR-API.onrender.com/api/admin/bootstrap
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{}
```

If `SEED_SECRET` is set, add header: `x-seed-secret: YOUR_SECRET`

Or use **Admin Dashboard** → **Sync curriculum** button (after login as admin).

---

## Part C — Deploy Frontend (Render Static Site)

### 1. Create Static Site

1. **New +** → **Static Site** → same repo
2. Settings:

| Field | Value |
|-------|--------|
| Root Directory | *(leave empty — repo root)* |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### 2. Environment variable (critical)

Add **before** first build:

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://python-edition-api.onrender.com/api` |

Replace with your actual API URL. Vite embeds this at **build time**.

### 3. SPA routing

Add redirect/rewrite rule:

| Source | Destination |
|--------|-------------|
| `/*` | `/index.html` |

### 4. Update API CORS

Go back to API service → set `CLIENT_ORIGINS` to your static site URL exactly:

```
https://python-edition-web.onrender.com
```

Redeploy API if you change CORS.

---

## Part D — Post-deploy checklist

- [ ] `GET https://YOUR-API.onrender.com/api/health` → `db: connected`
- [ ] Register a student account on frontend
- [ ] Login as admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- [ ] Courses show lessons (36+)
- [ ] Challenges page shows categories
- [ ] No CORS errors in browser console
- [ ] Compiler: run `input()` sample — type in console, not a separate textarea
- [ ] AI Assistant badge shows **Live AI** (not offline) when API key is set

---

## Free tier notes

| Limitation | Mitigation |
|------------|------------|
| No Shell | Auto-seed on startup + `/api/admin/bootstrap` |
| Cold start (~30–60s) | Health check path; users wait on first load |
| Python on API | Set `PYTHON_BIN=python3`; Render Node images include Python — interactive console needs it |
| AI on free tier | Use OpenRouter or Gemini free keys; redeploy API after adding env vars |
| Static site rebuild | Changing `VITE_API_BASE_URL` requires **manual redeploy** |

---

## Local development

```powershell
# Terminal 1 — API
cd server
copy .env.example .env
# edit MONGODB_URI, JWT_SECRET
npm install
npm run dev

# Terminal 2 — Frontend (repo root)
npm install
npm run dev
```

Local seed (optional, force reset curriculum):
```powershell
cd server
npm run seed -- --force
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `db: disconnected` | Check Atlas IP whitelist + `MONGODB_URI` password |
| CORS error | `CLIENT_ORIGINS` must match frontend URL exactly |
| Empty courses | Check API logs for bootstrap; or POST `/api/admin/bootstrap` |
| 401 on API | Login again; token expires in 15m (refresh should work) |
| Frontend calls wrong API | Rebuild static site with correct `VITE_API_BASE_URL` |
