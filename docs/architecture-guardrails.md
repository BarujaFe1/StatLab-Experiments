# StatLab Experiments — Architecture Guardrails

> Este arquivo já descreveu uma arquitetura antiga (projeto Vercel único com
> Python Services, labels em inglês e `statlab-experiments.vercel.app` como
> produção). Aqui está o guardrail atual; a história live em `git log`.

## Arquitetura de produção canônica

- **Dois projetos Vercel (team `baruja-fe`):**
  - `statlab-experiments` (`frontend/`) — Next.js — https://statlab-ab.vercel.app
  - `statlab-experiments-api` (`api-server/`) — Flask WSGI — https://statlab-experiments-api.vercel.app
- **Proxy:** `frontend/next.config.ts` reescreve `/api/:path*` para
  `${API_BACKEND_URL}/api/:path*`. A UI chama apenas rotas relativas.
- **API contract (não mudar sem atualizar `docs/api-contract.md`):**
  - Status labels em português: `Melhora` | `Regressão` | `Efeito Fraco` | `Inconclusivo`
  - Campo: `alpha_ajustado` (não `alpha_adjusted`)
  - Demo fixture key: `analyze` (não `analysis`)
  - Rotas: `/api/health`, `/api/assumptions`, `/api/demo`, `/api/scenarios`,
    `/api/calculate-sample-size`, `/api/analyze`
- **URL legada:** `statlab-experiments.vercel.app` pertence a um projeto de
  outro team scope e **não é a URL oficial** — não usar em docs, metadata ou
  demos. A oficial é `statlab-ab.vercel.app`.

## Não fazer

- Não reintroduzir `frontend/vercel.json` com Python Services ao lado do
  Next (o preset Next captura `/api/*` e sombreia o handler Python).
- Não transformar o z-test pooled em IC pooled "para baterem" — score test
  pooled sob H0 e IC Newcombe unpooled são métodos distintos por design (ver
  `docs/STATISTICAL_METHOD.md`).
- Não usar `abs(diff)` na decisão sem sinal — o bug P0 histórico (B pior
  significativo chamado de "Vencedor") deve permanecer impossível.
- Não mascarar p-valor indefinido (`NaN → 1.0`); o contrato é
  `test_defined=false` + `p_value=null` + warning.
- Não hardcodear URL do backend na UI.

## Deploy

```bash
cd api-server
vercel deploy --prod --yes --scope baruaja-fe  # projeto statlab-experiments-api

cd ../frontend
vercel deploy --prod --yes --scope baruaja-fe  # projeto statlab-experiments
```

Validar após cada deploy de produção:

```powershell
Invoke-RestMethod https://statlab-ab.vercel.app/api/health
Invoke-RestMethod https://statlab-ab.vercel.app/api/demo
# P0 guard: B pior significativo DEVE retornar "Regressão"
Invoke-RestMethod -Method Post https://statlab-ab.vercel.app/api/analyze -ContentType 'application/json' -Body '{"visitors_a":10000,"conversions_a":6000,"visitors_b":10000,"conversions_b":5800,"alpha":0.05,"n_comparisons":1,"mpe":0.005}'
```

O demo padrão retorna `status: "Melhora"` para o payload `melhora`, e o
cenário `regressao` retorna `status: "Regressão"`.
