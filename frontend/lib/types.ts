export interface AnalysisResult {
  test_defined: boolean;
  p_value: number | null;
  warnings?: string[];
  alpha_ajustado: number;
  alpha?: number;
  n_comparisons?: number;
  mpe?: number;
  uplift: number | null;
  absolute_diff?: number;
  conversion_a: number;
  conversion_b: number;
  ci_low: number;
  ci_high: number;
  ci_level?: number;
  ci_method?: string;
  significant: boolean;
  practically_significant?: boolean;
  direction: 'positive' | 'negative' | 'neutral';
  status: string;
  interpretation: string;
  next_steps?: string[];
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

export interface Scenario {
  label: string;
  lesson: string;
  analyze: AnalysisInput;
}

export const STATUS_COLOR: Record<string, string> = {
  Melhora: '#16a34a',
  Regressão: '#dc2626',
  'Efeito Fraco': '#d97706',
  Inconclusivo: '#64748b',
};

export const DIRECTION_LABEL: Record<string, string> = {
  positive: 'Efeito a favor de B',
  negative: 'Efeito contra B',
  neutral: 'Sem direção conclusiva',
};

export const SCENARIO_ORDER = [
  'melhora',
  'regressao',
  'efeito_fraco',
  'inconclusivo',
  'zero_conversoes',
] as const;
