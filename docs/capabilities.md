# StatLab Experiments: Functional Capabilities (V1)

StatLab Experiments is a high-precision, stateless analytical tool designed to bridge the gap between frequentist statistics and actionable product insights.

---

## 1. Core Analytical Capabilities

### A. Experiment Planning (Sample Size)
The "Plan" module calculates the required sample size to ensure statistical power and sensitivity for an A/B test.
- **Input Parameters:**
  - `Baseline Conversion Rate`: The expected current conversion rate.
  - `Minimum Detectable Effect (MDE)`: The smallest uplift you want to detect.
  - `Alpha` (Confidence Level): Default 0.05.
  - `Power`: Default 0.80.
- **Methodology**: Uses Cohen's *h* effect size for proportions and `NormalIndPower` from `statsmodels` to solve for the required sample size per group.

### B. Test Analysis (Frequentist Inference)
The "Analyze" module evaluates the outcomes of a completed A/B test.
- **Input Parameters:**
  - Visitors and Conversions for both Variant A and Variant B.
  - Alpha, number of comparisons (Bonferroni) and MPE (practical significance threshold).
- **Calculations performed:**
  - **Conversion Rates**: Observed performance per variant.
  - **Uplift**: Relative improvement (`null` — undefined — when baseline A is zero).
  - **P-Value**: Calculated via `proportions_ztest` (Z-test for two independent proportions); `null` with `test_defined=false` for degenerate counts (0% vs 0%, 100% vs 100%).
  - **Confidence Interval**: Newcombe (hybrid Wilson) interval for `pB − pA`, at the Bonferroni-adjusted level (`ci_level`).
- **Interpretation Logic**: Four decision states — **Melhora / Regressão / Efeito Fraco / Inconclusivo** — combining adjusted-alpha significance with the signed direction of the effect vs MPE.

---

## 2. Interface and Experience Features

- **Unified Workflow**: Toggle-based navigation between Planning and Analysis modules, maintaining state and context.
- **Visual Clarity**:
  - Comparative bar charts for conversion rate visualization.
  - Responsive design with a minimal, professional aesthetic.
- **Productivity Utilities**:
  - **Demo Data**: One-click "Load Example" functionality for rapid testing.
  - **Report Export**: "Copy report to clipboard" feature for quick sharing of analysis summaries with stakeholders.
- **System Robustness**:
  - Real-time UI feedback via toast notifications for input validation and backend connectivity.
  - Clear error states and user-friendly messaging for ambiguous or underpowered results.

---

## 3. Technical Implementation
- **Architecture**: Stateless (no database), decouple Frontend (Next.js) from Backend (Flask WSGI on Vercel).
- **Communication**: Strict JSON API contracts (see `docs/api-contract.md`); non-object bodies and invalid counts return structured 400s.
- **Deployability**: Dual Vercel projects (Next.js front + Flask API), demo at https://statlab-ab.vercel.app.
