# API Contract

Backend: Flask WSGI (`api-server/api/index.py`). Todas as rotas POST exigem
**body JSON objeto** — listas, strings, escalares ou JSON malformado retornam
`400` estruturado (`{"error": "..."}`), nunca `500`.

Campos de contagem (`visitors_*`, `conversions_*`, `n_comparisons`) são
**inteiros estritos**: rejeitam `bool`, floats fracionários (`100.7`),
`NaN`/`Infinity`, negativos e strings decimais inválidas. Strings inteiras
(`"1000"`) são aceitas. Campos numéricos contínuos rejeitam não-finitos.

## GET /api/health

```json
{"status": "ok", "service": "statlab-experiments-api"}
```

## GET /api/assumptions

Retorna `{"assumptions": [...]}` — resumo das premissas e limites do teste.

## POST /api/calculate-sample-size

**Request:**

```json
{
  "baseline_conversion": 0.05,
  "mde": 0.01,
  "alpha": 0.05,
  "power": 0.80
}
```

- `mde` é **diferença absoluta** (`0.01` = 1 pp); deve ser `> 0`.
- `baseline_conversion + mde` deve permanecer em `(0, 1)`.
- MDE que exige mais de 100 milhões de observações por grupo → `400` com
  mensagem honesta.

**Response (200):**

```json
{
  "n_per_group": 8143,
  "baseline_conversion": 0.05,
  "mde": 0.01,
  "alpha": 0.05,
  "power": 0.8,
  "effect_size_h": 0.04550352426855219,
  "note": "O MDE é o menor efeito absoluto que você quer detectar..."
}
```

## POST /api/analyze

**Request:**

```json
{
  "visitors_a": 10000,
  "conversions_a": 500,
  "visitors_b": 10000,
  "conversions_b": 580,
  "alpha": 0.05,
  "n_comparisons": 3,
  "mpe": 0.005
}
```

**Response (200):**

```json
{
  "test_defined": true,
  "p_value": 0.0020807176121605817,
  "warnings": [],
  "alpha": 0.05,
  "alpha_ajustado": 0.016666666666666666,
  "n_comparisons": 3,
  "mpe": 0.005,
  "uplift": 0.15999999999999992,
  "absolute_diff": 0.008,
  "conversion_a": 0.05,
  "conversion_b": 0.058,
  "ci_low": 0.0003436408598088839,
  "ci_high": 0.015675048319222378,
  "ci_level": 0.9833333333333333,
  "ci_method": "newcomb",
  "significant": true,
  "practically_significant": true,
  "direction": "positive",
  "status": "Melhora",
  "interpretation": "Sob as premissas do teste, há evidência estatística...",
  "next_steps": ["...", "..."]
}
```

### Semântica dos campos de decisão

- `status` — um de `Melhora` / `Regressão` / `Efeito Fraco` / `Inconclusivo`
  (motor de 4 estados com direção assinada; ver `docs/STATISTICAL_METHOD.md`).
- `direction` — `positive` (efeito a favor de B), `negative` (contra B),
  `neutral`.
- `alpha_ajustado = alpha / n_comparisons` — usado tanto na decisão quanto no
  nível do IC (`ci_level = 1 − alpha_ajustado`).
- `ci_method = "newcomb"` — IC de Newcombe (Wilson híbrido) para `pB − pA`.
- `uplift` — `null` quando `pA = 0` (indefinido; a diferença absoluta segue
  válida).
- `test_defined` — `false` quando o z-test é indefinido (ex.: 0% vs 0%,
  100% vs 100%). Nesse caso `p_value` é `null`, `significant` é `false`,
  `status` é `Inconclusivo` e `warnings` explica o motivo. O IC continua
  reportado.
- `warnings` — lista (possivelmente vazia) com avisos como aproximação normal
  inadequada (`min(sucessos, falhas) < 5` por braço).

### Erros (400)

Body não-objeto, JSON malformado, contagens não-inteiras/booleanas/negativas,
conversões > visitantes, `alpha` fora de `(0,1)`, `n_comparisons < 1`,
`mpe < 0`. Sempre `{"error": "<mensagem>"}`.

## GET /api/demo

Payload didático: `sample_size`, `analyze` (cenário Melhora), `scenarios`
(`melhora`, `regressao`, `efeito_fraco`, `inconclusivo`, `zero_conversoes`) e
`assumptions`.

## GET /api/scenarios

`{"scenarios": {...}}` — os cinco cenários públicos de decisão.
