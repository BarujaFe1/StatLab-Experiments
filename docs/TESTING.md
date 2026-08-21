# Testing — StatLab Experiments

## API (pytest)

```bash
# from repo root
pip install -r api-server/requirements.txt pytest
python -m pytest api-server/api/tests -q
```

Current suite: **47 tests**, including the golden states **G1–G13**:

- **G1** equality → Inconclusivo (não significativo)
- **G2** positive → Melhora (com Bonferroni)
- **G3** significant negative → **Regressão** (caso histórico 60% vs 58%, p≈0.004 — guarda do bug P0; nunca Melhora/Vencedor)
- **G4** weak → Efeito Fraco (significante mas ≤ MPE)
- **G5** Bonferroni flip (n=1 vs n>1)
- **G6** adjusted CI contra a referência da biblioteca (`confint_proportions_2indep`, newcomb) em 5 famílias: normal, Bonferroni, desbalanceado, perto de 0, perto de 1 + nível `ci_level`
- **G7** JSON top-level não-objeto (lista/string/número/malformado) → 400
- **G8** contagens float (`100.7`), NaN/Inf, strings decimais → 400; strings inteiras aceitas
- **G9** bool em contagens → 400
- **G10** 0/1000 vs 0/1000 → `test_defined=false`, `p_value=null`, sem fake p
- **G11** 1000/1000 vs 1000/1000 → idem
- **G12** pA=0 → `uplift=null` (indefinido), diff absoluta válida
- **G13** MDE negativo/zero/minúsculo → 400; alpha/power não-finitos → 400

Mais: sample-size contra forma fechada de Cohen's *h*, monotonicidade em
poder, sensibilidade a alpha, cinco cenários públicos com status distintos,
warnings de aproximação normal, validações legadas (visitors/conversões/alpha/
n_comparisons/mpe).

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
2. Analisar demo → status **Melhora**  
3. Cenário Regressão → status **Regressão** com IC negativo  
4. Campos vazios → toast  
5. Payload inválido → toast com erro do backend  

## CI

`.github/workflows/ci.yml` runs the frontend and API jobs on push/PR.
