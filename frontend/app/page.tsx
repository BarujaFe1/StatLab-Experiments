'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, AlertCircle, CheckCircle2, Calculator, BarChart2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'plan' | 'analyze'>('plan');
  
  // Plan State
  const [baseline, setBaseline] = useState('0.05');
  const [mde, setMde] = useState('0.01');
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  // Analyze State
  const [visitorsA, setVisitorsA] = useState('');
  const [conversionsA, setConversionsA] = useState('');
  const [visitorsB, setVisitorsB] = useState('');
  const [conversionsB, setConversionsB] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const calculateSample = async () => {
    try {
        const res = await fetch('http://localhost:8000/calculate-sample-size', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseline_conversion: parseFloat(baseline), mde: parseFloat(mde) })
        });
        const data = await res.json();
        setSampleSize(data.n_per_group);
    } catch (e) {
        toast.error("Failed to connect to backend");
    }
  };

  const analyze = async () => {
    if (!visitorsA || !visitorsB) {
        toast.error("Please fill in all fields");
        return;
    }
    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitors_a: parseInt(visitorsA),
        conversions_a: parseInt(conversionsA),
        visitors_b: parseInt(visitorsB),
        conversions_b: parseInt(conversionsB),
      })
    });
    const data = await res.json();
    setAnalysis(data);
  };

  const copyReport = () => {
      const text = `StatLab Analysis: Variant B shows ${ (analysis.uplift * 100).toFixed(1) }% uplift. p-value: ${analysis.p_value.toFixed(4)}.`;
      navigator.clipboard.writeText(text);
      toast.success("Report copied to clipboard");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 md:p-24 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">StatLab Experiments</h1>
          <p className="text-slate-500 mt-2">Plan and interpret A/B tests with rigor.</p>
        </header>

        <div className="flex p-1 bg-slate-200 rounded-lg w-fit mx-auto">
            <button onClick={() => setActiveTab('plan')} className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'plan' ? 'bg-white shadow-sm' : ''}`}>Plan</button>
            <button onClick={() => setActiveTab('analyze')} className={`px-6 py-2 rounded-md font-medium transition ${activeTab === 'analyze' ? 'bg-white shadow-sm' : ''}`}>Analyze</button>
        </div>

        {activeTab === 'plan' ? (
            <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <input placeholder="Baseline (e.g. 0.05)" value={baseline} className="w-full p-3 border rounded-lg" onChange={(e) => setBaseline(e.target.value)} />
                <input placeholder="MDE (e.g. 0.01)" value={mde} className="w-full p-3 border rounded-lg" onChange={(e) => setMde(e.target.value)} />
                <button onClick={calculateSample} className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition">Calculate</button>
                {sampleSize && (
                    <div className="pt-6 border-t mt-4">
                        <p className="text-sm text-slate-500">Suggested sample size per group:</p>
                        <p className="text-3xl font-bold">{sampleSize.toLocaleString()}</p>
                    </div>
                )}
            </section>
        ) : (
            <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Visitors A" value={visitorsA} className="p-3 border rounded-lg" onChange={(e) => setVisitorsA(e.target.value)} />
                <input placeholder="Conversions A" value={conversionsA} className="p-3 border rounded-lg" onChange={(e) => setConversionsA(e.target.value)} />
                <input placeholder="Visitors B" value={visitorsB} className="p-3 border rounded-lg" onChange={(e) => setVisitorsB(e.target.value)} />
                <input placeholder="Conversions B" value={conversionsB} className="p-3 border rounded-lg" onChange={(e) => setConversionsB(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={analyze} className="flex-1 bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition">Analyze</button>
                <button onClick={() => { setVisitorsA('1000'); setConversionsA('50'); setVisitorsB('1000'); setConversionsB('65'); }} className="bg-slate-100 p-3 rounded-lg hover:bg-slate-200">Load</button>
              </div>
              {analysis && (
                <div className="space-y-6 pt-6 border-t">
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{n:'A',r:analysis.conversion_a*100}, {n:'B',r:analysis.conversion_b*100}]}>
                                <XAxis dataKey="n" /> <Bar dataKey="r" fill="#0f172a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Decision</p>
                        <p className="text-lg font-semibold text-slate-900">{analysis.status}</p>
                        <p className="text-sm text-slate-600 mt-2">{analysis.interpretation}</p>
                    </div>

                    <button onClick={copyReport} className="text-sm text-slate-500 underline">Copy report to clipboard</button>
                </div>
              )}
            </section>
        )}
      </div>
    </main>
  );
}
