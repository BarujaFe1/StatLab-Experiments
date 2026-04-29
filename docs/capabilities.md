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
- **Calculations performed:**
  - **Conversion Rates**: Observed performance per variant.
  - **Uplift**: Relative performance improvement.
  - **P-Value**: Calculated via `proportions_ztest` (Z-test for two independent proportions).
  - **Confidence Interval**: Estimated range for the observed difference.
- **Interpretation Logic**: Automatically flags results as "Significant" or "Inconclusive" based on a configurable Alpha.

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
- **Architecture**: Stateless (no database), decouple Frontend (Next.js) from Backend (FastAPI).
- **Communication**: Strict API contracts via Pydantic schemas.
- **Deployability**: Optimized for instant deployment on Vercel (front) and Render/Fly.io (back).
