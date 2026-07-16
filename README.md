<div align="center">
  <img src="./icon.png" alt="StatLab Experiments Logo" width="120" height="120" />

  <h1>StatLab Experiments</h1>

  <p><strong>Planeje e interprete testes A/B com z-test, Bonferroni e motor de decisão em 3 estados.</strong></p>
  <p><strong>Plan and interpret A/B tests with z-test, Bonferroni and a 3-state decision engine.</strong></p>

  <p>
    <a href="#pt-br">PT-BR</a>
     · 
    <a href="#english">English</a>
     · 
    <a href="#live-demo">Live Demo</a>
     · 
    <a href="#stack">Stack</a>
     · 
    <a href="#architecture">Architecture</a>
     · 
    <a href="#quick-start">Quick Start</a>
     · 
    <a href="#author">Author</a>
  </p>

  <p>
    <img alt="Next.js-16" src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img alt="Flask" src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
    <img alt="SciPy" src="https://img.shields.io/badge/SciPy-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white" />
    <img alt="Status-MVP" src="https://img.shields.io/badge/Status-MVP-0f766e?style=for-the-badge" />
    <img alt="License-MIT" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  </p>

  <p>
    <a href="https://statlab-experiments.vercel.app"><strong>Live Demo</strong></a>
     · 
    <a href="https://github.com/BarujaFe1/StatLab-Experiments"><strong>Repo</strong></a>
     · 
    <a href="https://barujafe.vercel.app/"><strong>Portfolio</strong></a>
     · 
    <a href="https://www.linkedin.com/in/barujafe/"><strong>LinkedIn</strong></a>
  </p>
</div>


> **Stats lab notice:** frequentist helpers for **two-proportion** experiments. Decision states (Winner / Inconclusive / Weak Effect) are **pedagogical decision-support** — not automatic product rollout authority.

---

## PT-BR

### Visão geral
O **StatLab Experiments** calcula tamanho amostral (Cohen's *h* + poder), analisa duas proporções (z-test) e classifica o resultado em **Vencedor / Inconclusivo / Efeito fraco**, com correção de Bonferroni quando aplicável.

### Problema
Times leem A/B só pelo p-valor, param cedo e tratam qualquer “significativo” como vitória operacional — sem poder, tamanho de efeito nem relevância prática.

### Para quem
PMs, analistas e data scientists que precisam de um cockpit simples de **planejamento + interpretação** frequentista.

### Funcionalidades
- Planejamento de tamanho amostral
- Análise de duas proporções (z-test) via API Flask + SciPy/statsmodels
- Motor de decisão em 3 estados
- Cenários/chips de demonstração na UI Next.js
- `start.bat` para subir o lab no Windows

### Escopo e limites (honestos)
- Foco em **proporções / A/B binário** — não é suite completa de experimentação
- Não substitui design de experimento, SRM checks nem sequential testing avançado
- Decisão do motor é apoio — rollout continua humano

---

## English

### Overview
**StatLab Experiments** plans sample size (Cohen's *h* + power), analyzes two proportions (z-test) and classifies outcomes as **Winner / Inconclusive / Weak Effect**, with Bonferroni when applicable.

### Problem
Teams read A/B tests from p-values alone, stop early and treat any “significant” result as an operational win — without power, effect size or practical relevance.

### Who it is for
PMs, analysts and data scientists who need a simple **plan + interpret** frequentist cockpit.

### Features
- Sample-size planning
- Two-proportion analysis (z-test) via Flask API + SciPy/statsmodels
- 3-state decision engine
- Demo scenarios/chips in the Next.js UI
- Windows `start.bat` for local lab bring-up

### Scope and honest limits
- Focused on **binary A/B proportions** — not a full experimentation suite
- Does not replace experiment design, SRM checks or advanced sequential testing
- Engine output is support — humans still own rollout

---

## Live Demo

| Surface | URL |
|---|---|
| **Public lab** | [https://statlab-experiments.vercel.app](https://statlab-experiments.vercel.app) |
| **GitHub** | see Repo badge above |

**How to try:** plan a sample size → analyze a scenario → compare Winner vs Weak Effect / Inconclusive → read why the state was chosen.



## Screenshots

<table>
  <tr>
    <td width="50%"><img src="./docs/screenshots/01-plan-sample-size.png" alt="Plan sample size" /><br /><sub><strong>Plan sample size</strong></sub></td>
    <td width="50%"><img src="./docs/screenshots/02-analyze-vencedor.png" alt="Analyze — Winner" /><br /><sub><strong>Analyze — Winner</strong></sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="./docs/screenshots/03-analyze-efeito-fraco.png" alt="Weak effect" /><br /><sub><strong>Weak effect</strong></sub></td>
    <td width="50%"><img src="./docs/screenshots/04-scenarios-chips.png" alt="Scenarios" /><br /><sub><strong>Scenarios</strong></sub></td>
  </tr>
</table>



## Stack

| Layer | Technology |
|---|---|
| Web | Next.js 16, React, TypeScript, Tailwind, Recharts |
| API | Flask (WSGI on Vercel), NumPy, SciPy, statsmodels |

---

## Architecture

```txt
frontend/      Next.js UI
api-server/    Flask handlers (`api/index.py`) + tests
docs/          demo script + screenshots
start.bat      local launcher
```

---

## Quick Start

```bash
.\start.bat
```

Manual:

```bash
# API
cd api-server
pip install -r requirements.txt
# run as documented / Vercel-style handler locally

# Web
cd frontend
npm install
npm run dev
```

---

## Technical decisions

- **3-state engine** to separate statistical win from weak/practical effect
- **Flask on Vercel** for a slim stats endpoint next to Next.js
- Teach **Bonferroni / power** instead of p-value-only screenshots

---

## Roadmap

- More educational scenarios and guardrails (SRM messaging)
- Exportable analysis memo
- Broader test families beyond two proportions

---

## Author

**Felipe Alirio Baruja** — data / product / full-stack portfolio.

- Portfolio: [https://barujafe.vercel.app/](https://barujafe.vercel.app/)
- GitHub: [https://github.com/BarujaFe1](https://github.com/BarujaFe1)
- LinkedIn: [https://www.linkedin.com/in/barujafe/](https://www.linkedin.com/in/barujafe/)


## License

MIT — see [`LICENSE`](./LICENSE).
