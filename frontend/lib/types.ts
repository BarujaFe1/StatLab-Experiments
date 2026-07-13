export interface AnalysisResult {
  p_value: number;
  alpha_ajustado: number;
  uplift: number;
  conversion_a: number;
  conversion_b: number;
  ci_low: number;
  ci_high: number;
  significant: boolean;
  status: string;
  interpretation: string;
}

export interface AnalysisInput {
  visitors_a: number;
  conversions_a: number;
  visitors_b: number;
  conversions_b: number;
  alpha: number;
  n_comparisons: number;
  mpe?: number;
}

export const STATUS_COLOR: Record<string, string> = {
  Vencedor: '#16a34a',
  'Efeito Fraco': '#d97706',
  Inconclusivo: '#64748b',
};
