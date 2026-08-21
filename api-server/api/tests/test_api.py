import math

import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import confint_proportions_2indep

from api.index import SCENARIOS, app

client = app.test_client()


def _analyze(payload):
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 200, (r.status_code, r.get_json())
    return r.get_json()


def _analyze_error(payload):
    r = client.post("/api/analyze", json=payload)
    assert r.status_code == 400, (r.status_code, r.get_json())
    assert isinstance(r.get_json().get("error"), str)
    return r.get_json()


def _expected_ci(conversions_a, visitors_a, conversions_b, visitors_b, alpha_adj):
    """Referência: chamada direta à biblioteca (Newcombe, diff = pB - pA)."""
    return confint_proportions_2indep(
        conversions_b, visitors_b, conversions_a, visitors_a,
        compare="diff", method="newcomb", alpha=alpha_adj,
    )


# ---------------------------------------------------------------------------
# Estrutura básica
# ---------------------------------------------------------------------------

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_demo_structure():
    r = client.get("/api/demo")
    assert r.status_code == 200
    data = r.get_json()
    assert "sample_size" in data and "analyze" in data and "scenarios" in data
    assert "baseline_conversion" in data["sample_size"]
    assert "visitors_a" in data["analyze"]
    assert "melhora" in data["scenarios"]
    assert "assumptions" in data and len(data["assumptions"]) >= 5


def test_assumptions_endpoint():
    r = client.get("/api/assumptions")
    assert r.status_code == 200
    items = r.get_json()["assumptions"]
    assert len(items) >= 5
    assert any("independen" in i.lower() for i in items)
    assert any("sequencia" in i.lower() for i in items)


def test_scenarios_endpoint_has_five_public_states():
    r = client.get("/api/scenarios")
    assert r.status_code == 200
    scenarios = r.get_json()["scenarios"]
    assert set(scenarios) == {
        "melhora", "regressao", "efeito_fraco", "inconclusivo", "zero_conversoes"
    }


def test_every_public_scenario_resolves_to_distinct_status():
    statuses = {}
    for key, scenario in SCENARIOS.items():
        data = _analyze(scenario["analyze"])
        statuses[key] = data["status"]
    assert statuses["melhora"] == "Melhora"
    assert statuses["regressao"] == "Regressão"
    assert statuses["efeito_fraco"] == "Efeito Fraco"
    assert statuses["inconclusivo"] == "Inconclusivo"
    assert statuses["zero_conversoes"] == "Inconclusivo"


# ---------------------------------------------------------------------------
# G1 — igualdade: não significativo
# ---------------------------------------------------------------------------

def test_g1_equality_is_inconclusive():
    data = _analyze({"visitors_a": 1000, "conversions_a": 50,
                     "visitors_b": 1000, "conversions_b": 50, "alpha": 0.05})
    assert data["test_defined"] is True
    assert data["significant"] is False
    assert data["status"] == "Inconclusivo"
    assert data["direction"] == "neutral"
    assert data["p_value"] > 0.99


# ---------------------------------------------------------------------------
# G2 — positive: Melhora (inclusive com Bonferroni)
# ---------------------------------------------------------------------------

def test_g2_positive_is_melhora():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 580,
               "alpha": 0.05, "n_comparisons": 3, "mpe": 0.005}
    data = _analyze(payload)
    assert data["significant"] is True
    assert data["practically_significant"] is True
    assert data["direction"] == "positive"
    assert data["status"] == "Melhora"
    assert data["alpha_ajustado"] == 0.05 / 3
    assert isinstance(data["next_steps"], list) and len(data["next_steps"]) >= 2
    assert data["uplift"] > 0


# ---------------------------------------------------------------------------
# G3 — significant negative: Regressão (caso histórico 60% vs 58%)
# ---------------------------------------------------------------------------

def test_g3_significant_negative_is_regressao_never_melhora():
    """Reprodução do P0: B pior com p ≈ 0.004 nunca pode ser vitória."""
    payload = {"visitors_a": 10000, "conversions_a": 6000,
               "visitors_b": 10000, "conversions_b": 5800,
               "alpha": 0.05, "n_comparisons": 1, "mpe": 0.005}
    data = _analyze(payload)
    assert abs(data["p_value"] - 0.0040352613785050295) < 1e-12
    assert data["absolute_diff"] < -0.02 + 1e-9
    assert data["significant"] is True
    assert data["direction"] == "negative"
    assert data["status"] == "Regressão"
    assert data["status"] not in {"Melhora", "Vencedor"}
    assert any("NEGATIVO" in s or "contra B" in s for s in data["next_steps"])


def test_g3_negative_ci_excludes_zero_on_the_negative_side():
    data = _analyze({"visitors_a": 10000, "conversions_a": 6000,
                     "visitors_b": 10000, "conversions_b": 5800,
                     "alpha": 0.05, "n_comparisons": 1, "mpe": 0.005})
    assert data["ci_high"] < 0


# ---------------------------------------------------------------------------
# G4 — weak: significativo mas magnitude <= MPE
# ---------------------------------------------------------------------------

def test_g4_weak_effect():
    payload = {"visitors_a": 5_000_000, "conversions_a": 250_000,
               "visitors_b": 5_000_000, "conversions_b": 252_000,
               "alpha": 0.05, "mpe": 0.005}
    data = _analyze(payload)
    assert data["significant"] is True
    assert data["practically_significant"] is False
    assert data["status"] == "Efeito Fraco"


def test_g4_weak_effect_with_large_mpe_boundary():
    data = _analyze({"visitors_a": 10000, "conversions_a": 500,
                     "visitors_b": 10000, "conversions_b": 580,
                     "alpha": 0.05, "n_comparisons": 1, "mpe": 0.05})
    assert data["significant"] is True
    assert data["status"] == "Efeito Fraco"


# ---------------------------------------------------------------------------
# G5 — Bonferroni flip: n=1 vs n>1
# ---------------------------------------------------------------------------

def test_g5_bonferroni_flip():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 567, "alpha": 0.05}
    single = _analyze({**payload, "n_comparisons": 1})
    multi = _analyze({**payload, "n_comparisons": 10})
    assert single["status"] == "Melhora"
    assert multi["status"] == "Inconclusivo"
    assert multi["alpha_ajustado"] < single["alpha_ajustado"]


# ---------------------------------------------------------------------------
# G6 — adjusted CI contra referência da biblioteca
# ---------------------------------------------------------------------------

def test_g6_ci_matches_library_reference_normal():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 580,
               "alpha": 0.05, "n_comparisons": 1, "mpe": 0.005}
    data = _analyze(payload)
    lo, hi = _expected_ci(500, 10000, 580, 10000, alpha_adj=0.05)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9
    assert abs(data["ci_level"] - 0.95) < 1e-12
    assert data["ci_method"] == "newcomb"


def test_g6_ci_matches_library_reference_with_bonferroni():
    payload = {"visitors_a": 10000, "conversions_a": 500,
               "visitors_b": 10000, "conversions_b": 580,
               "alpha": 0.05, "n_comparisons": 3, "mpe": 0.005}
    data = _analyze(payload)
    lo, hi = _expected_ci(500, 10000, 580, 10000, alpha_adj=0.05 / 3)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9
    # nível do IC acompanha a inferência family-wise (98,33%), não o nominal 95%
    assert abs(data["ci_level"] - (1 - 0.05 / 3)) < 1e-12
    bonferroni_width = hi - lo
    nominal_lo, nominal_hi = _expected_ci(500, 10000, 580, 10000, alpha_adj=0.05)
    assert bonferroni_width > (nominal_hi - nominal_lo)


def test_g6_ci_matches_library_reference_unbalanced():
    payload = {"visitors_a": 1000, "conversions_a": 50,
               "visitors_b": 3000, "conversions_b": 120,
               "alpha": 0.05, "n_comparisons": 1}
    data = _analyze(payload)
    lo, hi = _expected_ci(50, 1000, 120, 3000, alpha_adj=0.05)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9


def test_g6_ci_matches_library_reference_near_zero_proportion():
    payload = {"visitors_a": 20000, "conversions_a": 10,
               "visitors_b": 20000, "conversions_b": 30,
               "alpha": 0.05, "n_comparisons": 1}
    data = _analyze(payload)
    lo, hi = _expected_ci(10, 20000, 30, 20000, alpha_adj=0.05)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9


def test_g6_ci_matches_library_reference_near_one():
    payload = {"visitors_a": 1000, "conversions_a": 950,
               "visitors_b": 1000, "conversions_b": 990,
               "alpha": 0.05, "n_comparisons": 1}
    data = _analyze(payload)
    lo, hi = _expected_ci(950, 1000, 990, 1000, alpha_adj=0.05)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9


def test_g6_ci_is_for_pB_minus_pA_order():
    data = _analyze({"visitors_a": 10000, "conversions_a": 500,
                     "visitors_b": 10000, "conversions_b": 580, "alpha": 0.05})
    # centro do IC aproxima diff = pB - pA > 0
    assert data["ci_low"] < data["ci_high"]
    assert data["ci_low"] + data["ci_high"] > 0


# ---------------------------------------------------------------------------
# G7 — JSON top-level não objeto → 400 (nunca 500)
# ---------------------------------------------------------------------------

def test_g7_non_object_json_body_returns_400():
    for body in ([1, 2, 3], "hello", 42, None):
        r = client.post("/api/analyze", json=body)
        assert r.status_code == 400, (body, r.status_code)
        assert "error" in r.get_json()


def test_g7_non_object_json_body_returns_400_sample_size():
    for body in ([1], "x", 7):
        r = client.post("/api/calculate-sample-size", json=body)
        assert r.status_code == 400, (body, r.status_code)


def test_g7_malformed_json_returns_400_not_500():
    r = client.post(
        "/api/analyze", data="{not json", content_type="application/json"
    )
    assert r.status_code == 400
    assert "error" in r.get_json()


# ---------------------------------------------------------------------------
# G8 — float em contagens → 400 (sem truncamento silencioso)
# ---------------------------------------------------------------------------

def test_g8_float_counts_rejected():
    _analyze_error({"visitors_a": 1000.5, "conversions_a": 50,
                    "visitors_b": 1000, "conversions_b": 65})
    _analyze_error({"visitors_a": 1000, "conversions_a": 100.7,
                    "visitors_b": 1000, "conversions_b": 65})


def test_g8_nonfinite_counts_rejected():
    for bad in (float("nan"), float("inf"), -float("inf")):
        _analyze_error({"visitors_a": 1000, "conversions_a": bad,
                        "visitors_b": 1000, "conversions_b": 65})
        _analyze_error({"visitors_a": bad, "conversions_a": 50,
                        "visitors_b": 1000, "conversions_b": 65})


def test_g8_decimal_strings_rejected_but_integer_strings_accepted():
    _analyze_error({"visitors_a": 1000, "conversions_a": "100.7",
                    "visitors_b": 1000, "conversions_b": 65})
    data = _analyze({"visitors_a": "1000", "conversions_a": "50",
                     "visitors_b": "1000", "conversions_b": "65", "alpha": "0.05"})
    assert data["conversion_a"] == 0.05


def test_g8_negative_counts_rejected():
    _analyze_error({"visitors_a": 1000, "conversions_a": -1,
                    "visitors_b": 1000, "conversions_b": 65})


# ---------------------------------------------------------------------------
# G9 — bool em contagens → 400
# ---------------------------------------------------------------------------

def test_g9_bool_counts_rejected():
    _analyze_error({"visitors_a": 1000, "conversions_a": True,
                    "visitors_b": 1000, "conversions_b": 65})
    _analyze_error({"visitors_a": False, "conversions_a": 0,
                    "visitors_b": 1000, "conversions_b": 65})
    _analyze_error({"visitors_a": 1000, "conversions_a": 0,
                    "visitors_b": 1000, "conversions_b": 65, "n_comparisons": True})


# ---------------------------------------------------------------------------
# G10 — zero/zero: sem p-valor fabricado
# ---------------------------------------------------------------------------

def test_g10_zero_vs_zero_no_fake_p():
    data = _analyze({"visitors_a": 1000, "conversions_a": 0,
                     "visitors_b": 1000, "conversions_b": 0, "alpha": 0.05})
    assert data["test_defined"] is False
    assert data["p_value"] is None
    assert data["significant"] is False
    assert data["status"] == "Inconclusivo"
    assert len(data["warnings"]) >= 1
    # IC honesto e simétrico em torno de zero
    lo, hi = _expected_ci(0, 1000, 0, 1000, alpha_adj=0.05)
    assert abs(data["ci_low"] - lo) < 1e-9
    assert abs(data["ci_high"] - hi) < 1e-9


# ---------------------------------------------------------------------------
# G11 — 100%/100%: sem p-valor fabricado
# ---------------------------------------------------------------------------

def test_g11_full_conversion_no_fake_p():
    data = _analyze({"visitors_a": 1000, "conversions_a": 1000,
                     "visitors_b": 1000, "conversions_b": 1000, "alpha": 0.05})
    assert data["test_defined"] is False
    assert data["p_value"] is None
    assert data["status"] == "Inconclusivo"
    assert len(data["warnings"]) >= 1


# ---------------------------------------------------------------------------
# G12 — pA = 0: uplift relativo indefinido
# ---------------------------------------------------------------------------

def test_g12_baseline_zero_uplift_undefined():
    data = _analyze({"visitors_a": 1000, "conversions_a": 0,
                     "visitors_b": 1000, "conversions_b": 10, "alpha": 0.05})
    assert data["uplift"] is None
    # diferença absoluta continua válida
    assert abs(data["absolute_diff"] - 0.01) < 1e-9
    assert data["conversion_a"] == 0.0


# ---------------------------------------------------------------------------
# G13 — MDE negativo → 400 (e demais guards de sample-size)
# ---------------------------------------------------------------------------

def test_g13_negative_mde_rejected():
    r = client.post("/api/calculate-sample-size",
                    json={"baseline_conversion": 0.05, "mde": -0.01})
    assert r.status_code == 400


def test_g13_zero_mde_rejected():
    r = client.post("/api/calculate-sample-size",
                    json={"baseline_conversion": 0.05, "mde": 0})
    assert r.status_code == 400


def test_g13_tiny_mde_rejected_with_honest_message():
    r = client.post("/api/calculate-sample-size",
                    json={"baseline_conversion": 0.05, "mde": 1e-9})
    assert r.status_code == 400
    assert "MDE" in r.get_json()["error"]


def test_g13_nonfinite_alpha_power_rejected():
    for overrides in ({"alpha": "nan"}, {"power": float("inf")}):
        r = client.post("/api/calculate-sample-size",
                        json={"baseline_conversion": 0.05, "mde": 0.01, **overrides})
        assert r.status_code == 400, overrides


def test_g13_negative_mpe_rejected_in_analyze():
    _analyze_error({"visitors_a": 1000, "conversions_a": 50,
                    "visitors_b": 1000, "conversions_b": 65, "mpe": -0.01})


# ---------------------------------------------------------------------------
# Sample-size: fechado contra Cohen's h + monotonicidade
# ---------------------------------------------------------------------------

def test_sample_size_matches_closed_form_cohen_h():
    payload = {"baseline_conversion": 0.05, "mde": 0.01, "alpha": 0.05, "power": 0.80}
    r = client.post("/api/calculate-sample-size", json=payload)
    assert r.status_code == 200
    data = r.get_json()
    n = data["n_per_group"]
    assert isinstance(n, int) and n > 0
    assert data["effect_size_h"] > 0
    assert "note" in data
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


def test_sample_size_invalid_sum_over_one():
    r = client.post("/api/calculate-sample-size", json={"baseline_conversion": 0.9, "mde": 0.2})
    assert r.status_code == 400


def test_sample_size_custom_alpha_changes_n():
    base = {"baseline_conversion": 0.05, "mde": 0.01, "power": 0.80}
    lax = client.post("/api/calculate-sample-size", json={**base, "alpha": 0.10}).get_json()["n_per_group"]
    strict = client.post("/api/calculate-sample-size", json={**base, "alpha": 0.01}).get_json()["n_per_group"]
    assert strict > lax


# ---------------------------------------------------------------------------
# Validações legadas de analyze
# ---------------------------------------------------------------------------

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


def test_analyze_validation_alpha_bounds():
    for alpha in (0.0, 1.0, 1.5):
        r = client.post("/api/analyze", json={"visitors_a": 1000, "conversions_a": 50,
                                              "visitors_b": 1000, "conversions_b": 65,
                                              "alpha": alpha})
        assert r.status_code == 400, alpha


def test_analyze_validation_n_comparisons():
    r = client.post("/api/analyze", json={"visitors_a": 1000, "conversions_a": 50,
                                          "visitors_b": 1000, "conversions_b": 65,
                                          "n_comparisons": 0})
    assert r.status_code == 400


def test_analyze_inconclusive_small_sample():
    data = _analyze({"visitors_a": 1000, "conversions_a": 50,
                     "visitors_b": 1000, "conversions_b": 52, "alpha": 0.05})
    assert data["status"] == "Inconclusivo"
    assert data["significant"] is False


def test_analyze_warns_on_few_successes():
    data = _analyze({"visitors_a": 100, "conversions_a": 1,
                     "visitors_b": 100, "conversions_b": 6, "alpha": 0.05})
    assert any("aproximação normal" in w for w in data["warnings"])


def test_demo_analyze_payload_is_melhora():
    demo = client.get("/api/demo").get_json()["analyze"]
    data = _analyze(demo)
    assert data["status"] == "Melhora"
