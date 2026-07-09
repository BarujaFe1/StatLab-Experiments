# SUMMARY.md

## Implementações Realizadas (Evolução V1.1 → deploy)
- **Backend**: API Flask serverless canônica em `api-server/api/index.py` (WSGI, Vercel) com decisão em 3 estados (Vencedor, Inconclusivo, Efeito Fraco), Bonferroni, IC via `norm.ppf(1 - alpha/2)` e validações de entrada.
- **Frontend**: Next.js App Router tipado (`AnalysisResult`/`AnalysisInput`); rewrite `/api/*` → `API_BACKEND_URL`; badge Flask (não FastAPI).
- **Arquitetura de deploy**: dois projetos Vercel — `frontend` (Next) + `statlab-experiments-api` (Flask). Removidos `frontend/api/` e `frontend/requirements.txt` para evitar função Python sombreada pelo preset Next.
- **Testes**: Suíte pytest em `api-server/api/tests/` (16 testes).
- **Dev local**: `start.bat` sobe `api-server/api/index.py` + `npm run dev`.

## Decisões
- Mantivemos a arquitetura stateless e o padrão de chamada relativa `/api/...` no frontend.
- Flask (WSGI) obrigatório no serverless Vercel; FastAPI/ASGI descartado.
- Backend de produção único: `api-server` (não duplicar lógica no frontend).

## Pendências e Próximos Passos
- (Opcional) Renomear projeto Vercel `frontend` → `statlab-experiments` para URL mais limpa.
- Refinar presets de cenário no módulo de Planejamento.
- Adicionar visualização de largura de IC (precisão).
- Implementar cálculo de duração baseada em tráfego diário.
