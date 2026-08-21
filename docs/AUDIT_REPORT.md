> **SNAPSHOT HISTÓRICO (2026-07)** — Este documento registra o estado do projeto
> antes do hardening científico de 2026-08-21 (motor de 4 estados, IC Newcombe
> ajustado, contratos honestos de edge cases). Termos como "3 estados",
> "Vencedor", "FastAPI" e a URL legada refletem o contexto da época e NÃO
> descrevem o comportamento atual. Fontes de verdade atuais: README.md,
> docs/STATISTICAL_METHOD.md, docs/api-contract.md, docs/architecture-guardrails.md.

# AUDIT_REPORT.md — StatLab Experiments

**Data:** 2026-07-13  
**Branch:** `chore/portfolio-quality-pass`  
**Avaliador:** quality pass (arquitetura + full-stack + QA + portfólio)

---

## 1. Resumo executivo

StatLab Experiments é um MVP web de **planejamento e análise frequentista de testes A/B** (sample size + z-test de proporções + Bonferroni + MPE + decisão em 3 estados). A arquitetura de produção correta é **dois projetos Vercel**: Next.js (`statlab-experiments`) + Flask WSGI (`statlab-experiments-api`), com rewrite `/api/*` via `API_BACKEND_URL`.

O núcleo estatístico e a UI PT-BR estão sólidos o suficiente para demo de portfólio. As maiores lacunas antes deste pass eram: documentação de portfólio inconsistente, ausência de CI, DX incompleta (`.env.example`, docs de arquitetura/deploy), UX sem loading/a11y labels, e risco de API sombra no frontend (já removida).

**Nota atual (antes deste pass):** **6.5 / 10**  
**Nota alvo após este pass:** **8.5 / 10**

---

## 2. Stack real observada

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Recharts, Sonner |
| Backend | Python 3.12, Flask (WSGI), SciPy, statsmodels, NumPy |
| Deploy | Vercel dual-project + rewrite |
| Testes | pytest (16) na API; lint + tsc no frontend |
| Local | `start.bat` → Flask `:5000` + Next `:3000` |

---

## 3. Principais riscos

1. **Backend de produção pode degradar** se o projeto `statlab-experiments-api` for removido/renomeado sem atualizar `API_BACKEND_URL`.
2. **Sem CI** → regressões entram sem gate automático.
3. **README/docs desatualizados** em relação a Flask + dual deploy (mitigado neste pass).
4. **UI monólito em `page.tsx`** — aceitável para MVP, mas dificulta testes de componentes.
5. **Sem validação tipada no frontend** (parseFloat/parseInt silenciosos) — parcialmente mitigado por toasts + 400 do backend.
6. **Dark mode CSS global** conflita com UI `slate-50` explícita.
7. **Segurança:** API pública sem auth/rate-limit (aceitável para demo stateless; documentar).

---

## 4. Quick wins

- [x] Remover Python sombreado do frontend (já feito)
- [x] Loading states + tratamento `!res.ok`
- [x] Suprimir RuntimeWarning em zero-conversões
- [x] URL limpa `https://statlab-ab.vercel.app` (alias oficial; `statlab-experiments.vercel.app` legado indisponível)
- [ ] CI GitHub Actions
- [ ] README de portfólio
- [ ] Docs ARCHITECTURE / DEPLOYMENT / TESTING / HANDOFF
- [ ] `.env.example`
- [ ] Labels a11y + CSS light-first
- [ ] Campo MPE na UI (já existe no backend)

---

## 5. Melhorias estruturais

- Extrair tipos TS compartilhados
- Documentar contrato API canônico
- CI: lint + typecheck + build + pytest
- Handoff + audit para recrutadores
- Atualizar card do portfólio (Flask + URL limpa)

---

## 6. Bugs encontrados

| Bug | Severidade | Status |
|---|---|---|
| HTTP 400 tratado como sucesso na UI | Alta | Corrigido (toasts) |
| RuntimeWarning statsmodels (0 conversões) | Baixa | Corrigido |
| Label “IC 95%” com alpha variável | Média | Corrigido → “IC” |
| CSS dark mode força fundo preto | Média | A corrigir neste pass |
| Inputs sem `<label>` (a11y) | Média | A corrigir |
| API backend 404 intermitente / env drift | Alta | A validar/redeploy |
| Docs citando FastAPI | Baixa | A corrigir |

---

## 7. Plano de execução deste pass

1. Estabilizar API de produção + redeploy frontend com UX nova
2. Melhorar UX/a11y/CSS; expor MPE na UI
3. Docs + README + `.env.example` + CI
4. Testes extras mínimos
5. HANDOFF + commit + push `chore/portfolio-quality-pass`

---

## 8. Checklist final

- [x] Instala e roda localmente
- [x] lint / typecheck / build OK
- [x] pytest 18 OK
- [x] Demo produção responde (URL: https://statlab-ab.vercel.app)
- [x] README portfólio
- [x] Docs técnicas
- [x] CI
- [x] `.env.example` + `.gitignore`
- [x] HANDOFF.md
- [ ] Branch pushed (próximo passo)

**Nota pós-pass:** ~8.5/10

**URL note:** `statlab-experiments.vercel.app` ficou preso a um projeto antigo de outro team scope; a demo canônica atual é **https://statlab-ab.vercel.app** (aliases extras: `statlab-experiments-inky`, `statlab-experiments-app`).
