'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Toaster, toast } from 'sonner';

interface AnalysisResult {
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

interface AnalysisInput {
  visitors_a: number;
  conversions_a: number;
  visitors_b: number;
  conversions_b: number;
  alpha: number;
  n_comparisons: number;
  mpe?: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'plan' | 'analyze'>('plan');

  const [baseline, setBaseline] = useState('0.05');
  const [mde, setMde] = useState('0.01');
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  const [visitorsA, setVisitorsA] = useState('');
  const [conversionsA, setConversionsA] = useState('');
  const [visitorsB, setVisitorsB] = useState('');
  const [conversionsB, setConversionsB] = useState('');
  const [alpha, setAlpha] = useState('0.05');
  const [comparisons, setComparisons] = useState('1');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const calculateSample = async () => {
    try {
      const res = await fetch('/api/calculate-sample-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseline_conversion: parseFloat(baseline), mde: parseFloat(mde) })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Não foi possível calcular o tamanho amostral");
        return;
      }
      setSampleSize(data.n_per_group);
    } catch {
      toast.error("Erro ao conectar ao servidor");
    }
  };

  const analyze = async (override?: AnalysisInput) => {
    const body = override || {
      visitors_a: parseInt(visitorsA),
      conversions_a: parseInt(conversionsA),
      visitors_b: parseInt(visitorsB),
      conversions_b: parseInt(conversionsB),
      alpha: parseFloat(alpha),
      n_comparisons: parseInt(comparisons) || 1,
    };
    if (!body.visitors_a || !body.visitors_b) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Não foi possível analisar o experimento");
        setAnalysis(null);
        return;
      }
      setAnalysis(data);
    } catch {
      toast.error("Erro ao conectar ao servidor");
    }
  };

  const loadDemo = async () => {
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao carregar dados de demonstração");
        return;
      }
      const d = data.analyze;
      setVisitorsA(String(d.visitors_a));
      setConversionsA(String(d.conversions_a));
      setVisitorsB(String(d.visitors_b));
      setConversionsB(String(d.conversions_b));
      setAlpha(String(d.alpha));
      setComparisons(String(d.n_comparisons));
      setBaseline(String(data.sample_size.baseline_conversion));
      setMde(String(data.sample_size.mde));
      analyze(d);
    } catch {
      toast.error("Erro ao carregar dados de demonstração");
    }
  };

  const copyReport = () => {
    if (!analysis) return;
    const text = [
      "StatLab Experiments — Relatório de Análise",
      `Status: ${analysis.status}`,
      `Conversão A: ${(analysis.conversion_a * 100).toFixed(2)}%`,
      `Conversão B: ${(analysis.conversion_b * 100).toFixed(2)}%`,
      `Uplift relativo: ${(analysis.uplift * 100).toFixed(2)}%`,
      `p-valor: ${analysis.p_value.toFixed(4)}`,
      `Alpha ajustado (Bonferroni): ${analysis.alpha_ajustado.toFixed(4)}`,
      analysis.interpretation,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Relatório copiado para a área de transferência");
  };

  const statusColor: Record<string, string> = {
    Vencedor: '#16a34a',
    'Efeito Fraco': '#d97706',
    Inconclusivo: '#64748b',
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-center" />

      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">StatLab Experiments</h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-white">Next.js</span>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-teal-600 text-white">Flask</span>
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white">SciPy</span>
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white">statsmodels</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-500">
            <a href="https://barujafe.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">&larr; Portfólio</a>
            <a href="https://github.com/BarujaFe1/StatLab-Experiments" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">GitHub &nearr;</a>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-20 space-y-10">
        <div className="text-center">
          <p className="text-slate-500">Planeje e interprete testes A/B com rigor estatístico.</p>
        </div>

        <div className="flex p-1 bg-slate-200 rounded-lg w-fit mx-auto">
          <button onClick={() => setActiveTab('plan')} className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'plan' ? 'bg-white shadow-sm' : ''}`}>Planejar</button>
          <button onClick={() => setActiveTab('analyze')} className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'analyze' ? 'bg-white shadow-sm' : ''}`}>Analisar</button>
        </div>

        {activeTab === 'plan' ? (
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <input placeholder="Taxa de conversão base (ex: 0.05)" value={baseline} className="w-full p-3 border rounded-lg" onChange={(e) => setBaseline(e.target.value)} />
            <input placeholder="MDE — menor efeito detectável (ex: 0.01)" value={mde} className="w-full p-3 border rounded-lg" onChange={(e) => setMde(e.target.value)} />
            <button onClick={calculateSample} className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition">Calcular</button>
            {sampleSize && (
              <div className="pt-6 border-t mt-4">
                <p className="text-sm text-slate-500">Tamanho amostral sugerido por grupo:</p>
                <p className="text-3xl font-bold">{sampleSize.toLocaleString()}</p>
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Visitantes A" value={visitorsA} className="p-3 border rounded-lg w-full" onChange={(e) => setVisitorsA(e.target.value)} />
              <input placeholder="Conversões A" value={conversionsA} className="p-3 border rounded-lg w-full" onChange={(e) => setConversionsA(e.target.value)} />
              <input placeholder="Visitantes B" value={visitorsB} className="p-3 border rounded-lg w-full" onChange={(e) => setVisitorsB(e.target.value)} />
              <input placeholder="Conversões B" value={conversionsB} className="p-3 border rounded-lg w-full" onChange={(e) => setConversionsB(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <input placeholder="Alpha (ex: 0.05)" value={alpha} className="p-3 border rounded-lg w-full" onChange={(e) => setAlpha(e.target.value)} />
              <input placeholder="Comparações (Bonferroni)" value={comparisons} className="p-3 border rounded-lg w-full" onChange={(e) => setComparisons(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => analyze()} className="flex-1 bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition">Analisar</button>
              <button onClick={loadDemo} className="bg-slate-100 p-3 rounded-lg hover:bg-slate-200 text-sm font-medium">Carregar dados de demonstração</button>
            </div>
            {analysis && (
              <div className="space-y-6 pt-6 border-t">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ n: 'A', r: analysis.conversion_a * 100 }, { n: 'B', r: analysis.conversion_b * 100 }]}>
                      <XAxis dataKey="n" />
                      <Tooltip />
                      <Bar dataKey="r" fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Decisão</p>
                  <p className="text-lg font-semibold" style={{ color: statusColor[analysis.status] || '#0f172a' }}>{analysis.status}</p>
                  <p className="text-sm text-slate-600 mt-2">{analysis.interpretation}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
                    <div><span className="font-medium">p-valor:</span> {analysis.p_value.toFixed(4)}</div>
                    <div><span className="font-medium">Alpha ajustado:</span> {analysis.alpha_ajustado.toFixed(4)}</div>
                    <div><span className="font-medium">Uplift:</span> {(analysis.uplift * 100).toFixed(2)}%</div>
                    <div><span className="font-medium">IC 95%:</span> [{analysis.ci_low.toFixed(4)}, {analysis.ci_high.toFixed(4)}]</div>
                  </div>
                </div>
                <button onClick={copyReport} className="text-sm text-slate-500 underline">Copiar relatório</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
