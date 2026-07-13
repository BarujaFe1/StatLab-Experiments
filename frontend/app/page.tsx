'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Toaster, toast } from 'sonner';
import type { AnalysisInput, AnalysisResult, Scenario } from '@/lib/types';
import { SCENARIO_ORDER, STATUS_COLOR } from '@/lib/types';

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  inputMode = 'decimal',
}: {
  id: string;
  label: string;
  hint?: string;
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
      {hint ? <span className="block text-[11px] text-slate-400 leading-snug">{hint}</span> : null}
    </label>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'plan' | 'analyze'>('plan');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [planNote, setPlanNote] = useState<string | null>(null);

  // Plan State
  const [baseline, setBaseline] = useState('0.05');
  const [mde, setMde] = useState('0.01');
  const [power, setPower] = useState('0.80');
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  // Analyze State
  const [visitorsA, setVisitorsA] = useState('');
  const [conversionsA, setConversionsA] = useState('');
  const [visitorsB, setVisitorsB] = useState('');
  const [conversionsB, setConversionsB] = useState('');
  const [alpha, setAlpha] = useState('0.05');
  const [comparisons, setComparisons] = useState('1');
  const [mpe, setMpe] = useState('0.005');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((r) => r.json())
      .then((data) => setScenarios(data.scenarios || {}))
      .catch(() => undefined);
  }, []);

  const applyScenarioInputs = (d: AnalysisInput) => {
    setVisitorsA(String(d.visitors_a));
    setConversionsA(String(d.conversions_a));
    setVisitorsB(String(d.visitors_b));
    setConversionsB(String(d.conversions_b));
    setAlpha(String(d.alpha));
    setComparisons(String(d.n_comparisons));
    setMpe(String(d.mpe ?? 0.005));
  };

  const calculateSample = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/calculate-sample-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline_conversion: parseFloat(baseline),
          mde: parseFloat(mde),
          power: parseFloat(power),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Não foi possível calcular o tamanho amostral');
        return;
      }
      setSampleSize(data.n_per_group);
      setPlanNote(data.note || null);
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

  const loadScenario = async (key: string) => {
    const scenario = scenarios[key];
    if (!scenario) return;
    setActiveScenario(key);
    setActiveTab('analyze');
    setLoadingDemo(true);
    try {
      applyScenarioInputs(scenario.analyze);
      await analyze(scenario.analyze);
    } finally {
      setLoadingDemo(false);
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
      if (data.scenarios) setScenarios(data.scenarios);
      const d = data.analyze as AnalysisInput;
      applyScenarioInputs(d);
      setBaseline(String(data.sample_size.baseline_conversion));
      setMde(String(data.sample_size.mde));
      setPower(String(data.sample_size.power ?? 0.8));
      setActiveScenario('vencedor');
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
      `Diferença absoluta: ${((analysis.absolute_diff ?? analysis.conversion_b - analysis.conversion_a) * 100).toFixed(2)} pp`,
      `Uplift relativo: ${(analysis.uplift * 100).toFixed(2)}%`,
      `p-valor: ${analysis.p_value.toFixed(4)}`,
      `Alpha ajustado (Bonferroni): ${analysis.alpha_ajustado.toFixed(4)}`,
      `MPE: ${analysis.mpe ?? parseFloat(mpe)}`,
      `Significativo: ${analysis.significant ? 'sim' : 'não'}`,
      `Relevante na prática: ${analysis.practically_significant ? 'sim' : 'não'}`,
      `IC: [${analysis.ci_low.toFixed(4)}, ${analysis.ci_high.toFixed(4)}]`,
      analysis.interpretation,
      ...(analysis.next_steps || []).map((s) => `- ${s}`),
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
    ? `${((1 - (analysis.alpha || 0.05)) * 100).toFixed(0)}%`
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
            <a href="https://barujafe.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">
              &larr; Portfólio
            </a>
            <a href="https://github.com/BarujaFe1/StatLab-Experiments" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">
              GitHub &nearr;
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-20 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-slate-600">
            Laboratório de decisão responsável em testes A/B: planeje o n, analise proporções
            e separe significância estatística de relevância prática.
          </p>
          <p className="text-xs text-slate-400">
            MVP educacional/stateless — não substitui experimentação em produção.
          </p>
          <button
            type="button"
            onClick={loadDemo}
            disabled={busy}
            className="text-sm text-teal-700 hover:text-teal-900 underline disabled:opacity-50"
          >
            {loadingDemo ? 'Carregando demonstração…' : 'Começar com cenário Vencedor'}
          </button>
        </div>

        {Object.keys(scenarios).length > 0 && (
          <section aria-label="Cenários didáticos" className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 text-center">
              Cenários de decisão
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SCENARIO_ORDER.map((key) => {
                const s = scenarios[key];
                if (!s) return null;
                const active = activeScenario === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={busy}
                    onClick={() => loadScenario(key)}
                    className={`text-xs sm:text-sm px-3 py-2 rounded-full border transition disabled:opacity-50 ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            {activeScenario && scenarios[activeScenario] && (
              <p className="text-center text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                {scenarios[activeScenario].lesson}
              </p>
            )}
          </section>
        )}

        <div className="flex p-1 bg-slate-200 rounded-lg w-fit mx-auto" role="tablist" aria-label="Módulos">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'plan'}
            onClick={() => setActiveTab('plan')}
            className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'plan' ? 'bg-white shadow-sm' : ''}`}
          >
            Planejar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'analyze' ? 'bg-white shadow-sm' : ''}`}
          >
            Analisar
          </button>
        </div>

        {activeTab === 'plan' ? (
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4" aria-label="Planejamento">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 leading-relaxed">
              <strong>MDE</strong> é o menor efeito absoluto que você quer detectar.
              <strong> Poder</strong> (ex.: 0,80) é a probabilidade de detectar esse efeito se ele existir.
              Amostra pequena demais aumenta falso negativo; MDE irrealista infla o n.
            </div>
            <Field id="baseline" label="Taxa de conversão base" hint="Proporção atual esperada, ex. 0.05 = 5%." value={baseline} onChange={setBaseline} placeholder="ex: 0.05" />
            <Field id="mde" label="MDE — menor efeito detectável" hint="Diferença absoluta desejada (não percentual relativo)." value={mde} onChange={setMde} placeholder="ex: 0.01" />
            <Field id="power" label="Poder estatístico" hint="Padrão 0.80. Valores maiores pedem mais amostra." value={power} onChange={setPower} placeholder="0.80" />
            <button
              type="button"
              onClick={calculateSample}
              disabled={busy}
              className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-60"
            >
              {loadingPlan ? 'Calculando…' : 'Calcular tamanho amostral'}
            </button>
            {sampleSize !== null ? (
              <div className="pt-6 border-t mt-4 space-y-2" aria-live="polite">
                <p className="text-sm text-slate-500">Tamanho amostral sugerido por grupo:</p>
                <p className="text-3xl font-bold tracking-tight">{sampleSize.toLocaleString('pt-BR')}</p>
                {planNote && <p className="text-xs text-slate-500 leading-relaxed">{planNote}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 pt-2">
                Informe baseline, MDE e poder para estimar o n com alpha 0.05.
              </p>
            )}
          </section>
        ) : (
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4" aria-label="Análise">
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 leading-relaxed">
              <strong>MPE</strong> é o limiar de relevância prática. Um resultado pode ser significativo
              (p &lt; alpha ajustado) e ainda assim <em>Efeito Fraco</em> se |B−A| ≤ MPE.
              Bonferroni divide alpha pelo número de comparações.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="visitors_a" label="Visitantes A (controle)" value={visitorsA} onChange={setVisitorsA} placeholder="ex: 10000" inputMode="numeric" />
              <Field id="conversions_a" label="Conversões A" value={conversionsA} onChange={setConversionsA} placeholder="ex: 500" inputMode="numeric" />
              <Field id="visitors_b" label="Visitantes B (tratamento)" value={visitorsB} onChange={setVisitorsB} placeholder="ex: 10000" inputMode="numeric" />
              <Field id="conversions_b" label="Conversões B" value={conversionsB} onChange={setConversionsB} placeholder="ex: 580" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field id="alpha" label="Alpha" value={alpha} onChange={setAlpha} placeholder="0.05" />
              <Field id="comparisons" label="Comparações (Bonferroni)" value={comparisons} onChange={setComparisons} placeholder="1" inputMode="numeric" />
              <Field id="mpe" label="MPE (relevância prática)" hint="Efeito absoluto mínimo que importa para o negócio." value={mpe} onChange={setMpe} placeholder="0.005" />
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
                {loadingDemo ? 'Carregando…' : 'Demo padrão'}
              </button>
            </div>

            {!analysis && !loadingAnalyze && (
              <p className="text-sm text-slate-400">
                Escolha um cenário acima ou preencha A/B para ver a decisão em 3 estados.
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
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Decisão</p>
                  <p className="text-lg font-semibold" style={{ color: STATUS_COLOR[analysis.status] || '#0f172a' }}>
                    {analysis.status}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{analysis.interpretation}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${analysis.significant ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {analysis.significant ? 'Estatisticamente significativo' : 'Não significativo'}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${analysis.practically_significant ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                      {analysis.practically_significant ? 'Relevante na prática (MPE)' : 'Abaixo do MPE'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                    <div><span className="font-medium text-slate-800">p-valor:</span> {analysis.p_value.toFixed(4)}</div>
                    <div><span className="font-medium text-slate-800">Alpha ajustado:</span> {analysis.alpha_ajustado.toFixed(4)}</div>
                    <div><span className="font-medium text-slate-800">Δ absoluto:</span> {(((analysis.absolute_diff ?? (analysis.conversion_b - analysis.conversion_a))) * 100).toFixed(2)} pp</div>
                    <div><span className="font-medium text-slate-800">Uplift:</span> {(analysis.uplift * 100).toFixed(2)}%</div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-slate-800">IC{ciLevel ? ` ${ciLevel}` : ''}:</span>{' '}
                      [{analysis.ci_low.toFixed(4)}, {analysis.ci_high.toFixed(4)}]
                    </div>
                  </div>
                  {analysis.next_steps && analysis.next_steps.length > 0 && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Próximos passos</p>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                        {analysis.next_steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button type="button" onClick={copyReport} className="text-sm text-slate-500 underline hover:text-slate-800">
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
