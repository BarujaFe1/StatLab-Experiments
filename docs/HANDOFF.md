# HANDOFF.md — Portfolio Quality Pass

**Branch:** `chore/portfolio-quality-pass`  
**Date:** 2026-07-13  
**Repo:** https://github.com/BarujaFe1/StatLab-Experiments

---

## What was found

- Solid frequentist MVP (sample size + z-test + Bonferroni + 3-state decision).
- Old Vercel team scope disappeared; production had drifted to an outdated schema (`Winner` / `alpha_adjusted`).
- Portfolio gaps: weak README, no CI, thin DX docs, a11y labels, dark-mode CSS clash, MPE only on backend.

**Pre-pass score:** ~6.5/10 → **target ~8.5/10**

---

## What was fixed / improved

### Reliability and deploy
- Recreated API + frontend under team **`baruja-fe`**
- Fixed `api-server/vercel.json` BOM parse issue
- Set `API_BACKEND_URL`, disabled SSO protection for public demo
- Canonical demo: **https://statlab-ab.vercel.app**

### Backend
- Suppressed statsmodels RuntimeWarning on zero conversions
- Added tests (18 pytest total)

### Frontend / UX
- Loading states + skeleton, labels/a11y, MPE field, empty states
- Light-first CSS; types in `frontend/lib/types.ts`

### Docs / DX / CI
- Portfolio README + architecture/testing/deployment/audit/handoff docs
- `.env.example`, GitHub Actions CI

### Portfolio site
- Updated StatLab card (Flask + PT-BR decision labels + `statlab-ab` URL) in `felipe-baruja-portfolio`

---

## Commands run

```bash
python -m pytest api-server/api/tests -q   # 18 passed
cd frontend && npm run lint && npm run typecheck && npm run build
vercel deploy --prod (api-server + frontend) --scope baruja-fe
```

## Production smoke

| Check | Result |
|---|---|
| API health | 200 |
| Frontend health via proxy | 200 |
| Analyze demo | `Vencedor` + `alpha_ajustado` |
| Public URL | https://statlab-ab.vercel.app |

---

## Still pending / risks

1. Merge this branch into `main` when ready.
2. Optional screenshot `docs/screenshot-analyze.png`.
3. Push/deploy portfolio repo separately.
4. Public API has no auth/rate-limit (demo-acceptable).
5. Legacy alias `statlab-experiments.vercel.app` still owned elsewhere.

## Suggested commit message

```txt
chore: improve portfolio quality, docs, tests and stability
```
