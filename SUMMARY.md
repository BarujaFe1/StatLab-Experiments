> **SNAPSHOT HISTÓRICO (2026-07)** — Este documento registra o estado do projeto
> antes do hardening científico de 2026-08-21 (motor de 4 estados, IC Newcombe
> ajustado, contratos honestos de edge cases). Termos como "3 estados",
> "Vencedor", "FastAPI" e a URL legada refletem o contexto da época e NÃO
> descrevem o comportamento atual. Fontes de verdade atuais: README.md,
> docs/STATISTICAL_METHOD.md, docs/api-contract.md, docs/architecture-guardrails.md.

# SUMMARY.md

## Implementações Realizadas (Evolução V1.1)
- **Backend**: Criado `services/analysis.py` para lógica de decisão em 3 estados (Favorável, Inconclusivo, Efeito Fraco).
- **Frontend**: Redesenho do card de resultados na página de análise para exibir status e interpretação textual inteligente.
- **Integração**: Conectada a nova lógica ao `copy report` e interface de resultados.

## Decisões
- Mantivemos a arquitetura stateless.
- Priorizamos a legibilidade da decisão para o usuário (UX > Stats Jargon).

## Pendências e Próximos Passos
- Refinar presets de cenário no módulo de Planejamento.
- Adicionar visualização de largura de IC (precisão).
- Implementar cálculo de duração baseada em tráfego diário.
