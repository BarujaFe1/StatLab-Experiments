## API Contract

Base path: `/api`  
Backend canônico: `api-server/api/index.py` (Flask WSGI)

### GET /api/health
```json
{ "status": "ok" }
```

### POST /api/calculate-sample-size
**Request:**
```json
{
  "baseline_conversion": 0.05,
  "mde": 0.01,
  "alpha": 0.05,
  "power": 0.80
}
```

**Response 200:**
```json
{ "n_per_group": 8143 }
```

**Response 400:** `{ "error": "..." }`

### POST /api/analyze
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

**Response 200:**
```json
{
  "p_value": 0.0123,
  "alpha_ajustado": 0.0167,
  "uplift": 0.16,
  "conversion_a": 0.05,
  "conversion_b": 0.058,
  "ci_low": 0.0017,
  "ci_high": 0.0143,
  "significant": true,
  "status": "Vencedor",
  "interpretation": "..."
}
```

**Response 400:** `{ "error": "..." }`

### GET /api/demo
```json
{
  "sample_size": {
    "baseline_conversion": 0.05,
    "mde": 0.01,
    "alpha": 0.05,
    "power": 0.8
  },
  "analyze": {
    "visitors_a": 10000,
    "conversions_a": 500,
    "visitors_b": 10000,
    "conversions_b": 580,
    "alpha": 0.05,
    "n_comparisons": 3,
    "mpe": 0.005
  }
}
```
