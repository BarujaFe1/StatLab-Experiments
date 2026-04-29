## API Contract

### POST /calculate-sample-size
Calculates the required sample size per group.

**Request Body:**
```json
{
  "baseline_conversion": 0.05,
  "mde": 0.01,
  "alpha": 0.05,
  "power": 0.80
}
```

**Response:**
```json
{
  "n_per_group": 12345
}
```

### POST /analyze
Analyzes experimental results.

**Request Body:**
```json
{
  "visitors_a": 1000,
  "conversions_a": 50,
  "visitors_b": 1000,
  "conversions_b": 65,
  "alpha": 0.05
}
```

**Response:**
```json
{
  "p_value": 0.042,
  "uplift": 0.30,
  "conversion_a": 0.05,
  "conversion_b": 0.065,
  "ci_low": 0.005,
  "ci_high": 0.025,
  "significant": true
}
```
