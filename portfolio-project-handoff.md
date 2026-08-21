> **SNAPSHOT HISTÓRICO (2026-07)** — Este documento registra o estado do projeto
> antes do hardening científico de 2026-08-21 (motor de 4 estados, IC Newcombe
> ajustado, contratos honestos de edge cases). Termos como "3 estados",
> "Vencedor", "FastAPI" e a URL legada refletem o contexto da época e NÃO
> descrevem o comportamento atual. Fontes de verdade atuais: README.md,
> docs/STATISTICAL_METHOD.md, docs/api-contract.md, docs/architecture-guardrails.md.

# portfolio-project-handoff.md

Documento de handoff para integraÃƒÂ§ÃƒÂ£o do **StatLab Experiments** no portfÃƒÂ³lio [barujafe.vercel.app](https://barujafe.vercel.app/).  
Gerado a partir do estado real do repositÃƒÂ³rio e dos deploys Vercel (jul/2026).

---

## 1. IdentificaÃƒÂ§ÃƒÂ£o

| Campo | Valor |
|---|---|
| Nome | StatLab Experiments |
| Autor | BarujaFe1 (Felipe Alirio Baruja) |
| RepositÃƒÂ³rio | https://github.com/BarujaFe1/StatLab-Experiments |
| Demo (frontend) | https://statlab-ab.vercel.app |
| API (backend) | https://statlab-experiments-api.vercel.app |
| PortfÃƒÂ³lio destino | https://barujafe.vercel.app/ |
| Status | MVP em produÃƒÂ§ÃƒÂ£o (dois projetos Vercel conectados via rewrite) |
| Idioma da UI | PT-BR |

---

## 2. Resumo Executivo

StatLab Experiments ÃƒÂ© uma ferramenta web de **planejamento, anÃƒÂ¡lise e interpretaÃƒÂ§ÃƒÂ£o de testes A/B** com rigor frequentista e interface clara. Resolve o problema de decisÃƒÂµes superficiais em experimentaÃƒÂ§ÃƒÂ£o (falsos vencedores, parada precoce, confusÃƒÂ£o entre significÃƒÂ¢ncia estatÃƒÂ­stica e relevÃƒÂ¢ncia prÃƒÂ¡tica).

### O que entrega:
- **Cálculo de tamanho amostral** baseado em Cohen's *h* e `NormalIndPower` do statsmodels.
- **Z-test para duas proporções** com correção de Bonferroni para múltiplas comparações.
- **Motor de decisão em 3 estados**: Winner / Inconclusive / Weak Effect.
- **Interpretação textual automática** em português com explicação do resultado.
- **Botão de demonstração** que carrega dados fictícios e executa todo o pipeline automaticamente.

- cÃƒÂ¡lculo de tamanho amostral (CohenÃ¢â‚¬â„¢s *h* + `NormalIndPower`);
- z-test de proporÃƒÂ§ÃƒÂµes com IC, Bonferroni e MPE;
- motor de decisÃƒÂ£o em trÃƒÂªs estados (**Vencedor**, **Inconclusivo**, **Efeito Fraco**);
- relatÃƒÂ³rio copiÃƒÂ¡vel para comunicaÃƒÂ§ÃƒÂ£o com stakeholders.

---

## 3. O que foi construÃƒÂ­do

- **Frontend Next.js 16** (App Router): abas Planejar / Analisar, grÃƒÂ¡fico Recharts, toasts Sonner, tipagem TypeScript.
- **Backend Flask (WSGI)** serverless: endpoints `/api/health`, `/api/calculate-sample-size`, `/api/analyze`, `/api/demo`.
- **Arquitetura de deploy em dois projetos Vercel**:
  - `frontend` Ã¢â€ â€™ UI + rewrite `/api/*` Ã¢â€ â€™ `API_BACKEND_URL`
  - `statlab-experiments-api` Ã¢â€ â€™ Flask canÃƒÂ´nico
- **SuÃƒÂ­te pytest** (16 testes) cobrindo happy paths, validaÃƒÂ§ÃƒÂµes 400, NaN/zero-conversÃƒÂµes, CI vs alpha, Bonferroni.
- **Bootstrap local** via `start.bat` (Flask em `api-server` + Next em `frontend`).

---

## 4. Como foi construÃƒÂ­do

1. LÃƒÂ³gica estatÃƒÂ­stica centralizada em `api-server/api/index.py` (SciPy + statsmodels).
2. Frontend consome apenas caminhos relativos `/api/...` (nunca URL absoluta hardcoded).
3. Em desenvolvimento, `next.config.ts` faz rewrite para `http://127.0.0.1:5000`.
4. Em produÃƒÂ§ÃƒÂ£o, a env var `API_BACKEND_URL=https://statlab-experiments-api.vercel.app` alimenta o mesmo rewrite.
5. RemoÃƒÂ§ÃƒÂ£o de `frontend/api/` e `frontend/requirements.txt` para evitar funÃƒÂ§ÃƒÂ£o Python sombreada pelo preset Next.js (que intercepta `/api/*`).

```
statlab-experiments/
├── frontend/                   # Next.js App Router (Vercel Root)
│   ├── api/
│   │   └── index.py            # FastAPI (Vercel Services / Python)
│   ├── app/
│   │   ├── page.tsx            # Página principal (tudo em um componente)
│   │   ├── layout.tsx          # Root layout (Geist font, metadados)
│   │   └── globals.css         # Tailwind v4
│   ├── public/                 # Assets estáticos
│   ├── requirements.txt        # Dependências Python
│   ├── vercel.json             # Config de deploy + rewrites
│   ├── package.json            # Next.js 16 + React 19
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts (implícito no v4)
├── backend/                    # Código original (referência, não servido)
├── docs/                       # Contrato de API e capacidades
├── README.md, PLAN.md
└── start.bat
```

### Stack usada

| Projeto Vercel | Pasta | URL de produÃƒÂ§ÃƒÂ£o |
|---|---|---|
| `statlab-experiments` | `frontend/` | https://statlab-ab.vercel.app |
| `statlab-experiments-api` | `api-server/` | https://statlab-experiments-api.vercel.app |

**Env var obrigatÃƒÂ³ria (frontend / Production):**

- **Página única**: `app/page.tsx` contém todo o estado, lógica e JSX (arquitetura SPA simplificada para portfólio)
- **Layout**: `app/layout.tsx` com fontes Geist, metadados PT-BR
- **API serverless**: `api/index.py` contém FastAPI + toda a lógica estatística em um arquivo único (sem divisão em módulos para simplicidade do deploy)
- **Config**: `vercel.json` com `rewrites` para rotear `/api/*` ao handler Python

**ValidaÃƒÂ§ÃƒÂ£o ao vivo (confirmada):**

- `GET /api/health` Ã¢â€ â€™ `{"status":"ok"}` (via proxy do frontend e direto no backend)
- `POST /api/analyze` (demo) Ã¢â€ â€™ `status: "Vencedor"`, `alpha_ajustado: 0.0166Ã¢â‚¬Â¦`
- `POST /api/calculate-sample-size` (baseline 0.05, mde 0.01) Ã¢â€ â€™ `n_per_group: 8143`

---

## 5. Onde foi Construído e Publicado

### Planejar
- Inputs: conversÃƒÂ£o base, MDE (alpha/power com defaults 0.05 / 0.80).
- Output: `n_per_group` sugerido.

### Analisar
- Inputs: visitantes/conversÃƒÂµes A e B, alpha, nÃ‚Âº de comparaÃƒÂ§ÃƒÂµes (Bonferroni), MPE opcional.
- Outputs: conversÃƒÂµes, uplift, p-valor, alpha ajustado, IC, `significant`, `status`, `interpretation`.
- Demo one-click + Ã¢â‚¬Å“Copiar relatÃƒÂ³rioÃ¢â‚¬Â.

### Guardrails
- ValidaÃƒÂ§ÃƒÂ£o 400 para inputs invÃƒÂ¡lidos.
- Tratamento de NaN no z-test (0 conversÃƒÂµes) Ã¢â€ â€™ `p_value=1.0`, status Inconclusivo.
- SeparaÃƒÂ§ÃƒÂ£o significÃƒÂ¢ncia estatÃƒÂ­stica Ãƒâ€” relevÃƒÂ¢ncia prÃƒÂ¡tica (MPE).

---

## 7. Fluxo do usuÃƒÂ¡rio

```txt
Abrir demo
  Ã¢â€ â€™ aba Planejar: baseline + MDE Ã¢â€ â€™ Calcular Ã¢â€ â€™ ver n por grupo
  Ã¢â€ â€™ aba Analisar: preencher (ou Ã¢â‚¬Å“Carregar dados de demonstraÃƒÂ§ÃƒÂ£oÃ¢â‚¬Â)
  Ã¢â€ â€™ Analisar Ã¢â€ â€™ card de DecisÃƒÂ£o + grÃƒÂ¡fico
  Ã¢â€ â€™ Copiar relatÃƒÂ³rio Ã¢â€ â€™ colar em Slack/Notion/Jira
```

Estados de erro:

- campos vazios Ã¢â€ â€™ toast Ã¢â‚¬Å“Preencha todos os camposÃ¢â‚¬Â;
- backend indisponÃƒÂ­vel Ã¢â€ â€™ toast Ã¢â‚¬Å“Erro ao conectar ao servidorÃ¢â‚¬Â.

---

## 8. Stack

| Camada | Tecnologia |
|---|---|
| **Desenvolvimento** | Ambiente local Windows, PowerShell, Node.js 24, Python 3.12 |
| **Repositório** | GitHub — [BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments) (branch `feat/vercel-site`) |
| **Hospedagem** | Vercel (plano Hobby) |
| **Root directory do projeto Vercel** | `frontend/` |
| **URL de produção** | [https://statlab-experiments.vercel.app](https://statlab-experiments.vercel.app) |
| **Alias atual** | `statlab-experiments.vercel.app` (gerado pelo Vercel) |
| **Proteção** | Desabilitada (deployment público, sem Vercel Auth) |
| **Build** | Automático via Vercel (Next.js detectado + Python `api/` auto-build) |
| **Tempo de deploy** | ~50s (inclui instalação de dependências Python via `uv`) |
| **Tamanho do bundle Python** | ~262 MB (SciPy + statsmodels — dentro do limite otimizado pela Vercel) |

### Observações sobre o deploy
- O Vercel detecta automaticamente o Next.js em `frontend/` e também constrói a função Python em `api/index.py`.
- O `requirements.txt` usa `uv` para instalação (mais rápido que pip).
- A função Python tem `maxDuration: 30` configurado em `vercel.json`.
- O deploy utiliza `--force` para garantir rebuild completo a cada push.

---

## 9. DecisÃƒÂµes tÃƒÂ©cnicas

1. **Flask em vez de FastAPI** no serverless Vercel (runtime Python ÃƒÂ© WSGI-only).
2. **Dois projetos Vercel** para contornar o conflito Next.js Ãƒâ€” funÃƒÂ§ÃƒÂµes Python em `/api`.
3. **Chamadas relativas `/api/...`** no frontend; proxy cuida do destino.
4. **Backend canÃƒÂ´nico ÃƒÂºnico** em `api-server/` (sem duplicar Python no frontend).
5. **IC com `norm.ppf(1 - alpha/2)`** (nÃƒÂ£o z fixo 1.96).
6. **Labels PT-BR** no status (`Vencedor` / `Inconclusivo` / `Efeito Fraco`) e campo `alpha_ajustado`.

---

## 7. Fluxo de Uso

- Motor de decisÃƒÂ£o em **trÃƒÂªs estados**, nÃƒÂ£o binÃƒÂ¡rio ganhou/perdeu.
- Guardrail de **relevÃƒÂ¢ncia prÃƒÂ¡tica (MPE)** alÃƒÂ©m do p-valor.
- CorreÃƒÂ§ÃƒÂ£o de **Bonferroni** explÃƒÂ­cita na UI e no relatÃƒÂ³rio.
- RelatÃƒÂ³rio copiÃƒÂ¡vel pronto para comunicaÃƒÂ§ÃƒÂ£o de produto/dados.
- EstatÃƒÂ­stica testada (16 pytest) e API validada em produÃƒÂ§ÃƒÂ£o.

---

## 11. LimitaÃƒÂ§ÃƒÂµes

- Stateless: sem histÃƒÂ³rico de experimentos nem autenticaÃƒÂ§ÃƒÂ£o.
- Um ÃƒÂºnico endpoint de mÃƒÂ©trica (proporÃƒÂ§ÃƒÂµes / conversÃƒÂ£o).
- URL do frontend ainda genÃƒÂ©rica (`frontend-gamma-blush-15`); renomear projeto Vercel ÃƒÂ© opcional.
- Sem modo bayesiano, sequential testing ou multi-mÃƒÂ©trica.
- `docs/capabilities.md` e `PLAN.md` ainda citam FastAPI/arquitetura antiga (dÃƒÂ©bito documental residual).
- Warning conhecido do statsmodels em z-test com 0 conversÃƒÂµes (tratado; nÃƒÂ£o quebra).

---

## 12. PrÃƒÂ³ximos passos recomendados

1. (Opcional) Renomear projeto Vercel `frontend` Ã¢â€ â€™ `statlab-experiments` para URL limpa.
2. Commitar o trabalho local (remoÃƒÂ§ÃƒÂ£o de `backend/`, `api-server/`, limpeza do frontend).
3. Atualizar `docs/capabilities.md` e `PLAN.md` para Flask + dois projetos.
4. Presets de cenÃƒÂ¡rio no Planejar; duraÃƒÂ§ÃƒÂ£o estimada por trÃƒÂ¡fego diÃƒÂ¡rio.
5. VisualizaÃƒÂ§ÃƒÂ£o da largura do IC; modo bayesiano / sequential warnings (roadmap).

---

## 13. Metadados prontos para o portfÃƒÂ³lio

```yaml
slug: statlab-experiments
title: StatLab Experiments
tagline: Planejamento e interpretaÃƒÂ§ÃƒÂ£o de testes A/B com rigor estatÃƒÂ­stico
short_description: >
  Ferramenta web frequentista para planejar tamanho amostral, analisar
  proporÃƒÂ§ÃƒÂµes A/B e interpretar resultados com guardrails de relevÃƒÂ¢ncia prÃƒÂ¡tica.
long_description: >
  StatLab Experiments transforma estatÃƒÂ­stica frequentista em uma interface
  clara para Product Engineers, Data Analysts e PMs. Calcula sample size,
  executa z-test de proporÃƒÂ§ÃƒÂµes com IC e Bonferroni, e classifica o resultado
  em Vencedor, Inconclusivo ou Efeito Fraco Ã¢â‚¬â€ separando significÃƒÂ¢ncia
  estatÃƒÂ­stica de impacto de negÃƒÂ³cio.
role: Full-stack (Next.js + Flask) Ã‚Â· EstatÃƒÂ­stica aplicada
stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Flask
  - SciPy
  - statsmodels
  - Vercel
category: Produto de dados / ExperimentaÃƒÂ§ÃƒÂ£o
status: MVP em produÃƒÂ§ÃƒÂ£o
demo_url: https://statlab-ab.vercel.app
repo_url: https://github.com/BarujaFe1/StatLab-Experiments
api_url: https://statlab-experiments-api.vercel.app
year: 2026
highlights:
  - Motor de decisÃƒÂ£o em 3 estados
  - Guardrail de relevÃƒÂ¢ncia prÃƒÂ¡tica (MPE)
  - Deploy dual Vercel (Next + Flask WSGI)
  - SuÃƒÂ­te pytest da API (16 testes)
```

---

## 14. SugestÃƒÂ£o de card (seÃƒÂ§ÃƒÂ£o de projetos)

**TÃƒÂ­tulo:** StatLab Experiments  

**SubtÃƒÂ­tulo / uma linha:**  
Planeje e interprete testes A/B com rigor frequentista e decisÃƒÂ£o acionÃƒÂ¡vel.

**Tags sugeridas:** Next.js Ã‚Â· Flask Ã‚Â· SciPy Ã‚Â· ExperimentaÃƒÂ§ÃƒÂ£o Ã‚Â· TypeScript  

**CTAs:**
- Demo Ã¢â€ â€™ `https://statlab-ab.vercel.app`
- GitHub Ã¢â€ â€™ `https://github.com/BarujaFe1/StatLab-Experiments`

**Imagem:** screenshot da aba Analisar com status Ã¢â‚¬Å“VencedorÃ¢â‚¬Â, grÃƒÂ¡fico A/B e card de decisÃƒÂ£o (desktop). Se ainda nÃƒÂ£o houver asset, usar placeholder coerente com o grid atual do portfÃƒÂ³lio atÃƒÂ© capturar a tela.

**PosiÃƒÂ§ÃƒÂ£o sugerida:** entre produtos analÃƒÂ­ticos / dados (prÃƒÂ³ximo a DataFlow / Maestro), destacando o eixo estatÃƒÂ­stica aplicada.

---

## 15. SugestÃƒÂ£o de case (texto editorial)

### Problema
Times de produto leem testes A/B de forma superficial: confiam sÃƒÂ³ no p-valor, param cedo e tratam qualquer Ã¢â‚¬Å“significativoÃ¢â‚¬Â como vitÃƒÂ³ria operacional.

### Abordagem
ConstruÃƒÂ­ uma ferramenta stateless que une planejamento (sample size) e anÃƒÂ¡lise (z-test + IC + Bonferroni + MPE) numa UI ÃƒÂºnica, com interpretaÃƒÂ§ÃƒÂ£o automÃƒÂ¡tica em trÃƒÂªs estados.

### Desafio tÃƒÂ©cnico
O runtime Python da Vercel ÃƒÂ© WSGI-only e o preset Next.js captura `/api/*`. A soluÃƒÂ§ÃƒÂ£o foi Flask serverless em projeto separado + rewrite do Next via `API_BACKEND_URL`.

### Resultado
MVP em produÃƒÂ§ÃƒÂ£o com API validada, frontend tipado, 16 testes automatizados e fluxo completo Planejar Ã¢â€ â€™ Analisar Ã¢â€ â€™ Copiar relatÃƒÂ³rio Ã¢â‚¬â€ pronto como case de estatÃƒÂ­stica aplicada + engenharia full-stack.

### Aprendizados
- Separar significÃƒÂ¢ncia estatÃƒÂ­stica de relevÃƒÂ¢ncia prÃƒÂ¡tica muda a qualidade da decisÃƒÂ£o.
- Deploy Ã¢â‚¬Å“simplesÃ¢â‚¬Â em Vercel exige arquitetura explÃƒÂ­cita quando Next e Python compartilham o namespace `/api`.
