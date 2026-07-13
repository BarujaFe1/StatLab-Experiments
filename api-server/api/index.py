from flask import Flask, request, jsonify
import math
import warnings
import numpy as np
from scipy.stats import norm
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportions_ztest

app = Flask(__name__)


def _error(message, code=400):
    return jsonify({"error": message}), code


def interpret_result(p_val, p_a, p_b, alpha_adj=0.05, mpe=0.005):
    diff = p_b - p_a
    is_significant = p_val < alpha_adj
    is_practically_significant = abs(diff) > mpe
    if is_significant and is_practically_significant:
        return (
            "Vencedor",
            "A variante B apresenta resultado estatisticamente significativo "
            "e relevância prática (efeito absoluto acima do MPE). "
            "Ainda assim, valide instrumentação, duração e custo de rollout "
            "antes de decidir.",
        )
    elif is_significant and not is_practically_significant:
        return (
            "Efeito Fraco",
            "Há sinal estatístico, mas o efeito absoluto é menor ou igual ao MPE. "
            "Significância não implica impacto de negócio suficiente para rollout.",
        )
    else:
        return (
            "Inconclusivo",
            "Os dados não fornecem evidência suficiente sob o alpha ajustado. "
            "Evite declarar vencedor: aumente amostra, revise o MDE ou a hipótese.",
        )


def decision_checklist(status, abs_diff, mpe, n_a, n_b, alpha_adj):
    items = [
        "Confirme se a alocação A/B e a instrumentação estão corretas.",
        "Evite peeking repetido sem correção sequencial (este MVP usa Bonferroni estático).",
    ]
    if status == "Vencedor":
        items.append(
            f"Efeito absoluto observado ({abs_diff:.4f}) supera o MPE ({mpe:.4f})."
        )
        items.append("Estime custo/benefício do rollout antes de promover.")
    elif status == "Efeito Fraco":
        items.append(
            f"Efeito absoluto ({abs_diff:.4f}) ≤ MPE ({mpe:.4f}): sinal sem relevância prática."
        )
        items.append("Considere se o MPE está alinhado ao negócio ou se o experimento vale redesenho.")
    else:
        total_n = n_a + n_b
        items.append(
            f"Amostra atual n={total_n} com alpha_ajustado={alpha_adj:.4f} ainda não sustenta decisão forte."
        )
        items.append("Use a aba Planejar para estimar n sob um MDE realista e poder desejado.")
    return items


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "statlab-experiments-api"})


@app.route("/api/calculate-sample-size", methods=["POST"])
def calculate_sample_size():
    data = request.get_json(silent=True) or {}
    try:
        baseline = float(data.get("baseline_conversion"))
        mde = float(data.get("mde"))
        alpha = float(data.get("alpha", 0.05))
        power = float(data.get("power", 0.80))
    except (TypeError, ValueError):
        return _error("Campos numéricos ausentes ou inválidos.")

    if not (0.0 < baseline < 1.0):
        return _error("baseline_conversion deve estar entre 0 e 1 (exclusive).")
    if mde == 0:
        return _error("mde deve ser diferente de zero.")
    p2 = baseline + mde
    if not (0.0 < p2 < 1.0):
        return _error("baseline_conversion + mde deve permanecer em (0, 1).")
    if not (0.0 < alpha < 1.0):
        return _error("alpha deve estar entre 0 e 1.")
    if not (0.0 < power < 1.0):
        return _error("power deve estar entre 0 e 1.")

    h = 2 * (math.asin(math.sqrt(baseline)) - math.asin(math.sqrt(p2)))
    n = NormalIndPower().solve_power(
        effect_size=abs(h), alpha=alpha, power=power, ratio=1
    )
    n_per_group = int(math.ceil(n))
    return jsonify(
        {
            "n_per_group": n_per_group,
            "baseline_conversion": baseline,
            "mde": mde,
            "alpha": alpha,
            "power": power,
            "effect_size_h": float(abs(h)),
            "note": (
                "O MDE é o menor efeito absoluto que você quer detectar com o poder "
                "configurado. Amostra insuficiente aumenta falso negativo; "
                "MDE irrealista infla o n e atrasa o experimento."
            ),
        }
    )


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    try:
        visitors_a = int(data.get("visitors_a"))
        conversions_a = int(data.get("conversions_a"))
        visitors_b = int(data.get("visitors_b"))
        conversions_b = int(data.get("conversions_b"))
        alpha = float(data.get("alpha", 0.05))
        n_comparisons = int(data.get("n_comparisons", 1))
        mpe = float(data.get("mpe", 0.005))
    except (TypeError, ValueError):
        return _error("Campos numéricos ausentes ou inválidos.")

    if visitors_a <= 0 or visitors_b <= 0:
        return _error("visitors_a e visitors_b devem ser inteiros positivos.")
    if conversions_a < 0 or conversions_b < 0:
        return _error("As conversões não podem ser negativas.")
    if conversions_a > visitors_a or conversions_b > visitors_b:
        return _error("As conversões não podem exceder os visitantes.")
    if not (0.0 < alpha < 1.0):
        return _error("alpha deve estar entre 0 e 1.")
    if n_comparisons < 1:
        return _error("n_comparisons deve ser >= 1.")
    if mpe < 0:
        return _error("mpe não pode ser negativo.")

    p_a = conversions_a / visitors_a
    p_b = conversions_b / visitors_b
    count = np.array([conversions_a, conversions_b])
    nobs = np.array([visitors_a, visitors_b])

    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore",
            message="invalid value encountered in scalar divide",
            category=RuntimeWarning,
        )
        _z_stat, p_val = proportions_ztest(count, nobs)
    if p_val is None or math.isnan(float(p_val)):
        p_val = 1.0

    variance_a = (p_a * (1 - p_a)) / visitors_a
    variance_b = (p_b * (1 - p_b)) / visitors_b
    se = math.sqrt(max(0.0, variance_a + variance_b))
    diff = p_b - p_a

    z = norm.ppf(1 - alpha / 2)
    ci_low = diff - z * se
    ci_high = diff + z * se

    alpha_adj = alpha / n_comparisons
    status, interpretation = interpret_result(p_val, p_a, p_b, alpha_adj, mpe)
    uplift = (p_b / p_a - 1) if p_a > 0 else 0.0
    abs_diff = abs(diff)
    practical = abs_diff > mpe
    significant = bool(p_val < alpha_adj)

    return jsonify(
        {
            "p_value": float(p_val),
            "alpha_ajustado": float(alpha_adj),
            "alpha": float(alpha),
            "n_comparisons": int(n_comparisons),
            "mpe": float(mpe),
            "uplift": float(uplift),
            "absolute_diff": float(diff),
            "conversion_a": float(p_a),
            "conversion_b": float(p_b),
            "ci_low": float(ci_low),
            "ci_high": float(ci_high),
            "significant": significant,
            "practically_significant": bool(practical),
            "status": status,
            "interpretation": interpretation,
            "next_steps": decision_checklist(
                status, abs_diff, mpe, visitors_a, visitors_b, alpha_adj
            ),
        }
    )


SCENARIOS = {
    "vencedor": {
        "label": "Vencedor (sinal + relevância)",
        "analyze": {
            "visitors_a": 10000,
            "conversions_a": 500,
            "visitors_b": 10000,
            "conversions_b": 580,
            "alpha": 0.05,
            "n_comparisons": 3,
            "mpe": 0.005,
        },
        "lesson": "Significância após Bonferroni e efeito absoluto acima do MPE.",
    },
    "efeito_fraco": {
        "label": "Efeito Fraco (sinal sem relevância)",
        "analyze": {
            "visitors_a": 10000,
            "conversions_a": 500,
            "visitors_b": 10000,
            "conversions_b": 580,
            "alpha": 0.05,
            "n_comparisons": 1,
            "mpe": 0.05,
        },
        "lesson": "p-valor pode ser baixo e mesmo assim o efeito ser pequeno demais para o negócio.",
    },
    "inconclusivo": {
        "label": "Inconclusivo (amostra insuficiente)",
        "analyze": {
            "visitors_a": 800,
            "conversions_a": 40,
            "visitors_b": 800,
            "conversions_b": 48,
            "alpha": 0.05,
            "n_comparisons": 1,
            "mpe": 0.005,
        },
        "lesson": "Uplift pontual positivo não autoriza decisão forte sem poder amostral.",
    },
    "zero_conversoes": {
        "label": "Caso-limite (zero conversões)",
        "analyze": {
            "visitors_a": 1000,
            "conversions_a": 0,
            "visitors_b": 1000,
            "conversions_b": 0,
            "alpha": 0.05,
            "n_comparisons": 1,
            "mpe": 0.005,
        },
        "lesson": "Sem eventos, não há evidência — a API retorna Inconclusivo sem crash.",
    },
}


@app.route("/api/demo", methods=["GET"])
def demo():
    return jsonify(
        {
            "sample_size": {
                "baseline_conversion": 0.05,
                "mde": 0.01,
                "alpha": 0.05,
                "power": 0.80,
            },
            "analyze": SCENARIOS["vencedor"]["analyze"],
            "scenarios": SCENARIOS,
        }
    )


@app.route("/api/scenarios", methods=["GET"])
def scenarios():
    return jsonify({"scenarios": SCENARIOS})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
