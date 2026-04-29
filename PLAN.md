# Evolução: StatLab Experiments (V1.1)

## Objetivo
Transformar a V1 em um produto de portfólio maduro, com foco em UX premium, interpretação inteligente e guardrails estatísticos.

## Melhorias Principais
1. **Interpretação Avançada**: Sistema de 3 estados (Favorável, Inconclusivo, Efeito Fraco) no backend.
2. **Relevância Prática**: Alertas para efeitos significativos, porém irrelevantes.
3. **Precisão**: Visualização de largura de Intervalo de Confiança como métrica de precisão.
4. **UX Premium**: Redesenho do layout para hierarquia de "decisão" (Apple-like).
5. **Sample Size Avançado**: Adição de tráfego diário e duração estimada.
6. **Copy Report**: Relatório estruturado para Slack/Linear.

## Arquitetura e Impacto
- **Backend**: Adição de lógica de inferência no `backend/app/services/analysis.py`.
- **Frontend**: Refatoração do layout para grid semântico e melhor uso de shadcn.

## Riscos
- Risco de excesso de informação: Mitigaremos mantendo detalhes técnicos em seções opcionais (colapsáveis).

## Ordem de Implementação
1. Backend: Lógica de interpretação e cálculo de duração.
2. UI: Redesenho do shell e cards de decisão.
3. UX: Guardrails e relatórios copiáveis.
