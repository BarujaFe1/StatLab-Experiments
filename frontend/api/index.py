from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import scipy.stats as stats
import math
import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportions_ztest
from mangum import Mangum

app = FastAPI(title="StatLab API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class SampleSizeRequest(BaseModel):
    baseline_conversion: float
    mde: float
    alpha: float = 0.05
    power: float = 0.80


class AnalysisRequest(BaseModel):
    visitors_a: int
    conversions_a: int
    visitors_b: int
    conversions_b: int
    alpha: float = 0.05
    n_comparisons: int = 1


def interpret_result(p_val, p_a, p_b, ci_low, ci_high, alpha_adjusted):
    diff = p_b - p_a
    is_practically_significant = abs(diff) > 0.005

    if p_val < alpha_adjusted:
        if is_practically_significant:
            return (
                "Winner",
                "A Variante B supera a Variante A com significância estatística "
                "e relevância prática após a correção de Bonferroni.",
            )
        return (
            "Weak Effect",
            "Estatisticamente significativo (após Bonferroni), mas o efeito "
            "absoluto é muito pequeno para justificar rollout.",
        )
    return (
        "Inconclusive",
        "Os dados não sustentam uma conclusão forte. Mais tráfego ou um efeito "
        "maior é necessário (alpha ajustado por Bonferroni aplicado).",
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/calculate-sample-size")
def calculate_sample_size(req: SampleSizeRequest):
    p1 = req.baseline_conversion
    p2 = p1 + req.mde
    h = 2 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
    analysis = NormalIndPower()
    n = analysis.solve_power(effect_size=abs(h), alpha=req.alpha, power=req.power, ratio=1)
    return {"n_per_group": math.ceil(n)}


@app.post("/api/analyze")
def analyze(req: AnalysisRequest):
    if req.visitors_a <= 0 or req.visitors_b <= 0:
        return {"error": "visitors must be greater than zero"}

    n_comparisons = max(1, int(req.n_comparisons))
    alpha_adjusted = req.alpha / n_comparisons

    count = np.array([req.conversions_a, req.conversions_b])
    nobs = np.array([req.visitors_a, req.visitors_b])

    p_a = req.conversions_a / req.visitors_a
    p_b = req.conversions_b / req.visitors_b

    z_stat, p_val = proportions_ztest(count, nobs)

    variance_a = (p_a * (1 - p_a)) / req.visitors_a
    variance_b = (p_b * (1 - p_b)) / req.visitors_b
    se = math.sqrt(variance_a + variance_b)

    diff = p_b - p_a
    z_crit = stats.norm.ppf(1 - alpha_adjusted / 2)
    ci_low = diff - z_crit * se
    ci_high = diff + z_crit * se

    status, interpretation = interpret_result(p_val, p_a, p_b, ci_low, ci_high, alpha_adjusted)

    return {
        "p_value": float(p_val),
        "uplift": float((p_b / p_a) - 1) if p_a > 0 else 0.0,
        "conversion_a": float(p_a),
        "conversion_b": float(p_b),
        "ci_low": float(ci_low),
        "ci_high": float(ci_high),
        "alpha": float(req.alpha),
        "n_comparisons": n_comparisons,
        "alpha_adjusted": float(alpha_adjusted),
        "significant": bool(p_val < alpha_adjusted),
        "status": status,
        "interpretation": interpretation,
    }


@app.get("/api/demo")
def demo():
    return {
        "sample_size": {
            "baseline_conversion": 0.05,
            "mde": 0.01,
            "alpha": 0.05,
            "power": 0.80,
        },
        "analysis": {
            "visitors_a": 1000,
            "conversions_a": 50,
            "visitors_b": 1000,
            "conversions_b": 74,
            "alpha": 0.05,
            "n_comparisons": 1,
        },
        "note": "Fixture de demonstração: teste A/B com 1.000 visitantes por grupo. Tente aumentar o Nº de comparações (Bonferroni) para ver a classificação mudar.",
    }


handler = Mangum(app)
