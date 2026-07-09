import math

import numpy as np
from scipy.stats import norm
from statsmodels.stats.power import NormalIndPower

from api.index import app

client = app.test_client()


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_demo_structure():
    r = client.get("/api/demo")
    assert r.status_code == 200
    data = r.get_json()
    assert set(data) == {"sample_size", "analyze"}
    assert "baseline_conversion" in data["sample_size"]
    assert "visitors_a" in data["analyze"]


def test_sample_size_matches_formula():
    payload = {"baseline_conversion": 0.05, "mde": 0.01, "alpha": 0.05, "power": 0.80}
    r = client.post("/api/calculate-sample-size", json=payload)
    assert r.status_code == 200
    n = r.get_json()["n_per_group"]
    assert isinstance(n, int) and n > 0

    p1, p2 = payload["baseline_conversion"], payload["baseline_conversion"] + payload["mde"]
    h = 2 * (math.asin(math.sqrt(p1)) - math.asin(math.sqrt(p2)))
    expected = int(math.ceil(NormalIndPower().solve_power(
        effect_size=abs(h), alpha=payload["alpha"], power=payload["power"], ratio=1
    )))
    assert n == expected


def test_sample_size_monotonic_in_power():
    base = {"baseline_conversion": 0.05, "mde": 0.01, "alpha": 0.05}
    low = client.post("/api/calculate-sample-size", json={**base, "power": 0.70}).get_json()["n_per_group"]
    high = client.post("/api/calculate-sample-size", json={**base, "power": 0.90}).get_json()["n_per_group"]
    assert high > low


def test_sample_size_invalid_baseline():
    r = client.post("/api/calculate-sample-size", json={"baseline_conversion": 1.5, "mde": 0.01})
    assert r.status_code == 400


def test_sample_size_invalid_mde_zero():
    r = client.post("/api/calculate-sample-size", json={"baseline_conversion": 0.05, "mde": 0})
    assert r.status_code == 400


def test_sample_size_invalid_sum_over_one():
    r = client.post("/api/calculate-sample-size", json={"baseline_conversion": 0.9, "mde": 0.2})
    assert r.status_code == 400


def test_analyze_winner():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 580,
               "alpha": 0.05, "n_comparisons": 3, "mpe": 0.005}
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200
    data = r.get_json()
    assert data["status"] == "Vencedor"
    assert data["significant"] is True
    assert data["conversion_b"] > data["conversion_a"]
    assert data["uplift"] > 0
    assert data["ci_low"] < data["ci_high"]


def test_analyze_inconclusive():
    payload = {"visitors_a": 1000, "conversions_a": 50,
               "visitors_b": 1000, "conversions_b": 52,
               "alpha": 0.05}
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200
    data = r.get_json()
    assert data["status"] == "Inconclusivo"
    assert data["significant"] is False


def test_analyze_weak_effect():
    payload = {"visitors_a": 5_000_000, "conversions_a": 250_000,
               "visitors_b": 5_000_000, "conversions_b": 252_000,
               "alpha": 0.05, "mpe": 0.005}
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200
    data = r.get_json()
    assert data["status"] == "Efeito Fraco"
    assert data["significant"] is True
    assert abs(data["conversion_b"] - data["conversion_a"]) <= 0.005


def test_analyze_bonferroni_flip():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 567,
               "alpha": 0.05}
    single = client.post("/api/analyze", json={**payload, "n_comparisons": 1}).get_json()
    multi = client.post("/api/analyze", json={**payload, "n_comparisons": 10}).get_json()
    assert single["status"] == "Vencedor"
    assert multi["status"] == "Inconclusivo"
    assert multi["alpha_ajustado"] < single["alpha_ajustado"]


def test_analyze_zero_conversions_no_crash():
    payload = {"visitors_a": 1000, "conversions_a": 0,
               "visitors_b": 1000, "conversions_b": 0, "alpha": 0.05}
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200
    data = r.get_json()
    assert data["status"] == "Inconclusivo"
    assert data["ci_low"] == data["ci_high"] == 0.0
    assert math.isnan(data["p_value"]) is False


def test_analyze_validation_zero_visitors():
    r = client.post("/api/analyze", json={"visitors_a": 0, "conversions_a": 0,
                                           "visitors_b": 100, "conversions_b": 5})
    assert r.status_code == 400


def test_analyze_validation_conversions_exceed_visitors():
    r = client.post("/api/analyze", json={"visitors_a": 100, "conversions_a": 150,
                                           "visitors_b": 100, "conversions_b": 5})
    assert r.status_code == 400


def test_analyze_validation_missing_fields():
    r = client.post("/api/analyze", json={"visitors_a": "abc"})
    assert r.status_code == 400


def test_analyze_ci_reflects_alpha():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 580, "alpha": 0.10}
    data = client.post("/api/analyze", json=payload).get_json()
    p_a, p_b = data["conversion_a"], data["conversion_b"]
    diff = p_b - p_a
    se = math.sqrt((p_a * (1 - p_a)) / 10000 + (p_b * (1 - p_b)) / 10000)
    z = norm.ppf(1 - 0.10 / 2)
    assert abs(data["ci_low"] - (diff - z * se)) < 1e-9
    assert abs(data["ci_high"] - (diff + z * se)) < 1e-9
