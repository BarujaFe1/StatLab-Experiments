'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Toaster, toast } from 'sonner';
import type { AnalysisInput, AnalysisResult } from '@/lib/types';
import { STATUS_COLOR } from '@/lib/types';

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'decimal',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric';
}) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        id={id}
        name={id}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full p-3 border border-slate-200 rounded-lg bg-white text-slate-900"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'plan' | 'analyze'>('plan');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const [baseline, setBaseline] = useState('0.05');
  const [mde, setMde] = useState('0.01');
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  const [visitorsA, setVisitorsA] = useState('');
  const [conversionsA, setConversionsA] = useState('');
  const [visitorsB, setVisitorsB] = useState('');
  const [conversionsB, setConversionsB] = useState('');
  const [alpha, setAlpha] = useState('0.05');
  const [comparisons, setComparisons] = useState('1');
  const [mpe, setMpe] = useState('0.005');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const calculateSample = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/calculate-sample-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline_conversion: parseFloat(baseline),
          mde: parseFloat(mde),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Não foi possível calcular o tamanho amostral');
        return;
      }
      setSampleSize(data.n_per_group);
    } catch {
      toast.error('Erro ao conectar ao servidor');
    } finally {
      setLoadingPlan(false);
    }
  };

  const analyze = async (override?: AnalysisInput) => {
    const body =
      override ||
      ({
        visitors_a: parseInt(visitorsA, 10),
        conversions_a: parseInt(conversionsA, 10),
        visitors_b: parseInt(visitorsB, 10),
        conversions_b: parseInt(conversionsB, 10),
        alpha: parseFloat(alpha),
        n_comparisons: parseInt(comparisons, 10) || 1,
        mpe: parseFloat(mpe) || 0.005,
      } satisfies AnalysisInput);

    if (!body.visitors_a || !body.visitors_b) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoadingAnalyze(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Não foi possível analisar o experimento');
        setAnalysis(null);
        return;
      }
      setAnalysis(data);
    } catch {
      toast.error('Erro ao conectar ao servidor');
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const loadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erro ao carregar dados de demonstração');
        return;
      }
      const d = data.analyze as AnalysisInput;
      setVisitorsA(String(d.visitors_a));
      setConversionsA(String(d.conversions_a));
      setVisitorsB(String(d.visitors_b));
      setConversionsB(String(d.conversions_b));
      setAlpha(String(d.alpha));
      setComparisons(String(d.n_comparisons));
      setMpe(String(d.mpe ?? 0.005));
      setBaseline(String(data.sample_size.baseline_conversion));
      setMde(String(data.sample_size.mde));
      setActiveTab('analyze');
      await analyze(d);
    } catch {
      toast.error('Erro ao carregar dados de demonstração');
    } finally {
      setLoadingDemo(false);
    }
  };

  const copyReport = async () => {
    if (!analysis) return;
    const text = [
      'StatLab Experiments — Relatório de Análise',
      `Status: ${analysis.status}`,
      `Conversão A: ${(analysis.conversion_a * 100).toFixed(2)}%`,
      `Conversão B: ${(analysis.conversion_b * 100).toFixed(2)}%`,
      `Uplift relativo: ${(analysis.uplift * 100).toFixed(2)}%`,
      `p-valor: ${analysis.p_value.toFixed(4)}`,
      `Alpha ajustado (Bonferroni): ${analysis.alpha_ajustado.toFixed(4)}`,
      `IC: [${analysis.ci_low.toFixed(4)}, ${analysis.ci_high.toFixed(4)}]`,
      analysis.interpretation,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Relatório copiado para a área de transferência');
    } catch {
      toast.error('Não foi possível copiar o relatório');
    }
  };

  const busy = loadingPlan || loadingAnalyze || loadingDemo;
  const ciLevel = analysis
    ? `${((1 - (analysis.alpha_ajustado || 0.05)) * 100).toFixed(0)}%`
    : null;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-center" />

      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              StatLab Experiments
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs" aria-label="Stack">
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-white">Next.js</span>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-teal-600 text-white">Flask</span>
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white">SciPy</span>
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white">statsmodels</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-500" aria-label="Links externos">
            <a
              href="https://barujafe.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition"
            >
              &larr; Portfólio
            </a>
            <a
              href="https://github.com/BarujaFe1/StatLab-Experiments"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition"
            >
              GitHub &nearr;
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-20 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-slate-600">
            Planeje e interprete testes A/B com rigor estatístico — separando
            significância de relevância prática.
          </p>
          <button
            type="button"
            onClick={loadDemo}
            disabled={busy}
            className="text-sm text-teal-700 hover:text-teal-900 underline disabled:opacity-50"
          >
            {loadingDemo ? 'Carregando demonstração…' : 'Experimentar com dados de demonstração'}
          </button>
        </div>

        <div
          className="flex p-1 bg-slate-200 rounded-lg w-fit mx-auto"
          role="tablist"
          aria-label="Módulos"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'plan'}
            onClick={() => setActiveTab('plan')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === 'plan' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Planejar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              activeTab === 'analyze' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Analisar
          </button>
        </div>

        {activeTab === 'plan' ? (
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4" aria-label="Planejamento">
            <Field
              id="baseline"
              label="Taxa de conversão base"
              value={baseline}
              onChange={setBaseline}
              placeholder="ex: 0.05"
            />
            <Field
              id="mde"
              label="MDE — menor efeito detectável"
              value={mde}
              onChange={setMde}
              placeholder="ex: 0.01"
            />
            <button
              type="button"
              onClick={calculateSample}
              disabled={busy}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loadingPlan ? 'Calculando…' : 'Calcular tamanho amostral'}
            </button>
            {sampleSize !== null ? (
              <div className="pt-6 border-t mt-4" aria-live="polite">
                <p className="text-sm text-slate-500">Tamanho amostral sugerido por grupo:</p>
                <p className="text-3xl font-bold tracking-tight">{sampleSize.toLocaleString('pt-BR')}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 pt-2">
                Informe baseline e MDE para estimar o n necessário com poder 80% e alpha 0.05.
              </p>
            )}
          </section>
        ) : (
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4" aria-label="Análise">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="visitors_a" label="Visitantes A (controle)" value={visitorsA} onChange={setVisitorsA} placeholder="ex: 10000" inputMode="numeric" />
              <Field id="conversions_a" label="Conversões A" value={conversionsA} onChange={setConversionsA} placeholder="ex: 500" inputMode="numeric" />
              <Field id="visitors_b" label="Visitantes B (tratamento)" value={visitorsB} onChange={setVisitorsB} placeholder="ex: 10000" inputMode="numeric" />
              <Field id="conversions_b" label="Conversões B" value={conversionsB} onChange={setConversionsB} placeholder="ex: 580" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field id="alpha" label="Alpha" value={alpha} onChange={setAlpha} placeholder="0.05" />
              <Field id="comparisons" label="Comparações (Bonferroni)" value={comparisons} onChange={setComparisons} placeholder="1" inputMode="numeric" />
              <Field id="mpe" label="MPE (relevância prática)" value={mpe} onChange={setMpe} placeholder="0.005" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => analyze()}
                disabled={busy}
                className="flex-1 bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-60"
              >
                {loadingAnalyze ? 'Analisando…' : 'Analisar'}
              </button>
              <button
                type="button"
                onClick={loadDemo}
                disabled={busy}
                className="bg-slate-100 p-3 rounded-lg hover:bg-slate-200 text-sm font-medium disabled:opacity-60"
              >
                {loadingDemo ? 'Carregando…' : 'Carregar demonstração'}
              </button>
            </div>

            {!analysis && !loadingAnalyze && (
              <p className="text-sm text-slate-400">
                Preencha os grupos A/B ou carregue a demonstração para ver a decisão em 3 estados.
              </p>
            )}

            {loadingAnalyze && !analysis && (
              <div className="pt-6 border-t animate-pulse space-y-3" aria-busy="true" aria-label="Carregando análise">
                <div className="h-40 bg-slate-100 rounded-lg" />
                <div className="h-24 bg-slate-100 rounded-lg" />
              </div>
            )}

            {analysis && (
              <div className="space-y-6 pt-6 border-t" aria-live="polite">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { n: 'A', r: analysis.conversion_a * 100 },
                        { n: 'B', r: analysis.conversion_b * 100 },
                      ]}
                    >
                      <XAxis dataKey="n" />
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                      <Bar dataKey="r" fill="#0f172a" name="Conversão %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">
                    Decisão
                  </p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: STATUS_COLOR[analysis.status] || '#0f172a' }}
                  >
                    {analysis.status}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {analysis.interpretation}
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-800">p-valor:</span>{' '}
                      {analysis.p_value.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">Alpha ajustado:</span>{' '}
                      {analysis.alpha_ajustado.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">Uplift:</span>{' '}
                      {(analysis.uplift * 100).toFixed(2)}%
                    </div>
                    <div>
                      <span className="font-medium text-slate-800">IC{ciLevel ? ` ~${ciLevel}` : ''}:</span>{' '}
                      [{analysis.ci_low.toFixed(4)}, {analysis.ci_high.toFixed(4)}]
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyReport}
                  className="text-sm text-slate-500 underline hover:text-slate-800"
                >
                  Copiar relatório
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
