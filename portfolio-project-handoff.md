# StatLab Experiments — Documento de Handoff para Portfólio

---

## 1. Identificação do Projeto

| Campo | Valor |
|---|---|
| **Nome oficial** | StatLab Experiments |
| **Tipo de projeto** | Aplicação web full-stack (Next.js + FastAPI via Vercel Services, mesmo domínio) |
| **Objetivo principal** | Planejamento e interpretação de testes A/B com rigor estatístico, correção de Bonferroni e motor de decisão em 3 estados (Winner / Inconclusive / Weak Effect) |
| **Status atual** | Publicado, funcional e validado |
| **URL de produção** | [https://frontend-gamma-blush-15.vercel.app](https://frontend-gamma-blush-15.vercel.app) |
| **Repositório** | [https://github.com/BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments) |
| **Contexto de criação** | Projeto de portfólio pessoal para demonstrar competências em estatística frequentista, inferência, análise de dados, frontend moderno (Next.js 16), backend Python serverless (FastAPI) e deploy integrado no ecossistema Vercel. |

---

## 2. Resumo Executivo

**StatLab Experiments** é uma ferramenta analítica para planejamento, análise e interpretação de testes A/B. Diferente de plataformas de experimentação comerciais, o StatLab é um ambiente de estudo e demonstração que expõe o funcionamento interno da estatística frequentista com transparência total.

### O que entrega:
- **Cálculo de tamanho amostral** baseado em Cohen's *h* e `NormalIndPower` do statsmodels.
- **Z-test para duas proporções** com correção de Bonferroni para múltiplas comparações.
- **Motor de decisão em 3 estados**: Winner / Inconclusive / Weak Effect.
- **Interpretação textual automática** em português com explicação do resultado.
- **Botão de demonstração** que carrega dados fictícios e executa todo o pipeline automaticamente.

### Público-alvo:
Recrutadores, engenheiros de dados, analistas, cientistas de dados e clientes que queram avaliar capacidade técnica em: estatística aplicada, Python científico, APIs REST, frontend React/Next.js, deploy serverless e visualização de dados.

### Problema resolvido:
Testes A/B são comuns em produtos digitais, mas decisões ainda são tomadas com base em leitura superficial de métricas. O StatLab ataca isso com:
- Rigor estatístico (Bonferroni, poder estatístico, IC).
- Clareza visual (gráfico de barras comparativo, cards de decisão coloridos).
- Decisão acionável (3 estados, não binário "ganhou/perdeu").

### Proposta de valor:
Mostrar, em um único site funcional, que o candidato domina **estatística inferencial**, **backend Python científico**, **frontend moderno**, **deploy serverless** e **comunicação de resultados**.

---

## 3. O que foi Construído

### Páginas e seções

#### Página única (`/`)

**Header profissional:**
- Nome "StatLab Experiments"
- Badges de stack: Next.js, TypeScript, FastAPI, SciPy, statsmodels
- Links: `← Portfólio` (para [barujafe.vercel.app](https://barujafe.vercel.app/)), `GitHub ↗` (para o repositório)
- Botão "Carregar dados de demonstração" com ícone de laboratório

**Navegação por tabs:**
- **Planejar** (tamanho amostral)
- **Analisar** (Z-test + classificação)

#### Seção "Planejar" (Cálculo Amostral)
- 4 inputs: Conversão base, MDE (efeito mínimo detectável), Alpha, Poder estatístico
- Botão "Calcular"
- Resultado: "Tamanho amostral sugerido por grupo" com valor numérico formatado (ex: 8.143)

#### Seção "Analisar" (Teste A/B)
- 4 inputs: Visitantes A, Conversões A, Visitantes B, Conversões B
- 2 inputs extras: Alpha, Nº de comparações (Bonferroni)
- Botão "Analisar"
- Botão de demo rápido (ícone de laboratório) na mesma linha
- **Card de resultado:**
  - Status colorido: verde (Winner), âmbar (Weak Effect), cinza (Inconclusive)
  - Interpretação textual em português
  - Métricas: conversão A%, conversão B%, p-value, uplift %, IC com nível ajustado, alpha ajustado
- **Gráfico de barras** comparativo A vs B com Recharts
- **Botão "Copiar relatório"** para área de transferência

### Componentes e interações
- **Toast notifications** via `sonner` para feedback (sucesso, erro)
- **Estado de loading** no botão de demo
- **Inputs controlados** com validação mínima
- **Responsividade** via Tailwind (grid, breakpoints)

### Integrações
- Backend serverless Python em `api/index.py` (FastAPI via Vercel Services)
- Consumo via `fetch` com rotas relativas `/api/*` (sem CORS em produção)
- Rotas: `GET /api/health`, `GET /api/demo`, `POST /api/calculate-sample-size`, `POST /api/analyze`

### Regras de negócio
- Correção de Bonferroni: `alpha_adjusted = alpha / n_comparisons`
- Significância se `p_value < alpha_adjusted`
- CI calculado com `z = norm.ppf(1 - alpha_adjusted/2)`
- Classificação:
  - `p < alpha_adjusted` AND `|diff| > 0.005` → **Winner**
  - `p < alpha_adjusted` AND `|diff| <= 0.005` → **Weak Effect**
  - `p >= alpha_adjusted` → **Inconclusive**

### Diferenciais
- Botão "Carregar dados de demonstração" faz `GET /api/demo`, popula todos os inputs e executa automaticamente o pipeline (sample-size + analyze)
- Toda a UI está em português brasileiro
- O usuário pode alterar o Nº de comparações para ver o Bonferroni em ação (ex: de 1 para 5, a classificação muda de Winner para Inconclusive)

---

## 4. Como foi Construído

### Arquitetura geral

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

| Camada | Tecnologia | Versão |
|---|---|---|
| **Frontend framework** | Next.js | 16.2.4 |
| **Linguagem frontend** | TypeScript | 5.x |
| **UI/Styling** | Tailwind CSS | v4 |
| **Ícones** | lucide-react | ^1.14.0 |
| **Gráficos** | Recharts | 3.8.1 |
| **Toast** | sonner | 2.0.7 |
| **Backend framework** | FastAPI | 0.115.6 |
| **Estatística** | SciPy, statsmodels, NumPy | 1.13 / 0.14 / 1.26 |
| **Validação** | Pydantic | 2.10.3 |
| **Hospedagem** | Vercel (Serverless + Next.js) | — |

### Organização do código

- **Página única**: `app/page.tsx` contém todo o estado, lógica e JSX (arquitetura SPA simplificada para portfólio)
- **Layout**: `app/layout.tsx` com fontes Geist, metadados PT-BR
- **API serverless**: `api/index.py` contém FastAPI + toda a lógica estatística em um arquivo único (sem divisão em módulos para simplicidade do deploy)
- **Config**: `vercel.json` com `rewrites` para rotear `/api/*` ao handler Python

### Estratégia de UI/UX
- **Design minimalista** (Apple-like): fundo slate-50, cards brancos com borda sutil, tipografia limpa
- **Hierarquia visual**: tabs separando planejamento e análise; card de decisão com cor semântica (verde/âmbar/cinza)
- **Feedback imediato**: toasts para erro/sucesso, loading state no botão de demo
- **Responsividade**: layout adaptável com `grid-cols-2` em desktop e empilhamento em mobile

### Decisões de design
- **Tudo em uma página**: para portfólio, uma SPA simplificada é mais impactante que múltiplas rotas
- **API serverless integrada**: o mesmo `vercel.json` roteia `/api/*` para o handler Python, sem necessidade de deploy separado
- **Bonferroni exposto**: o input "Nº de comparações" permite ao recrutador/testador ver a correção em ação, demonstrando domínio técnico

---

## 5. Onde foi Construído e Publicado

| Item | Detalhe |
|---|---|
| **Desenvolvimento** | Ambiente local Windows, PowerShell, Node.js 24, Python 3.12 |
| **Repositório** | GitHub — [BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments) (branch `feat/vercel-site`) |
| **Hospedagem** | Vercel (plano Hobby) |
| **Root directory do projeto Vercel** | `frontend/` |
| **URL de produção** | [https://frontend-gamma-blush-15.vercel.app](https://frontend-gamma-blush-15.vercel.app) |
| **Alias atual** | `frontend-gamma-blush-15.vercel.app` (gerado pelo Vercel) |
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

## 6. Funcionalidades Principais

### 6.1 Cálculo de Tamanho Amostral
- **O quê**: Estima o número mínimo de visitantes por grupo necessário para detectar um efeito com poder estatístico configurado.
- **Como**: Usa Cohen's *h* para proporções e `NormalIndPower.solve_power()` do statsmodels.
- **Inputs**: conversão base, MDE, alpha, poder.
- **Output**: número inteiro de visitantes por grupo.

### 6.2 Z-test com Correção de Bonferroni
- **O quê**: Compara duas proporções (grupo controle vs teste) usando um Z-test bilateral, com alpha ajustado para múltiplas comparações.
- **Como**: `proportions_ztest` do statsmodels + `alpha_adjusted = alpha / n_comparisons`.
- **Inputs**: visitantes e conversões de A e B, alpha, número de comparações.
- **Outputs**: p-value, uplift absoluto e relativo, IC com nível ajustado, significância.

### 6.3 Motor de Decisão em 3 Estados
- **Winner**: Estatisticamente significativo E efeito prático relevante (>0.5 p.p. de diferença absoluta).
- **Weak Effect**: Estatisticamente significativo, mas efeito muito pequeno para justificar rollout.
- **Inconclusive**: Não significativo — mais dados ou efeito maior são necessários.

### 6.4 Demonstração Automática
- Botão "Carregar dados de demonstração" dispara `GET /api/demo`, popula todos os inputs, executa sample-size + analyze e exibe resultado completo.
- Fixture: baseline 0.05, MDE 0.01, visitantes 1000/1000, conversões 50/74, alpha 0.05, n_comparisons=1.

### 6.5 Relatório Copiável
- Botão "Copiar relatório para a área de transferência" gera texto estruturado com todas as métricas.

---

## 7. Fluxo de Uso

1. **Acesso**: Usuário abre a URL de produção.
2. **Header**: Vê nome, badges, links para portfólio e GitHub, e botão de demonstração.
3. **Tab "Planejar"** (padrão):
   - Preenche conversão base, MDE, alpha, poder.
   - Clica "Calcular".
   - Vê o tamanho amostral sugerido.
4. **Tab "Analisar"**:
   - Preenche visitantes e conversões dos grupos A e B.
   - Ajusta alpha e número de comparações (Bonferroni).
   - Clica "Analisar".
   - Vê gráfico de barras comparativo, card de decisão colorido com status, interpretação em PT-BR e métricas detalhadas.
5. **Teste rápido**: Clica "Carregar dados de demonstração" para pular etapas 3-4 e ver tudo automaticamente.
6. **Exploração**: Altera o Nº de comparações de 1 para 5, reanalisa, vê a classificação mudar (Winner → Inconclusive) — demonstrando Bonferroni.
7. **Compartilhamento**: Clica "Copiar relatório" para obter texto formatado.

---

## 8. Stack Técnica

### Frontend
- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript** 5.x
- **Tailwind CSS** v4 (PostCSS)
- **Recharts** 3.8.1 (gráfico de barras)
- **lucide-react** (ícones: FlaskConical, User)
- **sonner** 2.0.7 (toast notifications)

### Backend (Serverless)
- **FastAPI** 0.115.6 (framework web assíncrono)
- **SciPy** 1.13.1 (distribuições normais, valores críticos)
- **statsmodels** 0.14.4 (NormalIndPower, proportions_ztest)
- **NumPy** 1.26.4 (arrays, operações vetorizadas)
- **Pydantic** 2.10.3 (schemas de validação)

### Inferência Estatística
- Z-test bilateral para proporções (proportions_ztest)
- Correção de Bonferroni (alpha / n_comparisons)
- Cohen's *h* para tamanho de efeito
- Cálculo de poder com `NormalIndPower.solve_power`
- Intervalo de confiança com `norm.ppf`

### Hospedagem e Deploy
- **Vercel** (Next.js + Python Serverless Functions)
- `vercel.json` com rewrites e configuração de função
- Build automático com framework detection
- Python `requirements.txt` instalado via `uv`

---

## 9. Decisões de Produto e Design

### Por que estrutura de página única?
Projetos de portfólio devem ser imediatamente compreensíveis. Uma SPA com duas tabs (Planejar / Analisar) evita navegação complexa e permite que o recrutador veja tudo em segundos.

### Por que backend serverless integrado ao frontend?
Elimina a necessidade de manter dois deploys separados. O Vercel constrói Next.js e Python no mesmo pipeline. A URL é única, e o roteamento `/api/*` funciona sem CORS em produção.

### Por que Bonferroni exposto como input?
O objetivo não é apenas fazer o cálculo funcionar, mas educar e demonstrar domínio técnico. O usuário pode aumentar o Nº de comparações e ver a classificação mudar — isso mostra compreensão de inferência além do básico.

### Por que UI em português?
O público-alvo (recrutadores brasileiros, clientes BR) é atendido no idioma nativo. As classificações (Winner / Inconclusive / Weak Effect) foram mantidas em inglês porque são termos técnicos padronizados.

### Por que Tailwind CSS v4 e não um design system?
Projetos de portfólio devem carregar rápido e demonstrar habilidade com CSS moderno. Tailwind v4 com PostCSS é leve, produtivo e produz resultados visualmente consistentes sem dependências pesadas.

### Compromissos aceitos
- A página é server-side rendered (Next.js) mas o estado é client-side (SPA).
- O bundle Python é grande (~262 MB) devido ao SciPy + statsmodels; a Vercel otimiza mas o cold start pode levar alguns segundos.
- Sem banco de dados, sem autenticação, sem persistência — o projeto é deliberadamente stateless.

---

## 10. Diferenciais para Portfólio

### Competências demonstradas
- **Estatística frequentista**: teste de hipóteses, poder, tamanho de efeito, correção de múltiplas comparações.
- **Python científico**: SciPy, statsmodels, NumPy — cálculo real servido via API.
- **FastAPI + serverless**: API REST com Pydantic, deploy via Vercel Services no mesmo domínio.
- **Next.js 16 + React 19**: App Router, server components, client components, hooks.
- **TypeScript**: tipos, interfaces, tipagem estrita.
- **UI/UX**: design minimalista, feedback visual, responsividade.
- **Deploy integrado**: Next.js + Python no mesmo pipeline Vercel.

### Complexidade envolvida
- Integração de runtime Python com frontend JavaScript no mesmo deploy Vercel (Services).
- Lógica de inferência com correção de Bonferroni, cálculo de poder, IC ajustado.
- Gerenciamento de estado React com múltiplos inputs e chamadas assíncronas sequenciais.
- Construção de um motor de decisão não-binário (3 estados).

### Maturidade técnica
- Código limpo, sem warnings, sem any types.
- Lint e build passam sem erros.
- Deploy reproduzível via Vercel CLI.
- Documentação completa (README, docs, este handoff).

### Valor visual
- Cards com cores semânticas (verde/âmbar/cinza).
- Gráfico Recharts responsivo.
- Badges de stack no header.
- Layout limpo e arejado (Apple-like).

### Valor de produto
- Resolve um problema real (interpretação de A/B tests).
- Inclui guardrails contra falsos positivos (Bonferroni, efeito prático).
- Gera relatório copiável — utilidade imediata.

### Relevância para recrutadores/clientes
- Mostra capacidade de construir um produto funcional do zero.
- Combina estatística, engenharia e design.
- O deploy está vivo e testável em 5 segundos.
- O repositório demonstra commits, organização e documentação.

---

## 11. Limitações Atuais

- **Cold start da função Python**: o bundle SciPy + statsmodels (~262 MB) pode levar 2-3 segundos para a primeira requisição após inatividade.
- **Sem persistência**: o estado é perdido ao recarregar a página (stateless por design).
- **Página única**: toda a lógica está em um componente; para projetos maiores, uma separação em módulos seria necessária.
- **Bonferroni unilateral**: o input permite apenas correção global (não há suporte a detalhamento por hipótese).
- **Sem visualização de poder vs tamanho amostral**: não há gráfico de curva de poder.
- **Apenas teste para proporções**: não há suporte a métricas contínuas (médias, receita).
- **CI assintótico normal**: usa aproximação normal, que pode ser imprecisa para amostras pequenas ou taxas próximas de 0/1.

---

## 12. Próximos Passos Possíveis

- [ ] Adicionar gráfico de curva de poder (power vs sample size)
- [ ] Suporte a métricas contínuas (t-test, Mann-Whitney)
- [ ] Modo bayesiano opcional (Beta-Binomial)
- [ ] Histórico de análises (salvar no localStorage)
- [ ] Exportar PDF do relatório
- [ ] Dark mode
- [ ] Testes unitários (pytest para backend, Vitest para frontend)
- [ ] Pipeline CI/CD (GitHub Actions)
- [ ] Domínio personalizado (ex: statlab.barujafe.dev)

---

## 13. Metadados Prontos para Portfólio

| Campo | Valor |
|---|---|
| **Nome do projeto** | StatLab Experiments |
| **Subtítulo** | Planejamento e interpretação de testes A/B |
| **Descrição curta** | Ferramenta para planejar e interpretar testes A/B com Z-test, Bonferroni e motor de decisão em 3 estados (Winner / Inconclusive / Weak Effect). |
| **Descrição média** | O StatLab Experiments é uma ferramenta analítica que calcula tamanho amostral, executa Z-test com correção de Bonferroni e classifica o resultado como Winner, Inconclusive ou Weak Effect. Útil para aprender inferência na prática, simular riscos de falso positivo e comunicar limitações estatísticas com transparência. |
| **Descrição longa** | StatLab Experiments é um ambiente de estudo e demonstração de testes A/B com rigor estatístico. O projeto oferece cálculo de tamanho amostral baseado em Cohen's h e NormalIndPower, Z-test bilateral para proporções com correção de Bonferroni, e um motor de decisão em três estados que evita a simplificação binária "ganhou/perdeu". A interface em português com gráfico comparativo e card de decisão colorido facilita a interpretação. O backend serverless Python (FastAPI) roda no mesmo deploy Vercel que o frontend Next.js 16, demonstrando integração full-stack real em produção. |
| **Lista de tecnologias** | Next.js 16, TypeScript, Tailwind CSS, FastAPI, Python, SciPy, statsmodels, NumPy, Pydantic, Recharts, Vercel |
| **Categoria** | Estatística & Experimentação |
| **Status** | Publicado e funcional |
| **Link de demo** | [https://frontend-gamma-blush-15.vercel.app](https://frontend-gamma-blush-15.vercel.app) |
| **Link do repositório** | [https://github.com/BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments) |
| **Destaque principal** | Z-test com correção de Bonferroni + motor de decisão em 3 estados |
| **Bullets de impacto** | — Cálculo de tamanho amostral com Cohen's h e poder estatístico<br/>— Z-test com correção de Bonferroni e alpha ajustado<br/>— Motor de decisão não-binário: Winner, Inconclusive, Weak Effect<br/>— Botão de demonstração com dados fictícios e execução automática<br/>— Backend Python serverless integrado ao frontend Next.js no Vercel<br/>— UI completa em português com gráfico Recharts e relatório copiável |
| **Tags** | estatística, experimentação, testes-ab, inferência, bonferroni, ztest, python, fastapi, nextjs, scipy, statsmodels, vercel |

---

## 14. Sugestão de Card para Portfólio

```html
<!-- Padrão visual do portfólio barujafe.vercel.app: card com imagem/ícone, título,
     subtítulo (status + categoria), descrição curta, badges de stack,
     botões de ação (demo + GitHub) -->

<div class="project-card">
  <div class="project-card-header">
    <div class="project-icon">
      <svg><!-- ícone de gráfico/laboratório --></svg>
    </div>
    <div>
      <h3 class="project-title">StatLab Experiments</h3>
      <p class="project-subtitle">
        <span class="status-badge status-deployed">Deployed</span>
        Estatística & Experimentação
      </p>
    </div>
  </div>
  <p class="project-description">
    Ferramenta para planejar e interpretar testes A/B com Z-test,
    correção de Bonferroni e motor de decisão em 3 estados
    (Winner / Inconclusive / Weak Effect).
  </p>
  <div class="project-tags">
    <span class="tag">Next.js</span>
    <span class="tag">TypeScript</span>
    <span class="tag">FastAPI</span>
    <span class="tag">SciPy</span>
    <span class="tag">statsmodels</span>
  </div>
  <div class="project-actions">
    <a href="https://frontend-gamma-blush-15.vercel.app" class="btn btn-primary">
      Abrir demo
    </a>
    <a href="https://github.com/BarujaFe1/StatLab-Experiments" class="btn btn-secondary">
      GitHub
    </a>
  </div>
</div>
```

### Texto do card (versão markdown)

```markdown
### StatLab Experiments — *Deployed · Estatística & Experimentação*

Ferramenta para planejar e interpretar testes A/B com Z-test, correção de Bonferroni e motor de decisão em 3 estados (Winner / Inconclusive / Weak Effect).

`Next.js` `TypeScript` `FastAPI` `SciPy` `statsmodels`

[Abrir demo](https://frontend-gamma-blush-15.vercel.app) · [GitHub](https://github.com/BarujaFe1/StatLab-Experiments)
```

---

## 15. Sugestão de Texto para Página / Case Study

```markdown
# StatLab Experiments

## Planejamento e interpretação de testes A/B com rigor estatístico e clareza visual

**Stack:** Next.js 16 · TypeScript · FastAPI · SciPy · statsmodels · Tailwind CSS · Recharts · Vercel  
**Status:** Publicado e funcional  
**Demo:** [https://frontend-gamma-blush-15.vercel.app](https://frontend-gamma-blush-15.vercel.app)  
**Repositório:** [https://github.com/BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments)

---

## O Problema

Testes A/B são o padrão-ouro para tomada de decisão baseada em dados em produtos digitais. Mas, na prática, três problemas são recorrentes:

1. **Amostras insuficientes** — testes são encerrados cedo demais, gerando falsos positivos.
2. **Ignorância de múltiplas comparações** — quanto mais métricas se testa, maior a chance de encontrar um "resultado significativo" por acaso.
3. **Decisão binária** — "ganhou ou perdeu" ignora efeitos pequenos demais para ter relevância prática.

O StatLab Experiments foi construído para expor e resolver esses problemas com transparência total.

---

## O Que Foi Construído

### Cálculo de Tamanho Amostral
Usa Cohen's *h* para estimar o número mínimo de visitantes por grupo, dado um MDE, alpha e poder desejado. A implementação utiliza `NormalIndPower.solve_power()` do statsmodels.

### Z-test com Correção de Bonferroni
O teste compara duas proporções via `proportions_ztest` (bilateral). O parâmetro `n_comparisons` permite ajustar o alpha pelo método de Bonferroni (`alpha_adj = alpha / n`). O intervalo de confiança também é ajustado usando `norm.ppf(1 - alpha_adj / 2)`.

### Motor de Decisão em 3 Estados
Diferente da abordagem binária, o motor considera significância estatística E relevância prática:

| Condição | Classificação |
|---|---|
| p < alpha_adj E |diff| > 0.005 | **Winner** |
| p < alpha_adj E |diff| ≤ 0.005 | **Weak Effect** |
| p ≥ alpha_adj | **Inconclusive** |

---

## Arquitetura

O projeto segue o padrão Next.js + FastAPI via Vercel Services (mesmo domínio):

```
[Browser] ──GET /──→ [Next.js (frontend/)]
   │
   └──POST /api/*──→ [Python Serverless (api/index.py)]
                      ├── FastAPI
                      ├── SciPy + statsmodels
                      └── Pydantic (schemas)
```

Tudo no mesmo deploy Vercel, com root directory em `frontend/`.

---

## Diferenciais Técnicos

- **Bonferroni exposto**: o input "Nº de comparações" permite ao usuário ver o alpha mudar e a classificação se alterar — aprendizado ativo.
- **Demo com um clique**: o botão de demonstração carrega dados fictícios e executa todo o pipeline automaticamente.
- **Relatório copiável**: texto pronto para comunicar resultados em Slack/Linear.
- **Sem falsos positivos**: o motor de decisão exige relevância prática, não apenas p < alpha.

---

## Resultado

O projeto está disponível em produção, com backend serverless real rodando Python científico no Vercel. Qualquer recrutador pode, em menos de 10 segundos:
1. Abrir o link.
2. Clicar em "Carregar dados de demonstração".
3. Ver o cálculo amostral, o Z-test e a classificação funcionando.
4. Alterar o Bonferroni e ver o efeito na decisão.
```

---

## 16. Instruções para Manutenção

### Deploy
```bash
cd statlab-experiments/frontend
vercel --prod --force
```

### Build local
```bash
cd frontend
npm run build   # Next.js build
npm run lint    # ESLint
```

### Dependências Python
```bash
pip install -r frontend/requirements.txt
```

### Teste local da API
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
uvicorn app.main:app --reload  # API em http://localhost:8000
```

---

## 17. Checklist de Verificação Pós-Deploy

- [x] `GET /api/health` → `{"status":"ok"}`
- [x] `GET /api/demo` → fixture JSON com sample_size e analysis
- [x] `POST /api/calculate-sample-size` → retorna n_per_group
- [x] `POST /api/analyze` com n_comparisons=1 → Winner (p < alpha)
- [x] `POST /api/analyze` com n_comparisons=5 → Inconclusive (p > alpha_adj)
- [x] Frontend carrega sem erros (HTTP 200)
- [x] Botão de demo popula inputs e executa pipeline
- [x] Gráfico Recharts renderiza
- [x] Toast notifications funcionam
- [x] Botão "Copiar relatório" funciona
- [x] Links do header (Portfólio, GitHub) funcionam
- [x] UI em português brasileiro
- [x] Build local sem erros (lint + build)
- [x] Deploy Vercel sem erros
- [x] Proteção de deploy desabilitada (público)
- [x] Branch `feat/vercel-site` com todas as alterações

---

## 18. Contato e Responsável

| Campo | Valor |
|---|---|
| **Responsável** | Felipe Alirio Baruja (BarujaFe1) |
| **E-mail** | felipe.baruja@gmail.com |
| **GitHub** | [github.com/BarujaFe1](https://github.com/BarujaFe1) |
| **LinkedIn** | [linkedin.com/in/barujafe](https://www.linkedin.com/in/barujafe/) |
| **Portfólio** | [barujafe.vercel.app](https://barujafe.vercel.app/) |
| **Repositório do projeto** | [github.com/BarujaFe1/StatLab-Experiments](https://github.com/BarujaFe1/StatLab-Experiments) |
