<div align="center">
  <img src="./icon.png" alt="StatLab Experiments Logo" width="120" height="120" />

  <h1>StatLab Experiments</h1>

  <p><strong>Planeje e interprete testes A/B com rigor frequentista — e saiba quando o "vencedor" ainda não merece rollout.</strong></p>

  <p>
    <a href="https://statlab-ab.vercel.app">Demo</a> ·
    <a href="https://github.com/BarujaFe1/StatLab-Experiments">GitHub</a> ·
    <a href="https://barujafe.vercel.app/">Portfólio</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-MVP%20em%20produ%C3%A7%C3%A3o-0f766e.svg" alt="Status" />
    <img src="https://img.shields.io/badge/Frontend-Next.js%2016-black.svg?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-Flask%20WSGI-009688.svg?logo=flask" alt="Flask" />
    <img src="https://img.shields.io/badge/Stats-SciPy%20%2B%20statsmodels-7C3AED.svg" alt="Stats" />
  </p>
</div>

---

## Screenshot

> Abra a [demo](https://statlab-ab.vercel.app), carregue a demonstração na aba **Analisar** e capture o card **Vencedor** + gráfico A/B. Salve em `docs/screenshot-analyze.png` quando disponível.

![StatLab logo](./icon.png)

---

## Problema real

Times de produto leem testes A/B de forma superficial: confiam só no p-valor, param cedo e tratam qualquer resultado "significativo" como vitória operacional. Falta um ambiente simples que una **planejamento amostral**, **inferência frequentista** e **relevância prática**.

## Solução

**StatLab Experiments** é uma ferramenta web stateless que:

1. calcula o tamanho amostral (Cohen's *h* + poder);
2. analisa duas proporções com z-test, IC e Bonferroni;
3. classifica o resultado em **Vencedor**, **Inconclusivo** ou **Efeito Fraco** (MPE);
4. gera um relatório copiável para Slack/Notion/Jira.

## Funcionalidades

- Aba **Planejar** — baseline, MDE → `n` por grupo
- Aba **Analisar** — visitantes/conversões, alpha, comparações, MPE
- Motor de decisão em 3 estados
- Demo one-click + copiar relatório
- Toasts de erro (validação + rede)
- Deploy dual na Vercel (Next + Flask)

## Arquitetura

```txt
Browser → Next.js (statlab-experiments)
              │  rewrite /api/*
              ▼
         Flask WSGI (statlab-experiments-api)
```

Detalhes: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Sonner |
| Backend | Python 3.12, Flask, SciPy, statsmodels, NumPy |
| Deploy | Vercel (2 projetos) |
| Qualidade | ESLint, `tsc`, pytest, GitHub Actions |

## Demo

- **Produção:** https://statlab-ab.vercel.app
- **API:** https://statlab-experiments-api.vercel.app/api/health

> Nota: o alias `statlab-experiments.vercel.app` ficou preso a um projeto antigo de outro scope; use **statlab-ab.vercel.app**.

## Rodar localmente

### Windows (rápido)

```bash
start.bat
```

### Manual

```bash
# Backend
cd api-server
pip install -r requirements.txt
python api/index.py

# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

Abra http://localhost:3000

## Variáveis de ambiente

Veja [`.env.example`](./.env.example). Em produção, o frontend precisa de:

```txt
API_BACKEND_URL=https://statlab-experiments-api.vercel.app
```

## Testes

```bash
python -m pytest api-server/api/tests -q

cd frontend
npm run lint
npm run typecheck
npm run build
```

Mais: [`docs/TESTING.md`](./docs/TESTING.md)

## Decisões técnicas

- Flask (WSGI) em vez de FastAPI no serverless Vercel
- Dois projetos Vercel para evitar conflito Next × `/api`
- Chamadas relativas `/api/...` + rewrite
- Decisão em 3 estados + MPE

Trade-offs: [`docs/TECHNICAL_DECISIONS.md`](./docs/TECHNICAL_DECISIONS.md)

## Roadmap

- [ ] Modo bayesiano
- [ ] Alertas de sequential testing / peeking
- [ ] Histórico de experimentos
- [ ] Export PDF / link compartilhável
- [ ] Multi-métrica + SRM guardrails

## Status

**MVP em produção** — adequado como case de portfólio (estatística aplicada + full-stack). Sem auth/DB; API pública de demonstração.

## O que este projeto demonstra

- Estatística frequentista aplicada (poder, z-test, IC, Bonferroni, MPE)
- Backend científico em Python empacotado para serverless WSGI
- Frontend tipado com UX de decisão (não só "tabela de p-valores")
- Arquitetura de deploy consciente dos limites da Vercel
- Testes automatizados da API + CI

## Como eu apresentaria em entrevista

> "Construí um sandbox de A/B testing que força a conversa certa: amostra suficiente, significância ajustada e relevância prática. O desafio de engenharia foi fazer SciPy/statsmodels rodarem bem no runtime Python da Vercel sem conflitar com o App Router — por isso separei Flask em um projeto e usei rewrite no Next."

## Autor

**Felipe Alirio Baruja (BarujaFe1)** · [Portfólio](https://barujafe.vercel.app/) · [GitHub](https://github.com/BarujaFe1)

## Licença

A definir.
