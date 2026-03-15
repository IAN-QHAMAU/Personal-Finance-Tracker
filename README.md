# Smart Adaptive Personal Finance Dashboard

An intelligent personal finance management system that helps users monitor, analyze, and optimize spending habits with adaptive budgeting and data-driven insights.

## Overview

This platform transforms raw transactions into:
- real-time budget feedback
- personalized recommendations
- behavioral spending clusters
- weekly summaries
- financial health scoring

Unlike fixed-limit budget apps, this system uses percentage-based budgeting and spending pattern analysis to remain useful across all income levels.

## Core Objectives

- Track income and expenses in a structured way
- Provide real-time spending feedback
- Generate adaptive budgeting recommendations
- Detect overspending risks early
- Deliver weekly insights and summaries
- Visualize financial behavior with clear charts

## Current MVP Features

- Transaction management (add, delete, list)
- Dynamic budgeting via `50/30/20` allocations
- Budget status warnings (good, warning, exceeded)
- Spending insights (top categories)
- Weekly financial summary report
- Financial health score
- Category distribution and weekly spending charts

## Project Structure

```text
smart-finance-dashboard/
├── data/
│   └── sample_transactions.csv
├── frontend/
│   ├── public/
│   │   └── sample_transactions.csv
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .gitignore
├── README.md
```

## Data

The app loads `sample_transactions.csv` from the `public/` folder at runtime. All processing runs in the browser — no backend required.

## Hosted App Behavior

- Users opening the deployed app do **not** need to run `npm install` or any local setup.
- Each visitor uses their own browser session; one user's changes do not affect another user.
- Transactions are currently kept in memory (frontend state only), so refreshing the page resets data back to `sample_transactions.csv`.

## Run Locally

### Frontend-only React dashboard (no backend required)

This mode runs entirely in the browser using local transaction data.

1. Go to frontend folder:

```bash
cd frontend
```

2. Install Node dependencies:

```bash
npm install
```

3. Start React app:

```bash
npm run dev
```

4. Open the URL shown by Vite (typically `http://127.0.0.1:5173`).

### Backend API mode (optional)

1. Create and activate a Python virtual environment
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the backend:

```bash
uvicorn backend.main:app --reload
```

4. Open docs:
- `http://127.0.0.1:8000/docs`

## Future Enhancements

- Automated expense categorization
- ML-based spending prediction improvements
- Notifications and alerts
- Bank statement import
- Mobile-first UI enhancements
- AI financial assistant
