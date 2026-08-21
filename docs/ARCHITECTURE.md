# Architecture — StatLab Experiments

## Overview

StatLab is a **stateless** dual-service web app:

```txt
Browser
  └─ Next.js (App Router)  ──rewrite /api/*──►  Flask WSGI API
       frontend/                                 api-server/
```

There is **no database**. All computation happens request-by-request.

## Why two Vercel projects?

Vercel’s Next.js preset claims the `/api/*` namespace. Shipping a Python serverless function beside the Next app under `frontend/api/` caused the Python handler to be shadowed or to compete with Next’s own 404s.

**Decision:** keep Flask in `api-server/` as its own Vercel project and proxy from Next via `rewrites` + `API_BACKEND_URL`.

## Frontend (`frontend/`)

| Path | Role |
|---|---|
| `app/page.tsx` | Single-page UI (Planejar / Analisar) |
| `app/layout.tsx` | Metadata + fonts |
| `lib/types.ts` | Shared TS contracts |
| `next.config.ts` | `/api/:path*` → `${API_BACKEND_URL}/api/:path*` |

Calls are always **relative** (`/api/...`). Never hardcode the backend URL in the UI.

## Backend (`api-server/`)

| Path | Role |
|---|---|
| `api/index.py` | Flask app (canonical) |
| `api/tests/test_api.py` | pytest suite |
| `requirements.txt` | flask, scipy, statsmodels, numpy |
| `vercel.json` | rewrite all traffic to `/api/index` |

### Endpoints

- `GET /api/health`
- `POST /api/calculate-sample-size`
- `POST /api/analyze`
- `GET /api/demo`

### Statistical core

1. **Sample size:** Cohen’s *h* + `NormalIndPower.solve_power`
2. **Analysis:** `proportions_ztest` (score test, bilateral); Bonferroni `alpha / n_comparisons`
3. **CI:** Newcombe (Wilson híbrido) para `pB − pA` via `confint_proportions_2indep`, no nível ajustado (`ci_level = 1 − alpha_adj`)
4. **Decision:** Melhora / Regressão / Efeito Fraco / Inconclusivo — significância × MPE **com direção assinada** (`diff = pB − pA`)

Detalhes e premissas: [`STATISTICAL_METHOD.md`](./STATISTICAL_METHOD.md).

## Local development

`start.bat` starts Flask on `:5000` and Next on `:3000`. Next rewrites to localhost when `API_BACKEND_URL` is unset.

## Security model

Public demo API. No auth, no PII storage, no secrets required beyond a public backend URL env var.
