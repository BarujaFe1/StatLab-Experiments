# PORTFOLIO_HANDOFF — StatLab Experiments

**Data:** 2026-07-13  
**Branch de trabalho:** `chore/portfolio-quality-pass`  
**Demo canônica:** https://statlab-ab.vercel.app  
**API:** https://statlab-experiments-api.vercel.app  
**Repo:** https://github.com/BarujaFe1/StatLab-Experiments

---

## Resumo

StatLab Experiments é um **laboratório educacional/MVP** de planejamento e interpretação frequentista de testes A/B. Demonstra rigor estatístico (poder, MDE, z-test, Bonferroni, MPE) e engenharia full-stack (Next.js + Flask WSGI em dois projetos Vercel).

**Recomendação de posicionamento no portfólio:** **selecionado / destaque técnico** (Tier A) — case de decisão responsável, não “plataforma enterprise”.

---

## Before → After

| Antes | Depois |
|---|---|
| Claims misturando FastAPI | Stack honesta: Flask WSGI |
| URL legada / schema antigo | `statlab-ab.vercel.app` + schema PT-BR canônico |
| Demo única | 4 cenários didáticos (Vencedor / Efeito Fraco / Inconclusivo / zero) |
| Só p-valor na narrativa | Badges significância × MPE + próximos passos |
| Sem screenshots | `docs/screenshots/*.png` reais |
| main desatualizado | Merge recomendado desta branch |

---

## O que o projeto demonstra

- Estatística aplicada: sample size (Cohen’s *h*), z-test, IC, Bonferroni, MPE
- Produto de dados: UI que força trade-off significância vs relevância
- Engenharia: dual deploy Vercel, rewrite `/api`, testes pytest, CI

## Claims permitidos

- “Laboratório / MVP de decisão responsável em A/B testing”
- “Flask WSGI + Next.js na Vercel”
- “Motor em 3 estados com MPE e Bonferroni”
- “Suíte pytest + CI”

## Claims proibidos

- “Plataforma enterprise de experimentação”
- “Produção multi-tenant com auth”
- “FastAPI serverless na Vercel” (não é o runtime atual)
- “IA / Bayesian / sequential testing” (roadmap, não entregue)

## Gates executados

```bash
python -m pytest api-server/api/tests -q   # 22 passed
cd frontend && npm run lint && npm run typecheck && npm run build
python scripts/smoke_prod.py
```

## Evidências visuais

- `docs/screenshots/01-plan-sample-size.png`
- `docs/screenshots/02-analyze-vencedor.png`
- `docs/screenshots/03-analyze-efeito-fraco.png`
- `docs/screenshots/04-scenarios-chips.png`
- Roteiro: `docs/DEMO_SCRIPT.md`

## Limitações

- Stateless, sem auth/DB/histórico
- Bonferroni estático (sem sequential testing)
- Alias `statlab-experiments.vercel.app` legado indisponível
- Bundle Python grande (SciPy/statsmodels)

## Próximos passos

1. Merge PR → `main`
2. Redeploy automático do card no portfólio (já aponta para `statlab-ab`)
3. Social preview / topics no GitHub
4. Opcional: E2E Playwright no CI

## Comandos úteis

```bash
start.bat
python -m pytest api-server/api/tests -q
cd frontend && npm run build
vercel deploy --prod --yes --scope baruja-fe
node scripts/capture_screens.mjs
```
