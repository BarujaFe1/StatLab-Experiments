import math

def interpret_result(p_val, p_a, p_b, ci_low, ci_high, alpha_adj=0.05, mpe=0.005):
    diff = p_b - p_a
    is_significant = p_val < alpha_adj
    is_practically_significant = abs(diff) > mpe

    if is_significant and is_practically_significant:
        return (
            "Vencedor",
            "A variante B apresenta resultado estatisticamente significativo "
            "e relevância prática. Recomenda-se considerar o rollout."
        )
    elif is_significant and not is_practically_significant:
        return (
            "Efeito Fraco",
            "Resultado estatisticamente significativo, mas o tamanho do efeito "
            "é muito pequeno para justificar rollout. Avalie o custo-benefício."
        )
    else:
        return (
            "Inconclusivo",
            "Os dados não fornecem evidência suficiente para uma conclusão "
            "forte. Considere aumentar o tráfego ou revisar o experimento."
        )
