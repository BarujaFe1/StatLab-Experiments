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

## ADR-004: Four-state decision engine with signed direction + MPE

**Context:** Binary “significant / not” hides weak effects — and the original
three-state engine decided with `abs(diff) > MPE`, so a *significantly worse*
B was labeled “Vencedor” (P0 incident: A=60% vs B=58%, p≈0.004 → winner).  
**Decision:** Classify into **Melhora / Regressão / Efeito Fraco /
Inconclusivo** using Bonferroni-adjusted alpha, MPE and the **sign** of
`diff = pB − pA`. Golden test G3 + public `regressao` scenario keep the bug
from returning.  
**Consequence:** Better product narrative; requires explaining MPE and
direction to users.

## ADR-005: CI on GitHub Actions

**Context:** Portfolio repos without gates look unfinished.  
**Decision:** Lightweight CI — frontend lint/typecheck/build + API pytest.  
**Consequence:** Fast feedback without paid runners or heavy tooling.

## ADR-006: Newcombe CI at the Bonferroni-adjusted level

**Context:** The decision used `alpha_adj = alpha / n_comparisons`, but the CI
was Wald with nominal alpha while the UI said “95%” — internally inconsistent.  
**Decision:** Compute the CI for `pB − pA` with
`confint_proportions_2indep(method="newcomb", alpha=alpha_adj)` and expose
`ci_level = 1 − alpha_adj` so the UI shows the real level (e.g. “IC 98,33%”).
Keep the pooled score test for the p-value: pooled variance under H0 vs
unpooled interval for the observed effect are different questions by design
(see `STATISTICAL_METHOD.md`).  
**Consequence:** Inference and interval are family-wise coherent; golden tests
G6 compare against the library reference in five case families.

## ADR-007: Honest degenerate/edge contracts

**Context:** `NaN` p-values were masked as `p_value = 1.0`, baseline-zero
uplift returned a fake `0.0`, non-object JSON bodies crashed with 500, and
`int()` silently truncated fractional counts.  
**Decision:** `test_defined=false` + `p_value=null` + warning for degenerate
counts; `uplift=null` when `pA=0`; structured 400 for non-object bodies;
strict integer validation (no bool/float-fractional/NaN/Inf); sample-size
guards (positive MDE, finite inputs, ≤100M per group).  
**Consequence:** The API never fabricates statistical quantities; clients must
handle `null` fields (documented in `api-contract.md`).

## Trade-offs accepted

- No persistence / auth / multi-metric experiments (MVP scope).
- Monolithic `page.tsx` kept small enough for a portfolio demo.
- scipy/statsmodels inflate Python serverless bundle size (acceptable for correctness).
