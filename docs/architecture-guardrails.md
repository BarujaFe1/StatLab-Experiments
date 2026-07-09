# StatLab Experiments — Architecture Guardrails

## Canonical production architecture

- **Single Vercel project:** `frontend`
- **Production URL:** https://statlab-experiments.vercel.app
- **Root directory:** `frontend/`
- **Routing:** `frontend/vercel.json` with Vercel Services (`web` = Next.js, `api` = FastAPI)
- **API contract (do not change casually):**
  - Status labels in English: `Winner` | `Weak Effect` | `Inconclusive`
  - Field name: `alpha_adjusted` (not `alpha_ajustado`)
  - Demo fixture key: `analysis` (not `analyze`)
  - Routes: `/api/health`, `/api/demo`, `/api/calculate-sample-size`, `/api/analyze`

## Do not

- Do **not** add `API_BACKEND_URL` or Next.js rewrites that proxy `/api/*` to an external Flask/FastAPI project.
- Do **not** recreate a parallel Vercel project (e.g. `statlab-experiments-api`) for production traffic.
- Do **not** replace the Services-based `frontend/api/index.py` with a dual-project Flask layout for the live demo.
- Do **not** localize decision status labels in the API response (`Vencedor` / `Inconclusivo`).

## Deploy

```bash
cd frontend
vercel --prod
```

Validate after every production deploy:

```powershell
Invoke-RestMethod https://statlab-experiments.vercel.app/api/health
Invoke-RestMethod https://statlab-experiments.vercel.app/api/demo
```

Demo fixture must include `analysis.visitors_a == 1000` and analyze must return `status: Winner` for the default demo payload.
