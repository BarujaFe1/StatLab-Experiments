import math
import numpy as np

def interpret_result(p_val, p_a, p_b, ci_low, ci_high, alpha=0.05):
    uplift = (p_b / p_a) - 1 if p_a > 0 else 0
    diff = p_b - p_a
    
    # Practical significance: arbitrary threshold of 0.5% (0.005) for bin conversion
    is_practically_significant = abs(diff) > 0.005
    
    if p_val < alpha:
        if is_practically_significant:
            return "Winner probable", "The results suggest Variant B outperforms Variant A with statistical significance and practical relevance."
        else:
            return "Weak effect", "Statistically significant, but the absolute effect size is very small."
    else:
        return "Inconclusive", "The data does not support a strong conclusion. More traffic or a larger effect is needed."
