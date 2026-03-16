# Smart Adaptive Personal Finance Dashboard

An intelligent personal finance management system that helps users monitor, analyze, and optimize spending habits with adaptive budgeting and data-driven insights.

## Live Demo

- https://ian-qhamau.github.io/Personal-Finance-Tracker/

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

The app loads `sample_transactions.csv` from `frontend/public/` at runtime **only when there is no saved local data**. All processing runs in the browser — no backend required.

The dashboard also supports CSV upload from the UI. Uploaded records replace the current transaction set and are persisted in browser `localStorage`.

The default sample data is intentionally small and realistic so a new user immediately sees how the dashboard works:
- salary and freelance income
- essential expenses like rent, groceries, transport, and utilities
- discretionary spending like dining and entertainment
- a savings transfer entry

## Hosted App Behavior

- Users opening the deployed app do **not** need to run `npm install` or any local setup.
- Each visitor uses their own browser session; one user's changes do not affect another user.
- Uploaded/edited transactions are saved per browser using `localStorage`, so refreshing keeps your latest data.
- Clearing site storage (or using a different browser/device) restores the default `sample_transactions.csv` seed data.

## How To Use The UI

When the app opens for the first time, it shows sample transactions so the cards, charts, budget progress, and recent transactions table are not empty.

### 1. Review the sample data

On first load you should see a realistic example such as:
- income from `Salary` and `Freelance`
- expenses for `Rent`, `Groceries`, `Transport`, `Utilities`, `Dining`, and `Entertainment`

This helps you understand what each dashboard section means before adding your own records.

### 2. Clear the sample transactions

If you want to start with your own finances:

1. Click the `Clear All` button at the top of the page.
2. The recent transactions table becomes empty.
3. The cards and charts will update based on whatever you enter next.

After clearing, you can either add transactions manually or upload a CSV.

### 3. Add your own transactions manually

Use the `Add Transaction` form near the bottom of the dashboard.

Fill in these fields:
- `Date` — the transaction date
- `Amount` — the money value
- `Category` — for example `Groceries`, `Rent`, `Salary`, or `Transport`
- `Type` — choose `Expense` or `Income`
- `Description` — a short note explaining the transaction

Then click `Add Transaction`.

#### Example manual entry

If you want to record a salary payment:

- Date: `2026-03-15`
- Amount: `2800`
- Category: `Salary`
- Type: `Income`
- Description: `Main monthly salary`

If you want to record a grocery purchase:

- Date: `2026-03-16`
- Amount: `65.40`
- Category: `Groceries`
- Type: `Expense`
- Description: `Weekly food shopping`

Once added, the totals, health score, charts, insights, and transaction list update automatically.

### 4. Upload your own CSV file

If you already have transactions saved in a spreadsheet or CSV file:

1. Prepare a CSV with this exact header row:

```csv
date,category,amount,type,description
```

2. Make sure each row follows the same order.
3. Click `Upload CSV`.
4. Select your file.
5. The uploaded CSV replaces the current list of transactions.

#### Example CSV

```csv
date,category,amount,type,description
2026-03-15,Salary,2800.00,income,Main monthly salary
2026-03-16,Groceries,65.40,expense,Weekly food shopping
2026-03-16,Transport,18.00,expense,Bike taxi
2026-03-17,Rent,950.00,expense,Apartment rent
```

### 5. Understand what happens after refresh

- Your latest transactions are saved in your browser automatically.
- If you refresh the page, your saved data remains.
- If you clear browser storage or open the app in a new browser/device, the app falls back to the sample CSV again.

### 6. Typical first-time workflow

Here is the simplest way a new user can work with the app:

1. Open the dashboard and inspect the sample data.
2. Click `Clear All`.
3. Add your own income and expense entries in the form.
4. Or upload a CSV file with your real records.
5. Refresh the page to confirm your records stay saved.

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
