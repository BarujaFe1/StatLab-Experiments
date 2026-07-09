# portfolio-project-handoff.md

Documento de handoff para integração do **StatLab Experiments** no portfólio [barujafe.vercel.app](https://barujafe.vercel.app/).  
Gerado a partir do estado real do repositório e dos deploys Vercel (jul/2026).

---

## 1. Identificação

| Campo | Valor |
|---|---|
| Nome | StatLab Experiments |
| Autor | BarujaFe1 (Felipe Alirio Baruja) |
| Repositório | https://github.com/BarujaFe1/StatLab-Experiments |
| Demo (frontend) | https://frontend-gamma-blush-15.vercel.app |
| API (backend) | https://statlab-experiments-api.vercel.app |
| Portfólio destino | https://barujafe.vercel.app/ |
| Status | MVP em produção (dois projetos Vercel conectados via rewrite) |
| Idioma da UI | PT-BR |

---

## 2. Resumo executivo

StatLab Experiments é uma ferramenta web de **planejamento, análise e interpretação de testes A/B** com rigor frequentista e interface clara. Resolve o problema de decisões superficiais em experimentação (falsos vencedores, parada precoce, confusão entre significância estatística e relevância prática).

O produto combina:

- cálculo de tamanho amostral (Cohen’s *h* + `NormalIndPower`);
- z-test de proporções com IC, Bonferroni e MPE;
- motor de decisão em três estados (**Vencedor**, **Inconclusivo**, **Efeito Fraco**);
- relatório copiável para comunicação com stakeholders.

---

## 3. O que foi construído

- **Frontend Next.js 16** (App Router): abas Planejar / Analisar, gráfico Recharts, toasts Sonner, tipagem TypeScript.
- **Backend Flask (WSGI)** serverless: endpoints `/api/health`, `/api/calculate-sample-size`, `/api/analyze`, `/api/demo`.
- **Arquitetura de deploy em dois projetos Vercel**:
  - `frontend` → UI + rewrite `/api/*` → `API_BACKEND_URL`
  - `statlab-experiments-api` → Flask canônico
- **Suíte pytest** (16 testes) cobrindo happy paths, validações 400, NaN/zero-conversões, CI vs alpha, Bonferroni.
- **Bootstrap local** via `start.bat` (Flask em `api-server` + Next em `frontend`).

---

## 4. Como foi construído

1. Lógica estatística centralizada em `api-server/api/index.py` (SciPy + statsmodels).
2. Frontend consome apenas caminhos relativos `/api/...` (nunca URL absoluta hardcoded).
3. Em desenvolvimento, `next.config.ts` faz rewrite para `http://127.0.0.1:5000`.
4. Em produção, a env var `API_BACKEND_URL=https://statlab-experiments-api.vercel.app` alimenta o mesmo rewrite.
5. Remoção de `frontend/api/` e `frontend/requirements.txt` para evitar função Python sombreada pelo preset Next.js (que intercepta `/api/*`).

---

## 5. Deploy

| Projeto Vercel | Pasta | URL de produção |
|---|---|---|
| `frontend` | `frontend/` | https://frontend-gamma-blush-15.vercel.app |
| `statlab-experiments-api` | `api-server/` | https://statlab-experiments-api.vercel.app |

**Env var obrigatória (frontend / Production):**

```txt
API_BACKEND_URL=https://statlab-experiments-api.vercel.app
```

**Validação ao vivo (confirmada):**

- `GET /api/health` → `{"status":"ok"}` (via proxy do frontend e direto no backend)
- `POST /api/analyze` (demo) → `status: "Vencedor"`, `alpha_ajustado: 0.0166…`
- `POST /api/calculate-sample-size` (baseline 0.05, mde 0.01) → `n_per_group: 8143`

---

## 6. Funcionalidades

### Planejar
- Inputs: conversão base, MDE (alpha/power com defaults 0.05 / 0.80).
- Output: `n_per_group` sugerido.

### Analisar
- Inputs: visitantes/conversões A e B, alpha, nº de comparações (Bonferroni), MPE opcional.
- Outputs: conversões, uplift, p-valor, alpha ajustado, IC, `significant`, `status`, `interpretation`.
- Demo one-click + “Copiar relatório”.

### Guardrails
- Validação 400 para inputs inválidos.
- Tratamento de NaN no z-test (0 conversões) → `p_value=1.0`, status Inconclusivo.
- Separação significância estatística × relevância prática (MPE).

---

## 7. Fluxo do usuário

```txt
Abrir demo
  → aba Planejar: baseline + MDE → Calcular → ver n por grupo
  → aba Analisar: preencher (ou “Carregar dados de demonstração”)
  → Analisar → card de Decisão + gráfico
  → Copiar relatório → colar em Slack/Notion/Jira
```

Estados de erro:

- campos vazios → toast “Preencha todos os campos”;
- backend indisponível → toast “Erro ao conectar ao servidor”.

---

## 8. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Sonner |
| Backend | Python 3.12, Flask (WSGI), SciPy, statsmodels, NumPy |
| Deploy | Vercel (dois projetos) + rewrite Next |
| Qualidade | ESLint, `tsc --noEmit`, pytest |

---

## 9. Decisões técnicas

1. **Flask em vez de FastAPI** no serverless Vercel (runtime Python é WSGI-only).
2. **Dois projetos Vercel** para contornar o conflito Next.js × funções Python em `/api`.
3. **Chamadas relativas `/api/...`** no frontend; proxy cuida do destino.
4. **Backend canônico único** em `api-server/` (sem duplicar Python no frontend).
5. **IC com `norm.ppf(1 - alpha/2)`** (não z fixo 1.96).
6. **Labels PT-BR** no status (`Vencedor` / `Inconclusivo` / `Efeito Fraco`) e campo `alpha_ajustado`.

---

## 10. Diferenciais

- Motor de decisão em **três estados**, não binário ganhou/perdeu.
- Guardrail de **relevância prática (MPE)** além do p-valor.
- Correção de **Bonferroni** explícita na UI e no relatório.
- Relatório copiável pronto para comunicação de produto/dados.
- Estatística testada (16 pytest) e API validada em produção.

---

## 11. Limitações

- Stateless: sem histórico de experimentos nem autenticação.
- Um único endpoint de métrica (proporções / conversão).
- URL do frontend ainda genérica (`frontend-gamma-blush-15`); renomear projeto Vercel é opcional.
- Sem modo bayesiano, sequential testing ou multi-métrica.
- `docs/capabilities.md` e `PLAN.md` ainda citam FastAPI/arquitetura antiga (débito documental residual).
- Warning conhecido do statsmodels em z-test com 0 conversões (tratado; não quebra).

---

## 12. Próximos passos recomendados

1. (Opcional) Renomear projeto Vercel `frontend` → `statlab-experiments` para URL limpa.
2. Commitar o trabalho local (remoção de `backend/`, `api-server/`, limpeza do frontend).
3. Atualizar `docs/capabilities.md` e `PLAN.md` para Flask + dois projetos.
4. Presets de cenário no Planejar; duração estimada por tráfego diário.
5. Visualização da largura do IC; modo bayesiano / sequential warnings (roadmap).

---

## 13. Metadados prontos para o portfólio

```yaml
slug: statlab-experiments
title: StatLab Experiments
tagline: Planejamento e interpretação de testes A/B com rigor estatístico
short_description: >
  Ferramenta web frequentista para planejar tamanho amostral, analisar
  proporções A/B e interpretar resultados com guardrails de relevância prática.
long_description: >
  StatLab Experiments transforma estatística frequentista em uma interface
  clara para Product Engineers, Data Analysts e PMs. Calcula sample size,
  executa z-test de proporções com IC e Bonferroni, e classifica o resultado
  em Vencedor, Inconclusivo ou Efeito Fraco — separando significância
  estatística de impacto de negócio.
role: Full-stack (Next.js + Flask) · Estatística aplicada
stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Flask
  - SciPy
  - statsmodels
  - Vercel
category: Produto de dados / Experimentação
status: MVP em produção
demo_url: https://frontend-gamma-blush-15.vercel.app
repo_url: https://github.com/BarujaFe1/StatLab-Experiments
api_url: https://statlab-experiments-api.vercel.app
year: 2026
highlights:
  - Motor de decisão em 3 estados
  - Guardrail de relevância prática (MPE)
  - Deploy dual Vercel (Next + Flask WSGI)
  - Suíte pytest da API (16 testes)
```

---

## 14. Sugestão de card (seção de projetos)

**Título:** StatLab Experiments  

**Subtítulo / uma linha:**  
Planeje e interprete testes A/B com rigor frequentista e decisão acionável.

**Tags sugeridas:** Next.js · Flask · SciPy · Experimentação · TypeScript  

**CTAs:**
- Demo → `https://frontend-gamma-blush-15.vercel.app`
- GitHub → `https://github.com/BarujaFe1/StatLab-Experiments`

**Imagem:** screenshot da aba Analisar com status “Vencedor”, gráfico A/B e card de decisão (desktop). Se ainda não houver asset, usar placeholder coerente com o grid atual do portfólio até capturar a tela.

**Posição sugerida:** entre produtos analíticos / dados (próximo a DataFlow / Maestro), destacando o eixo estatística aplicada.

---

## 15. Sugestão de case (texto editorial)

### Problema
Times de produto leem testes A/B de forma superficial: confiam só no p-valor, param cedo e tratam qualquer “significativo” como vitória operacional.

### Abordagem
Construí uma ferramenta stateless que une planejamento (sample size) e análise (z-test + IC + Bonferroni + MPE) numa UI única, com interpretação automática em três estados.

### Desafio técnico
O runtime Python da Vercel é WSGI-only e o preset Next.js captura `/api/*`. A solução foi Flask serverless em projeto separado + rewrite do Next via `API_BACKEND_URL`.

### Resultado
MVP em produção com API validada, frontend tipado, 16 testes automatizados e fluxo completo Planejar → Analisar → Copiar relatório — pronto como case de estatística aplicada + engenharia full-stack.

### Aprendizados
- Separar significância estatística de relevância prática muda a qualidade da decisão.
- Deploy “simples” em Vercel exige arquitetura explícita quando Next e Python compartilham o namespace `/api`.
