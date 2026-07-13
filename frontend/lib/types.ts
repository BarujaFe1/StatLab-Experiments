export interface AnalysisResult {
  p_value: number;
  alpha_ajustado: number;
  alpha?: number;
  n_comparisons?: number;
  mpe?: number;
  uplift: number;
  absolute_diff?: number;
  conversion_a: number;
  conversion_b: number;
  ci_low: number;
  ci_high: number;
  significant: boolean;
  practically_significant?: boolean;
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
  Vencedor: '#16a34a',
  'Efeito Fraco': '#d97706',
  Inconclusivo: '#64748b',
};

export const SCENARIO_ORDER = [
  'vencedor',
  'efeito_fraco',
  'inconclusivo',
  'zero_conversoes',
] as const;
