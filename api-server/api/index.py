import math
import re

import numpy as np
from flask import Flask, jsonify, request
from scipy.stats import norm
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import confint_proportions_2indep, proportions_ztest

app = Flask(__name__)

STATUS_MELHORA = "Melhora"
STATUS_REGRESSAO = "Regressão"
STATUS_EFEITO_FRACO = "Efeito Fraco"
STATUS_INCONCLUSIVO = "Inconclusivo"

CI_METHOD = "newcomb"

# solve_power aceita MDEs que implicam dezenas de milhões de observações por
# grupo; acima disso o resultado não é acionável, então devolvemos validação.
MAX_N_PER_GROUP = 100_000_000

ASSUMPTIONS_SUMMARY = [
    "Amostras independentes entre A e B (sem sobreposição de usuários).",
    "Desfecho binário (converteu / não converteu) por observação.",
    "Observações independentes dentro de cada braço.",
    "Aproximação normal do z-test de duas proporções (sucessos e falhas suficientes por braço).",
    "Causalidade só vale se a aleatorização e o design do experimento forem válidos.",
    "Bonferroni controla erro familial porém é conservador.",
    "Sem correção para testes sequenciais/peeking — analyse uma única vez.",
    "Sem checagem automática de SRM (Sample Ratio Mismatch).",
    "O status do motor é apoio à decisão; não autoriza rollout por si só.",
]


def _error(message, code=400):
    return jsonify({"error": message}), code


def _json_object_or_error():
    """Exige que o body seja um objeto JSON; listas/strings/escalares viram 400."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, _error("O corpo da requisição deve ser um objeto JSON.")
    return data, None


def _parse_strict_int(value, field):
    """Inteiro estrito: rejeita bool, floats fracionários, NaN/Inf e strings inválidas."""
    if isinstance(value, bool):
        raise ValueError(f"{field} deve ser um inteiro (booleano recebido).")
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if not math.isfinite(value) or value != int(value):
            raise ValueError(f"{field} deve ser um inteiro sem casas decimais.")
        return int(value)
    if isinstance(value, str):
        if re.fullmatch(r"[+-]?\d+", value.strip() or ""):
            return int(value.strip())
        raise ValueError(f"{field} deve ser um inteiro válido.")
    raise ValueError(f"{field} é obrigatório e deve ser um inteiro.")


def _parse_float(value, field):
    """Float estrito: rejeita bool, NaN/Inf e strings não numéricas."""
    if isinstance(value, bool):
        raise ValueError(f"{field} deve ser numérico (booleano recebido).")
    if isinstance(value, (int, float)):
        result = float(value)
    elif isinstance(value, str):
        try:
            result = float(value.strip())
        except ValueError as exc:
            raise ValueError(f"{field} deve ser numérico.") from exc
    else:
        raise ValueError(f"{field} é obrigatório e deve ser numérico.")
    if not math.isfinite(result):
        raise ValueError(f"{field} deve ser um número finito.")
    return result


def interpret_result(diff, test_defined, p_val, alpha_adj, mpe):
    """Motor de decisão em 4 estados, com direção assinada (diff = pB - pA).

    Melhora:        p < alpha_adj e diff > +mpe
    Regressão:      p < alpha_adj e diff < -mpe
    Efeito Fraco:   p < alpha_adj e |diff| <= mpe
    Inconclusivo:   p >= alpha_adj ou teste indefinido
    """
    if not test_defined:
        return (
            STATUS_INCONCLUSIVO,
            "O z-test não está definido para estas contagens (variância nula sob H0, "
            "por exemplo 0% vs 0% ou 100% vs 100%). Sem p-valor não há evidência "
            "para concluir sobre A vs B; o intervalo de confiança ainda é reportado.",
        )
    if p_val >= alpha_adj:
        return (
            STATUS_INCONCLUSIVO,
            "Sob as premissas do teste, os dados não fornecem evidência suficiente "
            "no nível ajustado. Evidência insuficiente não é prova de ausência de "
            "efeito: aumente a amostra, revise o MDE ou a hipótese.",
        )
    if diff > mpe:
        return (
            STATUS_MELHORA,
            "Sob as premissas do teste, há evidência estatística (p < alpha ajustado) "
            "de efeito positivo observado acima do MPE. Valide instrumentação, "
            "duração e custo de rollout antes de decidir.",
        )
    if diff < -mpe:
        return (
            STATUS_REGRESSAO,
            "Sob as premissas do teste, há evidência estatística de efeito NEGATIVO: "
            "B converteu menos que A além do MPE. Não promova B; investigue "
            "instrumentação e hipóteses antes de descartar ou redesenhar.",
        )
    return (
        STATUS_EFEITO_FRACO,
        "Há sinal estatístico, mas o efeito absoluto observado é menor ou igual ao "
        "MPE. Significância não implica impacto de negócio suficiente para rollout.",
    )


def decision_checklist(status, abs_diff, mpe, n_a, n_b, alpha_adj):
    items = [
        "Confirme se a alocação A/B e a instrumentação estão corretas.",
        "Evite peeking repetido sem correção sequencial (este MVP usa Bonferroni estático).",
    ]
    if status == STATUS_MELHORA:
        items.append(
            f"Efeito absoluto observado ({abs_diff:.4f}) supera o MPE ({mpe:.4f}) a favor de B."
        )
        items.append("Estime custo/benefício do rollout antes de promover.")
    elif status == STATUS_REGRESSAO:
        items.append(
            f"Efeito absoluto observado ({abs_diff:.4f}) supera o MPE ({mpe:.4f}) contra B."
        )
        items.append("Mantenha A ou reverta B; só então investigue a causa do prejuízo.")
    elif status == STATUS_EFEITO_FRACO:
        items.append(
            f"Efeito absoluto ({abs_diff:.4f}) ≤ MPE ({mpe:.4f}): sinal sem relevância prática."
        )
        items.append("Considere se o MPE está alinhado ao negócio ou se o experimento vale redesenho.")
    else:
        total_n = n_a + n_b
        items.append(
            f"Amostra atual n={total_n} com alpha_ajustado={alpha_adj:.4f} ainda não sustenta conclusão forte."
        )
        items.append("Use a aba Planejar para estimar n sob um MDE realista e poder desejado.")
    return items


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "statlab-experiments-api"})


@app.route("/api/assumptions", methods=["GET"])
def assumptions():
    return jsonify({"assumptions": ASSUMPTIONS_SUMMARY})


@app.route("/api/calculate-sample-size", methods=["POST"])
def calculate_sample_size():
    data, err = _json_object_or_error()
    if err:
        return err
    try:
        baseline = _parse_float(data.get("baseline_conversion"), "baseline_conversion")
        mde = _parse_float(data.get("mde"), "mde")
        alpha = _parse_float(data.get("alpha", 0.05), "alpha")
        power = _parse_float(data.get("power", 0.80), "power")
    except ValueError as exc:
        return _error(str(exc))

    if not (0.0 < baseline < 1.0):
        return _error("baseline_conversion deve estar entre 0 e 1 (exclusive).")
    if mde <= 0:
        return _error("mde deve ser positivo (diferença absoluta desejada, ex.: 0.01 = 1 pp).")
    p2 = baseline + mde
    if not (0.0 < p2 < 1.0):
        return _error("baseline_conversion + mde deve permanecer em (0, 1).")
    if not (0.0 < alpha < 1.0):
        return _error("alpha deve estar entre 0 e 1.")
    if not (0.0 < power < 1.0):
        return _error("power deve estar entre 0 e 1.")

    h = 2 * (math.asin(math.sqrt(baseline)) - math.asin(math.sqrt(p2)))
    try:
        n = NormalIndPower().solve_power(
            effect_size=abs(h), alpha=alpha, power=power, ratio=1
        )
    except (ValueError, OverflowError, RuntimeError):
        return _error("Não foi possível resolver o tamanho amostral com estes parâmetros.")
    if not math.isfinite(n) or n > MAX_N_PER_GROUP:
        return _error(
            "MDE pequeno demais para o baseline informado: a amostra exigida por grupo "
            f"supera {MAX_N_PER_GROUP:,} observações. Revise o MDE."
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
    data, err = _json_object_or_error()
    if err:
        return err
    try:
        visitors_a = _parse_strict_int(data.get("visitors_a"), "visitors_a")
        conversions_a = _parse_strict_int(data.get("conversions_a"), "conversions_a")
        visitors_b = _parse_strict_int(data.get("visitors_b"), "visitors_b")
        conversions_b = _parse_strict_int(data.get("conversions_b"), "conversions_b")
        alpha = _parse_float(data.get("alpha", 0.05), "alpha")
        n_comparisons = _parse_strict_int(data.get("n_comparisons", 1), "n_comparisons")
        mpe = _parse_float(data.get("mpe", 0.005), "mpe")
    except ValueError as exc:
        return _error(str(exc))

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
    warnings_list = []

    import warnings as _warnings

    with _warnings.catch_warnings():
        _warnings.filterwarnings("ignore", message="invalid value encountered*")
        try:
            _z_stat, p_val_raw = proportions_ztest(count, nobs)
        except (ValueError, ZeroDivisionError):
            p_val_raw = float("nan")
    p_val = None if p_val_raw is None else float(p_val_raw)
    test_defined = p_val is not None and math.isfinite(p_val) and not math.isnan(p_val)
    if not test_defined:
        warnings_list.append(
            "Teste z indefinido (variância nula sob H0): p-valor não reportado."
        )

    # Regra de bolso documentada para a aproximação normal do z-test.
    for label, conv, visit in (("A", conversions_a, visitors_a), ("B", conversions_b, visitors_b)):
        if min(conv, visit - conv) < 5:
            warnings_list.append(
                f"Poucos sucessos ou falhas no braço {label} ({conv}/{visit}): "
                "a aproximação normal pode ser inadequada; interprete com cautela."
            )

    diff = p_b - p_a
    alpha_adj = alpha / n_comparisons
    ci_level = 1.0 - alpha_adj

    # Newcombe (Wilson híbrido) para pB - pA no nível ajustado — ver
    # docs/STATISTICAL_METHOD.md: o score test usa variância pooled sob H0 e o
    # IC usa variâncias próprias de cada braço; métodos distintos por design.
    ci_low, ci_high = confint_proportions_2indep(
        conversions_b, visitors_b, conversions_a, visitors_a,
        compare="diff", method=CI_METHOD, alpha=alpha_adj,
    )

    status, interpretation = interpret_result(
        diff, test_defined, p_val if test_defined else 1.0, alpha_adj, mpe
    )
    uplift = (p_b / p_a - 1) if p_a > 0 else None
    abs_diff = abs(diff)
    significant = bool(test_defined and p_val < alpha_adj)
    practical = abs_diff > mpe

    if significant and diff > mpe:
        direction = "positive"
    elif significant and diff < -mpe:
        direction = "negative"
    else:
        direction = "neutral"

    return jsonify(
        {
            "test_defined": test_defined,
            "p_value": float(p_val) if test_defined else None,
            "warnings": warnings_list,
            "alpha_ajustado": float(alpha_adj),
            "alpha": float(alpha),
            "n_comparisons": int(n_comparisons),
            "mpe": float(mpe),
            "uplift": float(uplift) if uplift is not None else None,
            "absolute_diff": float(diff),
            "conversion_a": float(p_a),
            "conversion_b": float(p_b),
            "ci_low": float(ci_low),
            "ci_high": float(ci_high),
            "ci_level": float(ci_level),
            "ci_method": CI_METHOD,
            "significant": significant,
            "practically_significant": bool(practical),
            "direction": direction,
            "status": status,
            "interpretation": interpretation,
            "next_steps": decision_checklist(
                status, abs_diff, mpe, visitors_a, visitors_b, alpha_adj
            ),
        }
    )


SCENARIOS = {
    "melhora": {
        "label": "Melhora (sinal + relevância)",
        "analyze": {
            "visitors_a": 10000,
            "conversions_a": 500,
            "visitors_b": 10000,
            "conversions_b": 580,
            "alpha": 0.05,
            "n_comparisons": 3,
            "mpe": 0.005,
        },
        "lesson": "Significância após Bonferroni e efeito absoluto acima do MPE, a favor de B.",
    },
    "regressao": {
        "label": "Regressão (B significativamente pior)",
        "analyze": {
            "visitors_a": 10000,
            "conversions_a": 6000,
            "visitors_b": 10000,
            "conversions_b": 5800,
            "alpha": 0.05,
            "n_comparisons": 1,
            "mpe": 0.005,
        },
        "lesson": "p-valor baixo com B abaixo de A não é vitória: o sinal aponta prejuízo.",
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
        "lesson": "Sem eventos o teste é indefinido: sem p-valor fabricado, apenas o IC honesto.",
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
            "analyze": SCENARIOS["melhora"]["analyze"],
            "scenarios": SCENARIOS,
            "assumptions": ASSUMPTIONS_SUMMARY,
        }
    )


@app.route("/api/scenarios", methods=["GET"])
def scenarios():
    return jsonify({"scenarios": SCENARIOS})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
