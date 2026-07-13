# Deployment — StatLab Experiments

## Projects (Vercel team `baruja-fe`)

| Project | Directory | Production URL |
|---|---|---|
| `statlab-experiments` | `frontend/` | https://statlab-ab.vercel.app |
| `statlab-experiments-api` | `api-server/` | https://statlab-experiments-api.vercel.app |

Aliases extras do frontend: `statlab-experiments-inky.vercel.app`, `statlab-experiments-app.vercel.app`.

> O alias `statlab-experiments.vercel.app` permanece preso a um projeto legado de outro team scope. Não use como URL oficial.

## Backend

```bash
cd api-server
vercel link --yes --project statlab-experiments-api --scope baruja-fe
vercel deploy --prod --yes --scope baruja-fe
```

`vercel.json` rewrites all paths to `/api/index` (Flask WSGI entry).

## Frontend

```bash
cd frontend
vercel link --yes --project statlab-experiments --scope baruja-fe
vercel env add API_BACKEND_URL production --value https://statlab-experiments-api.vercel.app --no-sensitive --yes --scope baruja-fe
vercel deploy --prod --yes --scope baruja-fe
# optional clean alias
vercel alias set <deployment-url> statlab-ab.vercel.app --scope baruja-fe
```

Disable SSO protection for a public portfolio demo:

```bash
vercel project protection disable --sso --scope baruja-fe
```

**Order matters:** set the env var before (or redeploy after) production deploy.

## Smoke checklist

```bash
curl https://statlab-experiments-api.vercel.app/api/health
curl https://statlab-ab.vercel.app/api/health
# expect {"status":"ok"} and analyze status "Vencedor"
```

## Local

```bash
start.bat
```

Open http://localhost:3000
