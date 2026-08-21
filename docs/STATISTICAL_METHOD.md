# Statistical Method — StatLab Experiments

Este documento é a fonte de verdade da metodologia estatística implementada em
`api-server/api/index.py`. Ele explica o que é calculado, por quê, e quais são
as premissas e limites.

## 1. Teste de hipótese: z-test de duas proporções

- Estatística: **z-test bilateral de duas proporções** (score test), via
  `statsmodels.stats.proportion.proportions_ztest`.
- Diferença analisada: `diff = pB − pA` (B = tratamento, A = controle).
- Sob H0 (pA = pB), o score test usa **variância pooled** — comportamento
  padrão e correto do teste.

### Correção de múltiplas comparações (Bonferroni)

```
alpha_adj = alpha / n_comparisons      (n_comparisons >= 1)
```

A decisão usa `alpha_adj`. **O intervalo de confiança acompanha a inferência
family-wise**: o IC é calculado com `alpha = alpha_adj`, e o nível real do IC
(`ci_level = 1 − alpha_adj`) é exposto na resposta e na UI. Exemplo: com
`alpha = 0.05` e `n_comparisons = 3`, a decisão e o IC usam
`alpha_adj ≈ 0.0167` e a UI exibe **IC 98,33%**, não 95%.

## 2. Motor de decisão — 4 estados com direção assinada

O motor nunca usa `abs(diff)` isoladamente para declarar vitória. A direção do
efeito é parte da decisão:

| Estado | Condição |
|---|---|
| **Melhora** | `p < alpha_adj` **e** `diff > +mpe` |
| **Regressão** | `p < alpha_adj` **e** `diff < −mpe` |
| **Efeito Fraco** | `p < alpha_adj` **e** `\|diff\| <= mpe` |
| **Inconclusivo** | `p >= alpha_adj` **ou** teste indefinido |

O campo `direction` da resposta assume `positive` (efeito a favor de B),
`negative` (contra B) ou `neutral`.

**Motivação (bug P0 histórico):** o motor antigo usava `abs(diff) > MPE` e
chamava "Vencedor" mesmo quando B era *pior* que A com significância (caso
reproduzido: A = 60%, B = 58%, n = 10.000/grupo, p ≈ 0.004, diff = −2 pp).
Um efeito negativo significativo agora é **Regressão**, nunca vitória. O
cenário público `regressao` e o golden test G3 protegem contra regressão
desse bug.

## 3. Intervalo de confiança — Newcombe (Wilson híbrido)

- Método: `statsmodels.stats.proportion.confint_proportions_2indep` com
  `compare="diff"`, `method="newcomb"`, `alpha=alpha_adj`.
- Ordem dos argumentos produz o IC para `pB − pA` (mesmo sinal do
  `absolute_diff`).
- Nível: `1 − alpha_adj` (coerente com Bonferroni; exposto como `ci_level`).

### Por que o teste é pooled e o IC não (e por que isso não é bug)

O score test usa variância pooled **sob H0** (quando H0 é verdadeira,
pA = pB e a variância combinada é a estimativa correta). O IC da diferença
não assume H0 — ele estima a incerteza em torno do efeito observado, e o
método de Newcombe constrói isso a partir de intervalos de Wilson de cada
braço (variâncias próprias/unpooled). Métodos diferentes para perguntas
diferentes; a combinação score test + Newcombe CI é prática recomendada para
duas proporções (Newcombe, 1998).

Golden tests (G6) comparam o IC retornado contra chamada direta à biblioteca
de referência em cinco famílias de casos: normal, com Bonferroni, amostras
desbalanceadas, proporções perto de 0 e perto de 1.

## 4. Casos degenerados — contrato honesto

Quando o z-test não está definido (variância nula sob H0 — ex.: 0/1000 vs
0/1000 ou 1000/1000 vs 1000/1000):

```json
{
  "test_defined": false,
  "p_value": null,
  "significant": false,
  "status": "Inconclusivo",
  "warnings": ["Teste z indefinido (variância nula sob H0): p-valor não reportado.", "..."]
}
```

**Nenhum p-valor é fabricado** (o comportamento antigo mascarava NaN como
`p_value = 1.0`). O IC de Newcombe continua sendo reportado porque os
intervalos de Wilson por braço são definidos mesmo com zero eventos.

## 5. Uplift relativo com baseline zero

Quando `pA = 0`, o uplift relativo `pB/pA − 1` é **indefinido**. A API
retorna `uplift: null` (a UI exibe "Não definido (baseline zero)"). A
diferença absoluta continua válida e reportada.

## 6. Aviso de aproximação normal

Regra de bolso documentada: se `min(sucessos, falhas) < 5` em qualquer braço,
a resposta inclui um warning de que a aproximação normal do z-test pode ser
inadequada. É um aviso de cautela, não um bloqueio — a decisão permanece
disponível e o warning é explícito.

## 7. MDE / MPE — semântica absoluta

- **MDE** (Planejar) e **MPE** (Analisar) são **diferenças absolutas** em
  proporção: `0.01` = 1 ponto percentual.
- MDE negativo ou zero é rejeitado no planejamento; MPE negativo é rejeitado
  na análise.
- MDE relativo está fora de escopo (backlog).
- O planejamento usa Cohen's *h* + `NormalIndPower.solve_power`
  (duas amostras independentes, alocação 1:1). MDEs que exigem mais de
  100 milhões de observações por grupo são rejeitados com mensagem honesta.

## 8. Premissas e limites

Resumo (disponível em `GET /api/assumptions` e na UI):

1. Amostras independentes entre A e B (sem sobreposição de usuários).
2. Desfecho binário por observação.
3. Observações independentes dentro de cada braço.
4. Aproximação normal válida (sucessos e falhas suficientes por braço).
5. Causalidade só vale com aleatorização e design válidos — o motor mede
   associação observada sob as premissas do teste.
6. Bonferroni controla o erro familial porém é conservador.
7. Sem correção para testes sequenciais/peeking — analyse uma única vez.
8. Sem checagem automática de SRM (Sample Ratio Mismatch).
9. O status do motor é apoio à decisão; não autoriza rollout por si só.

## 9. Linguagem

As interpretações evitam causalidade automática e falsa equivalência: falam em
**evidência**, **efeito observado** e **sob as premissas do teste**; "Inconclusivo"
significa "evidência insuficiente", nunca "A e B são iguais" ou "não existe
efeito".

## 10. Fora de escopo (deliberadamente)

Sequential testing, A/B bayesiano, CUPED, SRM automation, data warehouse de
experimentos, login, banco de dados, feature flags e MDE relativo.

## Referências

- Newcombe, R. G. (1998). *Interval estimation for the difference between
  independent proportions: comparison of eleven methods*. Statistics in
  Medicine, 17(8), 873–890.
- `statsmodels.stats.proportion.confint_proportions_2indep` (documentação).
- `statsmodels.stats.proportion.proportions_ztest` (documentação).
