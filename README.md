# STATLAB EXPERIMENTS

Plan and interpret A/B tests with statistical rigor and visual clarity.

## Overview
StatLab Experiments is a high-fidelity analytical tool designed for Product Engineers and Data Analysts. It transforms frequentist statistical theory into a clean, actionable, and visually premium interface.

## Architecture
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI, SciPy, statsmodels (stateless).
- **Design Philosophy**: Minimalist, high-typography focus, "Apple-esque" restraint.

## Getting Started
### Backend
1. `cd backend`
2. `python -m venv venv && source venv/bin/activate` (or `.\venv\Scripts\activate`)
3. `pip install fastapi uvicorn scipy statsmodels pytest`
4. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
