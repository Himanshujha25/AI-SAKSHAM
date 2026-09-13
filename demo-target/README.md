# 🎯 Demo Target (Authorized Local Demo ONLY)

Intentionally vulnerable mini-app for Saksham AI assessments. **Never expose to the internet.**

## Run it

```powershell
cd demo-target
node server.js
# → http://127.0.0.1:5199
```

## Scan it

1. Saksham AI → Projects → your project → add target:
   - Name: `Local Demo App`
   - URL: `http://127.0.0.1:5199`
   - Tick the authorization checkbox
2. Assessments → select project + target → profile **Standard Audit** → Start
3. Watch 8 stages → Findings → AI analysis → Report

## Expected findings (all real, all from this app)

| Endpoint | Finding |
|---|---|
| `/` | Missing CSP, wildcard CORS, missing rate-limit headers |
| `GET /api/users/123` | IDOR screen (no-auth object JSON) |
| `GET /api/admin/users` | Unprotected admin listing |
| `GET /search?q='` | SQL error disclosure |
| `POST /api/login` | Verbose login errors (enumeration) |

Demo creds: `admin@demo.local` / `demo1234` (for manual `/api-tester` role-compare practice).
