<div align="center">
  <img src="./icon.png" alt="StatLab Experiments Logo" width="120" height="120" />

  <h1>StatLab Experiments</h1>

  <p><strong>Planejamento e interpretação de testes A/B com rigor estatístico e clareza visual</strong></p>
  <p><strong>Plan and interpret A/B tests with statistical rigor and visual clarity</strong></p>

  <p>
    <a href="#pt-br">PT-BR</a> •
    <a href="#en">English</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start--início-rápido">Quick Start</a> •
    <a href="#estatística--statistics">Estatística</a> •
    <a href="#autor--author">Autor</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-MVP-orange.svg" alt="Status MVP" />
    <img src="https://img.shields.io/badge/Interface-Web%20App-blue.svg" alt="Interface Web App" />
    <img src="https://img.shields.io/badge/Frontend-Next.js-black.svg?logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Flask-009688.svg?logo=flask&logoColor=white" alt="Flask" />
    <img src="https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white" alt="Python 3.11+" />
    <img src="https://img.shields.io/badge/Statistics-Frequentist-7C3AED.svg" alt="Frequentist Statistics" />
  </p>
</div>

---

<a id="pt-br"></a>

## 🇧🇷 PT-BR

## 📊 Visão geral

**StatLab Experiments** é uma ferramenta analítica de alta fidelidade para **planejamento, análise e interpretação de testes A/B**.

O projeto transforma conceitos de estatística frequentista em uma interface limpa, objetiva e visualmente premium, permitindo que Product Engineers, Data Analysts, Product Managers e times de crescimento tomem decisões com mais clareza durante ciclos de experimentação.

A proposta é unir três pilares:

- **rigor estatístico** para evitar conclusões precipitadas;
- **clareza visual** para facilitar a interpretação;
- **decisão acionável** para transformar resultados em próximos passos.

> **Objetivo:** reduzir a distância entre teoria estatística e decisão prática em experimentos de produto.

---

## 🎯 Problema que resolve

Testes A/B são comuns em produtos digitais, mas muitas decisões ainda são tomadas com base em leitura superficial de métricas. Isso pode gerar falsos vencedores, encerramento precoce de experimentos, confusão entre significância estatística e impacto prático, além de relatórios inconsistentes entre times.

O **StatLab Experiments** foi criado para atacar esses problemas com uma experiência simples, visual e tecnicamente consistente.

---

## ✨ Funcionalidades principais

### 🧪 Planejamento de experimentos

- Cálculo de tamanho de amostra.
- Configuração de conversão base.
- Definição de MDE, alpha e poder estatístico.
- Apoio ao planejamento antes da execução do teste.
- Redução do risco de experimentos subdimensionados.

### 📈 Análise estatística

- Teste frequentista para proporções.
- Z-test para comparação entre grupos A/B.
- Cálculo de diferença absoluta e relativa.
- Interpretação automática do resultado.
- Separação clara entre resultado estatístico e decisão prática.

### 🧠 Motor de decisão em três estados

O sistema classifica o resultado do experimento em três estados principais:

- **Winner Probable:** há sinal estatístico e efeito relevante.
- **Inconclusive:** não há evidência suficiente para uma decisão forte.
- **Weak Effect:** há sinal, mas o impacto prático pode ser insuficiente.

Essa estrutura ajuda a evitar decisões binárias simplistas do tipo “ganhou” ou “perdeu”.

### 🛡️ Guardrails de significância prática

- Diferencia significância estatística de relevância de negócio.
- Ajuda a identificar efeitos pequenos demais para justificar rollout.
- Evita que uma melhora estatisticamente detectável seja tratada automaticamente como vitória operacional.

### 📝 Reporting profissional

- Geração rápida de relatórios.
- Texto pronto para Slack, Jira, Notion ou documentação interna.
- Padronização da comunicação entre produto, engenharia e dados.
- Menos tempo gasto reescrevendo interpretações.

---

## 🧩 Casos de uso

- Planejar um teste A/B antes do lançamento.
- Validar se uma mudança de produto gerou impacto real.
- Comparar conversões entre variante controle e variante teste.
- Documentar decisões em ciclos de experimentação.
- Criar relatórios rápidos para squads, stakeholders ou gestão.
- Treinar leitura crítica de resultados estatísticos.

---

<a id="en"></a>

## 🇺🇸 English

## 📊 Overview

**StatLab Experiments** is a high-fidelity analytical tool for **planning, analyzing and interpreting A/B tests**.

The project transforms frequentist statistical concepts into a clean, actionable and visually premium interface, helping Product Engineers, Data Analysts, Product Managers and growth teams make clearer decisions during experimentation cycles.

It combines three core principles:

- **statistical rigor** to avoid premature conclusions;
- **visual clarity** to improve interpretation;
- **actionable decision support** to turn results into next steps.

> **Goal:** reduce the gap between statistical theory and practical product decisions.

---

## 🎯 Problem solved

A/B tests are common in digital products, but many decisions are still made based on superficial metric reading. This can lead to false winners, early stopping, confusion between statistical significance and practical impact, and inconsistent reporting across teams.

**StatLab Experiments** addresses these issues with a simple, visual and technically consistent experience.

---

## ✨ Key capabilities

### 🧪 Experiment planning

- Sample size calculation.
- Baseline conversion configuration.
- MDE, alpha and statistical power settings.
- Planning support before running the test.
- Lower risk of underpowered experiments.

### 📈 Statistical analysis

- Frequentist testing for proportions.
- Z-test for A/B group comparison.
- Absolute and relative difference calculation.
- Automated result interpretation.
- Clear separation between statistical result and practical decision.

### 🧠 Three-state decision engine

The system classifies experiment outcomes into three main states:

- **Winner Probable:** statistical signal and relevant effect.
- **Inconclusive:** insufficient evidence for a strong decision.
- **Weak Effect:** signal exists, but the practical impact may be too small.

This prevents oversimplified binary decisions such as “won” or “lost”.

### 🛡️ Practical significance guardrails

- Distinguishes statistical significance from business relevance.
- Helps detect effects that are too small to justify rollout.
- Prevents statistically detectable improvements from being automatically treated as operational wins.

### 📝 Professional reporting

- Quick report generation.
- Copy-ready text for Slack, Jira, Notion or internal documentation.
- Standardized communication across product, engineering and data teams.
- Less time spent rewriting interpretations.

---

## 🧩 Use cases

- Plan an A/B test before launch.
- Validate whether a product change created measurable impact.
- Compare conversions between control and treatment variants.
- Document decisions across experimentation cycles.
- Create quick reports for squads, stakeholders or leadership.
- Train critical reading of statistical results.

---

<a id="tech-stack"></a>

## 🛠 Tech Stack

### Frontend

- **Next.js** — App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Recharts**

### Backend

- **Flask** (WSGI — compatível com funções serverless da Vercel)
- **Python 3.11+**
- **SciPy**
- **statsmodels**
- Stateless API architecture

### Design

- Minimalist interface
- High-typography focus
- Apple-esque restraint
- Premium analytical dashboard aesthetics
- Visual hierarchy optimized for decision-making

---

## 📁 Project Structure / Estrutura do projeto

```txt
statlab-experiments/
├── frontend/                   # Next.js (Vercel project: frontend)
│   ├── app/                    # App Router
│   │   ├── layout.tsx
│   │   └── page.tsx            # UI principal (Planejar / Analisar)
│   ├── next.config.ts          # Rewrite /api/* -> API_BACKEND_URL
│   └── package.json
│
├── api-server/                 # Flask WSGI (Vercel project: statlab-experiments-api)
│   ├── api/
│   │   ├── index.py            # Backend canônico (produção)
│   │   └── tests/              # Suíte pytest (16 testes)
│   ├── conftest.py
│   └── requirements.txt        # flask, scipy, statsmodels, numpy
│
├── start.bat                   # Bootstrap local (Windows)
├── README.md
└── .gitignore
```

> Em produção: dois projetos Vercel. O frontend faz proxy de `/api/*` para `API_BACKEND_URL` (api-server).

---

<a id="quick-start--início-rápido"></a>

## 🚀 Quick Start / Início rápido

### Requirements / Pré-requisitos

- Python 3.11+
- Node.js 18+
- npm, pnpm or yarn
- Windows PowerShell or terminal

### Option 1 — Automatic startup / Inicialização automática

Run the bootstrap script in the project root:

```bash
start.bat
```

The script should:

1. Install frontend dependencies (if needed).
2. Install backend dependencies from `api-server/requirements.txt`.
3. Start the Flask backend (`api-server/api/index.py` on port 5000).
4. Start the Next.js frontend (proxies `/api/*` to the Flask API).

Open:

```txt
http://localhost:3000
```

### Option 2 — Manual startup / Inicialização manual

#### Backend (API Flask)

```bash
cd api-server
pip install -r requirements.txt
python api/index.py
```

A API sobe em `http://127.0.0.1:5000` e o Next.js faz proxy de `/api/*` para ela em desenvolvimento (via `next.config.ts`).

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

<a id="estatística--statistics"></a>

## 📐 Estatística / Statistics

### Experiment planning

The planning module estimates sample size based on:

- baseline conversion rate;
- minimum detectable effect;
- alpha level;
- desired statistical power.

### Analysis

The analysis module compares two proportions using a frequentist approach.

Typical inputs:

- control visitors;
- control conversions;
- treatment visitors;
- treatment conversions;
- alpha;
- minimum practical effect.

Typical outputs:

- conversion rates;
- absolute lift;
- relative lift;
- p-value;
- confidence interval;
- statistical significance;
- practical significance;
- decision state;
- human-readable interpretation.

---

## 🧠 Decision framework / Estrutura de decisão

```txt
Statistically significant + practically relevant
→ Winner Probable

Not statistically significant
→ Inconclusive

Statistically significant + practically weak
→ Weak Effect
```

This decision layer is designed to prevent misuse of p-values and to make experimentation results easier to communicate.

---

## 📝 Report example / Exemplo de relatório

```txt
Experiment result: Inconclusive

The treatment variant showed a positive lift, but the result did not reach the configured statistical significance threshold. Based on the current sample size and observed effect, there is not enough evidence to recommend rollout.

Recommended next step: continue collecting data or redesign the experiment with a larger expected effect.
```

---

## 🧪 Quality / Qualidade

Recommended validation layers:

- Unit tests for statistical functions.
- API tests for Flask endpoints.
- Frontend validation for form inputs.
- Snapshot or component tests for decision cards.
- Manual validation with known statistical examples.

```bash
# Backend tests
python -m pytest api-server/api/tests

# Frontend checks
cd frontend
npm run lint
npm run typecheck
npm run build
```

---

## 🛡️ Responsible usage / Uso responsável

StatLab Experiments is a decision-support tool, not a replacement for analytical judgment.

Before acting on an experiment result:

- Check whether the experiment ran long enough.
- Confirm that traffic allocation was correct.
- Review instrumentation and event tracking.
- Avoid peeking and stopping tests prematurely.
- Consider practical impact, not only p-values.
- Document assumptions and limitations.

---

## 🚧 Roadmap

- [ ] Bayesian interpretation mode
- [ ] Sequential testing warnings
- [ ] Experiment history
- [ ] Export as PDF
- [ ] Shareable report links
- [ ] Multi-metric experiments
- [ ] Guardrails for sample ratio mismatch
- [ ] Power curve visualization
- [ ] Minimum practical effect presets
- [ ] Integration with analytics tools

---

<a id="autor--author"></a>

## 👤 Autor / Author

Developed by **BarujaFe1**.

- **Portfolio:** [https://barujafe.vercel.app/](https://barujafe.vercel.app/)
- **GitHub:** [github.com/BarujaFe1](https://github.com/BarujaFe1/)
- **Repository:** [github.com/BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments)
- **LinkedIn:** [linkedin.com/in/barujafe](https://www.linkedin.com/in/barujafe/)

---

## 📄 License / Licença

License to be defined.

Licença a definir.

---

<div align="center">
  <p><strong>StatLab Experiments</strong></p>
  <p>Statistical rigor for faster, clearer and safer product decisions.</p>
  <p><em>Rigor estatístico para decisões de produto mais rápidas, claras e seguras.</em></p>
</div>
