from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import scipy.stats as stats
import math
import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportions_ztest
from app.services.analysis import interpret_result

app = FastAPI(title="StatLab API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/calculate-sample-size")
def calculate_sample_size(req: SampleSizeRequest):
    p1 = req.baseline_conversion
    p2 = p1 + req.mde
    h = 2 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
    analysis = NormalIndPower()
    n = analysis.solve_power(effect_size=abs(h), alpha=req.alpha, power=req.power, ratio=1)
    return {"n_per_group": math.ceil(n)}

@app.post("/analyze")
def analyze(req: AnalysisRequest):
    count = np.array([req.conversions_a, req.conversions_b])
    nobs = np.array([req.visitors_a, req.visitors_b])
    
    p_a = req.conversions_a / req.visitors_a
    p_b = req.conversions_b / req.visitors_b
    
    z_stat, p_val = proportions_ztest(count, nobs)
    
    # Safe calculation for standard error
    variance_a = (p_a * (1 - p_a)) / req.visitors_a if req.visitors_a > 0 else 0
    variance_b = (p_b * (1 - p_b)) / req.visitors_b if req.visitors_b > 0 else 0
    se = math.sqrt(max(0, variance_a + variance_b))

    diff = p_b - p_a
    ci_low = diff - 1.96 * se
    ci_high = diff + 1.96 * se
    
    status, interpretation = interpret_result(p_val, p_a, p_b, ci_low, ci_high)
    
    return {
        "p_value": float(p_val),
        "uplift": float((p_b / p_a) - 1) if p_a > 0 else 0.0,
        "conversion_a": float(p_a),
        "conversion_b": float(p_b),
        "ci_low": float(ci_low),
        "ci_high": float(ci_high),
        "significant": bool(p_val < req.alpha),
        "status": status,
        "interpretation": interpretation
    }
