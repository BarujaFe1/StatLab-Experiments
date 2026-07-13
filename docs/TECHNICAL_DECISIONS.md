# Technical Decisions — StatLab Experiments

## ADR-001: Flask instead of FastAPI on Vercel

**Context:** Vercel’s Python serverless runtime is **WSGI-only**.  
**Decision:** Use Flask for `api-server/api/index.py`.  
**Consequence:** No ASGI/Mangum; simpler deploy; FastAPI prototypes were removed.

## ADR-002: Dual Vercel projects + Next rewrite

**Context:** Next.js owns `/api/*`. Embedding Python under `frontend/api/` caused conflicts.  
**Decision:** Separate `statlab-experiments` (Next) and `statlab-experiments-api` (Flask); proxy with `API_BACKEND_URL`.  
**Consequence:** Two deploys to maintain; frontend stays portable.

## ADR-003: Relative `/api` calls in the UI

**Context:** Absolute backend URLs in the browser couple frontend to one host and break local proxying.  
**Decision:** Always call `/api/...`; let rewrites resolve the target.  
**Consequence:** One code path for local and production.

## ADR-004: Three-state decision engine + MPE

**Context:** Binary “significant / not” hides weak effects.  
**Decision:** Classify into Vencedor / Inconclusivo / Efeito Fraco using Bonferroni-adjusted alpha and a minimum practical effect (MPE).  
**Consequence:** Better product narrative; requires explaining MPE to users.

## ADR-005: CI on GitHub Actions

**Context:** Portfolio repos without gates look unfinished.  
**Decision:** Lightweight CI — frontend lint/typecheck/build + API pytest.  
**Consequence:** Fast feedback without paid runners or heavy tooling.

## Trade-offs accepted

- No persistence / auth / multi-metric experiments (MVP scope).
- Monolithic `page.tsx` kept small enough for a portfolio demo.
- scipy/statsmodels inflate Python serverless bundle size (acceptable for correctness).
