'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FlaskConical, User } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const BADGES = [
  'Next.js',
  'TypeScript',
  'FastAPI',
  'SciPy',
  'statsmodels',
];

type AnalysisResult = {
  p_value: number;
  uplift: number;
  conversion_a: number;
  conversion_b: number;
  ci_low: number;
  ci_high: number;
  alpha: number;
  n_comparisons: number;
  alpha_adjusted: number;
  significant: boolean;
  status: 'Winner' | 'Weak Effect' | 'Inconclusive';
  interpretation: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'plan' | 'analyze'>('plan');

  // Plan State
  const [baseline, setBaseline] = useState('0.05');
  const [mde, setMde] = useState('0.01');
  const [alphaPlan, setAlphaPlan] = useState('0.05');
  const [power, setPower] = useState('0.80');
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  // Analyze State
  const [visitorsA, setVisitorsA] = useState('');
  const [conversionsA, setConversionsA] = useState('');
  const [visitorsB, setVisitorsB] = useState('');
  const [conversionsB, setConversionsB] = useState('');
  const [alphaAnalyze, setAlphaAnalyze] = useState('0.05');
  const [nComparisons, setNComparisons] = useState('1');
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const calculateSample = async () => {
    try {
      const res = await fetch('/api/calculate-sample-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline_conversion: parseFloat(baseline),
          mde: parseFloat(mde),
          alpha: parseFloat(alphaPlan),
          power: parseFloat(power),
        }),
      });
      const data = await res.json();
      setSampleSize(data.n_per_group);
    } catch {
      toast.error('Falha ao conectar com o backend');
    }
  };

  const analyze = async () => {
    if (!visitorsA || !visitorsB) {
      toast.error('Preencha todos os campos');
      return;
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitors_a: parseInt(visitorsA),
          conversions_a: parseInt(conversionsA),
          visitors_b: parseInt(visitorsB),
          conversions_b: parseInt(conversionsB),
          alpha: parseFloat(alphaAnalyze),
          n_comparisons: parseInt(nComparisons),
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setAnalysis(data);
    } catch {
      toast.error('Falha ao conectar com o backend');
    }
  };

  const loadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/demo');
      const { sample_size: ss, analysis: an } = await res.json();

      setBaseline(String(ss.baseline_conversion));
      setMde(String(ss.mde));
      setAlphaPlan(String(ss.alpha));
      setPower(String(ss.power));
      setVisitorsA(String(an.visitors_a));
      setConversionsA(String(an.conversions_a));
      setVisitorsB(String(an.visitors_b));
      setConversionsB(String(an.conversions_b));
      setAlphaAnalyze(String(an.alpha));
      setNComparisons(String(an.n_comparisons));

      setActiveTab('plan');

      const ssRes = await fetch('/api/calculate-sample-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline_conversion: ss.baseline_conversion,
          mde: ss.mde,
          alpha: ss.alpha,
          power: ss.power,
        }),
      });
      const { n_per_group } = await ssRes.json();
      setSampleSize(n_per_group);

      setActiveTab('analyze');

      const anRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitors_a: an.visitors_a,
          conversions_a: an.conversions_a,
          visitors_b: an.visitors_b,
          conversions_b: an.conversions_b,
          alpha: an.alpha,
          n_comparisons: an.n_comparisons,
        }),
      });
      const anData = await anRes.json();
      setAnalysis(anData);

      toast.success('Dados de demonstração carregados');
    } catch {
      toast.error('Falha ao carregar demonstração');
    } finally {
      setLoadingDemo(false);
    }
  };

  const copyReport = () => {
    if (!analysis) return;
    const text = `StatLab — Variante B: ${((analysis.uplift) * 100).toFixed(1)}% de uplift. p-value: ${analysis.p_value.toFixed(4)}. Alpha ajustado (Bonferroni): ${analysis.alpha_adjusted.toFixed(4)}. Decisão: ${analysis.status}.`;
    navigator.clipboard.writeText(text);
    toast.success('Relatório copiado para a área de transferência');
  };

  const statusColor: Record<string, string> = {
    Winner: '#16a34a',
    'Weak Effect': '#d97706',
    Inconclusive: '#64748b',
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans flex flex-col">
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto w-full space-y-8 flex-1">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              StatLab Experiments
            </h1>
            <div className="flex gap-3 text-sm">
              <a
                href="https://barujafe.vercel.app/"
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
              >
                <User size={14} /> Portfólio
              </a>
              <a
                href="https://github.com/BarujaFe1/StatLab-Experiments"
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-slate-500">
            Planeje e interprete testes A/B com rigor estatístico (Z-test com correção de Bonferroni).
          </p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span
                key={b}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-900 text-white"
              >
                {b}
              </span>
            ))}
          </div>
          <button
            onClick={loadDemo}
            disabled={loadingDemo}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            <FlaskConical size={16} />
            {loadingDemo ? 'Carregando...' : 'Carregar dados de demonstração'}
          </button>
        </header>

        <div className="flex p-1 bg-slate-200 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'plan' ? 'bg-white shadow-sm' : ''}`}
          >
            Planejar
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'analyze' ? 'bg-white shadow-sm' : ''}`}
          >
            Analisar
          </button>
        </div>

        {activeTab === 'plan' ? (
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Cálculo de tamanho amostral</h2>
            <input
              placeholder="Conversão base (ex. 0.05)"
              value={baseline}
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setBaseline(e.target.value)}
            />
            <input
              placeholder="MDE - efeito mínimo detectável (ex. 0.01)"
              value={mde}
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setMde(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Alpha (ex. 0.05)"
                value={alphaPlan}
                className="w-full p-3 border rounded-lg"
                onChange={(e) => setAlphaPlan(e.target.value)}
              />
              <input
                placeholder="Poder (ex. 0.80)"
                value={power}
                className="w-full p-3 border rounded-lg"
                onChange={(e) => setPower(e.target.value)}
              />
            </div>
            <button
              onClick={calculateSample}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition"
            >
              Calcular
            </button>
            {sampleSize && (
              <div className="pt-6 border-t mt-4">
                <p className="text-sm text-slate-500">Tamanho amostral sugerido por grupo:</p>
                <p className="text-3xl font-bold">{sampleSize.toLocaleString('pt-BR')}</p>
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Análise do experimento</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Visitantes A"
                value={visitorsA}
                className="p-3 border rounded-lg"
                onChange={(e) => setVisitorsA(e.target.value)}
              />
              <input
                placeholder="Conversões A"
                value={conversionsA}
                className="p-3 border rounded-lg"
                onChange={(e) => setConversionsA(e.target.value)}
              />
              <input
                placeholder="Visitantes B"
                value={visitorsB}
                className="p-3 border rounded-lg"
                onChange={(e) => setVisitorsB(e.target.value)}
              />
              <input
                placeholder="Conversões B"
                value={conversionsB}
                className="p-3 border rounded-lg"
                onChange={(e) => setConversionsB(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Alpha (ex. 0.05)"
                value={alphaAnalyze}
                className="p-3 border rounded-lg"
                onChange={(e) => setAlphaAnalyze(e.target.value)}
              />
              <input
                placeholder="Nº de comparações (Bonferroni)"
                value={nComparisons}
                className="p-3 border rounded-lg"
                onChange={(e) => setNComparisons(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={analyze}
                className="flex-1 bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Analisar
              </button>
              <button
                onClick={loadDemo}
                disabled={loadingDemo}
                className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
              >
                <FlaskConical size={16} />
              </button>
            </div>
            {analysis && (
              <div className="space-y-6 pt-6 border-t">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ n: 'A', r: analysis.conversion_a * 100 }, { n: 'B', r: analysis.conversion_b * 100 }]}>
                      <XAxis dataKey="n" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
                      <Bar dataKey="r" fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Decisão</p>
                  <p className="text-lg font-semibold" style={{ color: statusColor[analysis.status] || '#0f172a' }}>
                    {analysis.status}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{analysis.interpretation}</p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
                    <span>Conversão A: <strong>{(analysis.conversion_a * 100).toFixed(2)}%</strong></span>
                    <span>Conversão B: <strong>{(analysis.conversion_b * 100).toFixed(2)}%</strong></span>
                    <span>p-value: <strong>{analysis.p_value.toFixed(4)}</strong></span>
                    <span>Uplift: <strong>{(analysis.uplift * 100).toFixed(1)}%</strong></span>
                    <span>IC {(1 - analysis.alpha_adjusted).toFixed(2)}: <strong>[{((analysis.ci_low) * 100).toFixed(2)}%, {((analysis.ci_high) * 100).toFixed(2)}%]</strong></span>
                    <span>Alpha ajustado: <strong>{analysis.alpha_adjusted.toFixed(4)}</strong></span>
                  </div>
                </div>

                <button onClick={copyReport} className="text-sm text-slate-500 underline">
                  Copiar relatório para a área de transferência
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
