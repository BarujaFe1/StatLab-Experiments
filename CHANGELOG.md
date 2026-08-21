# CHANGELOG

## 2026-08-21 — Scientific hardening: 4-state engine, coherent CI, honest edges

### Fixed (P0)
- **Direção do efeito na decisão:** o motor usava `abs(diff) > MPE` e rotulava
  "Vencedor" mesmo com B significativamente pior (caso reproduzido: A=60% vs
  B=58%, p≈0.004). Novo motor de **4 estados** — Melhora / Regressão / Efeito
  Fraco / Inconclusivo — com direção assinada (`diff = pB − pA`), campo
  `direction` na resposta, cenário público `regressao` e golden test G3
  travando o bug.

### Fixed (P1)
- **IC coerente com Bonferroni:** a decisão usava `alpha_adj` mas o IC era
  Wald com alpha nominal enquanto a UI dizia 95%. Agora o IC é Newcombe
  (Wilson híbrido, `confint_proportions_2indep`) para `pB − pA` com
  `alpha=alpha_adj`; a resposta expõe `ci_level` e `ci_method` e a UI mostra
  o nível real (ex.: IC 98,33% com 3 comparações).
- Pooled score test + IC unpooled documentados como decisão de método
  (`docs/STATISTICAL_METHOD.md`), não "corrigidos" para pooled.

### Fixed (edge cases)
- Body JSON não-objeto (lista/string/número) ou malformado → 400 estruturado
  (antes: 500).
- Contagens com validação estrita de inteiro: rejeita bool, `100.7`, NaN/Inf,
  negativos e strings decimais (antes: `int()` truncava silenciosamente).
- Casos degenerados (0% vs 0%, 100% vs 100%): `test_defined=false`,
  `p_value=null` + warning (antes: NaN mascarado como `p=1.0`); IC de
  Newcombe segue reportado.
- `pA=0`: `uplift=null` ("Não definido") em vez de `0.0` falso; diff absoluta
  permanece válida.
- Sample-size: MDE negativo/zero rejeitado; não-finitos rejeitados; MDE
  minúsculo que exigiria >100M/grupo retorna 400 honesto; `solve_power`
  protegido contra overflow/erro.
- Warning documentado de aproximação normal quando `min(sucessos, falhas) < 5`
  por braço.

### Added
- `GET /api/assumptions` + premissas na UI (details) e em `/api/demo`.
- Campo `alpha` na aba Planejar (antes fixo 0.05).
- `docs/STATISTICAL_METHOD.md` (metodologia, IC, premissas, limites).
- Golden states G1–G13 em 47 testes pytest; CI validado contra a referência da
  biblioteca em 5 famílias de casos.
- ADR-006/ADR-007 em `docs/TECHNICAL_DECISIONS.md`.

### Changed
- Cenários públicos: `vencedor` → `melhora`; novo `regressao`; UI exibe
  direção, warnings e nível do IC.
- Docs de arquitetura/capacidades/guardrails atualizados (Flask, 4 estados,
  URL canônica `statlab-ab.vercel.app`); docs históricos ganharam banner de
  snapshot.

## 2026-07-13 — Portfolio case-study pass

### Added
- Educational scenarios API (`/api/scenarios`) and UI chips: Vencedor, Efeito Fraco, Inconclusivo, zero conversões
- Sample-size methodology fields (`effect_size_h`, `power`, explanatory `note`)
- Analyze enrichment: `absolute_diff`, `practically_significant`, `next_steps`
- Power input on Plan tab; MDE/MPE explainers in UI
- Docs: `PORTFOLIO_HANDOFF.md`, `DEMO_SCRIPT.md`, screenshot capture guide
- CI workflow and portfolio-ready README (prior pass)

### Fixed
- Honest positioning: lab/MVP, not production experimentation platform
- Canonical demo URL consolidation under `https://statlab-ab.vercel.app`

### Changed
- Decision copy emphasizes responsible rollout judgment beyond p-values
