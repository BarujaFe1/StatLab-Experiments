# Testing — StatLab Experiments

## API (pytest)

```bash
# from repo root
pip install -r api-server/requirements.txt pytest
python -m pytest api-server/api/tests -q
```

Coverage highlights (16+ tests):

- health / demo shape
- sample size vs closed-form Cohen’s *h*
- monotonicity in power
- validation 400s (baseline, mde, visitors, conversions)
- winner / inconclusive / weak effect
- Bonferroni flip
- zero conversions (no crash, no NaN)
- CI width tracks alpha

`api-server/conftest.py` adds the package root to `sys.path` so `from api.index import app` works.

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build
```

There is no Jest/Playwright suite yet (MVP). Critical UX paths are validated manually / via production smoke:

1. Planejar → baseline 0.05 + mde 0.01 → n ≈ 8143  
2. Analisar demo → status **Vencedor**  
3. Campos vazios → toast  
4. Payload inválido → toast com erro do backend  

## CI

`.github/workflows/ci.yml` runs the frontend and API jobs on push/PR.
