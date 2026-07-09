# StatLab Experiments: Functional Capabilities (V1.1)

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
  - Alpha, number of comparisons (Bonferroni), and optional minimum practical effect (MPE).
- **Calculations performed:**
  - **Conversion Rates**: Observed performance per variant.
  - **Uplift**: Relative performance improvement.
  - **P-Value**: Calculated via `proportions_ztest` (Z-test for two independent proportions).
  - **Confidence Interval**: `norm.ppf(1 - alpha/2)` around the absolute difference.
  - **Adjusted Alpha**: Bonferroni correction (`alpha / n_comparisons`).
- **Decision states**: `Vencedor`, `Inconclusivo`, or `Efeito Fraco` (statistical signal × practical relevance).

---

## 2. Interface and Experience Features

- **Unified Workflow**: Toggle-based navigation between Planning and Analysis modules.
- **Visual Clarity**: Comparative bar charts and a decision-first results card.
- **Productivity Utilities**: One-click demo data and copy-ready report text.
- **System Robustness**: Toast feedback for validation errors and connectivity failures.

---

## 3. Technical Implementation
- **Architecture**: Stateless (no database). Frontend (Next.js) proxies `/api/*` to a Flask WSGI API.
- **Deploy**: Two Vercel projects — Next frontend + Flask `api-server` — linked by `API_BACKEND_URL`.
- **Quality**: pytest suite for the API; ESLint + TypeScript checks for the frontend.
