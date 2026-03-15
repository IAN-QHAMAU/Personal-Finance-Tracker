import { useEffect, useMemo, useState } from "react";

const DEFAULT_INCOME = 3000;
const BUDGET_BUCKETS = {
  needs: 0.5,
  wants: 0.3,
  savings: 0.2,
};

const NEEDS_CATEGORIES = new Set([
  "groceries",
  "rent",
  "utilities",
  "transport",
  "healthcare",
  "insurance",
  "education",
]);

const WANTS_CATEGORIES = new Set([
  "entertainment",
  "shopping",
  "travel",
  "dining",
  "subscriptions",
  "lifestyle",
]);

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toAmount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line, index) => {
    const values = line.split(",");
    const row = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] || "").trim();
    });

    return {
      id: `${row.date}-${row.category}-${index}`,
      date: row.date,
      category: row.category,
      amount: toAmount(row.amount),
      type: (row.type || "expense").toLowerCase(),
      description: row.description || "",
    };
  });
}

function classifyBucket(category) {
  const normalized = String(category || "").toLowerCase();
  if (NEEDS_CATEGORIES.has(normalized)) {
    return "needs";
  }
  if (WANTS_CATEGORIES.has(normalized)) {
    return "wants";
  }
  return "wants";
}

function getBudgetStatus(transactions, monthlyIncome) {
  const spentByBucket = { needs: 0, wants: 0, savings: 0 };

  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      const bucket = classifyBucket(tx.category);
      spentByBucket[bucket] += tx.amount;
    }
  });

  const status = {};
  Object.entries(BUDGET_BUCKETS).forEach(([bucket, ratio]) => {
    const limit = monthlyIncome * ratio;
    const spent = spentByBucket[bucket] || 0;
    const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;

    let health = "good";
    if (percentUsed > 100) {
      health = "exceeded";
    } else if (percentUsed >= 80) {
      health = "warning";
    }

    status[bucket] = {
      spent,
      limit,
      percent_used: Number(percentUsed.toFixed(1)),
      status: health,
    };
  });

  return status;
}

function buildInsights({ totals, budgetStatus, topCategories }) {
  const recommendations = [];

  if (totals.income > 0 && totals.expense > totals.income * 0.9) {
    recommendations.push("Your expenses are close to your income. Reduce discretionary spending this week.");
  }

  Object.entries(budgetStatus).forEach(([bucket, details]) => {
    if (details.status === "exceeded") {
      recommendations.push(`You exceeded your ${bucket} budget. Rebalance allocations for next month.`);
    }
    if (details.status === "warning") {
      recommendations.push(`Your ${bucket} budget is above 80%. Track new purchases carefully.`);
    }
  });

  if (topCategories[0]) {
    recommendations.push(`Top spending category is ${topCategories[0].category}. Consider setting a cap.`);
  }

  if (!recommendations.length) {
    recommendations.push("Budget performance looks healthy. Keep your current spending pattern.");
  }

  return recommendations;
}

function getWeekLabel(dateString) {
  const date = new Date(dateString);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toISOString().slice(0, 10)} to ${end.toISOString().slice(0, 10)}`;
}

function SimpleBarChart({ data, labelKey, valueKey }) {
  if (!data.length) {
    return <div className="empty-state">No chart data yet.</div>;
  }

  const width = 600;
  const height = 260;
  const left = 45;
  const right = 12;
  const top = 16;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maxValue = Math.max(...data.map((d) => Number(d[valueKey] || 0)), 1);
  const slot = plotWidth / data.length;
  const barWidth = Math.max(14, slot * 0.64);

  return (
    <svg viewBox="0 0 600 260" aria-label="Bar chart">
      {data.map((d, index) => {
        const value = Number(d[valueKey] || 0);
        const barHeight = (value / maxValue) * plotHeight;
        const x = left + index * slot + (slot - barWidth) / 2;
        const y = top + (plotHeight - barHeight);

        return (
          <g key={`${d[labelKey]}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#2563eb" rx="4" />
            <text x={x + barWidth / 2} y={height - 18} textAnchor="middle" fontSize="10">
              {String(d[labelKey]).slice(0, 10)}
            </text>
          </g>
        );
      })}
      <line
        x1={left}
        x2={width - right}
        y1={top + plotHeight}
        y2={top + plotHeight}
        stroke="#94a3b8"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function App() {
  const [monthlyIncome, setMonthlyIncome] = useState(DEFAULT_INCOME);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
    type: "expense",
    description: "",
  });

  useEffect(() => {
    let active = true;

    async function loadSeedData() {
      try {
        const response = await fetch("/sample_transactions.csv");
        if (!response.ok) {
          throw new Error("Unable to fetch seed transactions");
        }
        const csv = await response.text();
        const parsed = parseCsv(csv);
        if (active) {
          setTransactions(parsed);
        }
      } catch (error) {
        if (active) {
          setToast("Could not load sample data.");
          window.setTimeout(() => setToast(""), 1800);
        }
      }
    }

    loadSeedData();

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const health = useMemo(() => {
    if (totals.income <= 0) {
      return { score: 0, label: "No data" };
    }

    const savingsRate = Math.max((totals.balance / totals.income) * 100, 0);
    const score = Math.min(100, Math.round(savingsRate + 50));

    let label = "Needs attention";
    if (score >= 80) {
      label = "Excellent";
    } else if (score >= 60) {
      label = "Healthy";
    }

    return { score, label };
  }, [totals]);

  const categorySpending = useMemo(() => {
    const grouped = {};
    transactions.forEach((tx) => {
      if (tx.type !== "expense") {
        return;
      }
      grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
    });

    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const weeklySpending = useMemo(() => {
    const grouped = {};
    transactions.forEach((tx) => {
      if (tx.type !== "expense") {
        return;
      }
      const week = getWeekLabel(tx.date);
      grouped[week] = (grouped[week] || 0) + tx.amount;
    });

    return Object.entries(grouped)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [transactions]);

  const budgetStatus = useMemo(
    () => getBudgetStatus(transactions, toAmount(monthlyIncome)),
    [transactions, monthlyIncome]
  );

  const recommendations = useMemo(
    () => buildInsights({ totals, budgetStatus, topCategories: categorySpending.slice(0, 3) }),
    [totals, budgetStatus, categorySpending]
  );

  const weeklyReport = useMemo(() => {
    if (!weeklySpending.length) {
      return {
        week_label: "N/A",
        total_income: totals.income,
        total_spending: totals.expense,
        total_savings: totals.balance,
        top_spending_category: categorySpending[0]?.category || "N/A",
      };
    }

    return {
      week_label: weeklySpending[weeklySpending.length - 1].week,
      total_income: totals.income,
      total_spending: totals.expense,
      total_savings: totals.balance,
      top_spending_category: categorySpending[0]?.category || "N/A",
    };
  }, [weeklySpending, totals, categorySpending]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddTransaction(event) {
    event.preventDefault();

    const amount = toAmount(form.amount);
    if (!form.date || !form.category || amount <= 0) {
      showToast("Enter valid transaction details");
      return;
    }

    const payload = {
      id: crypto.randomUUID(),
      date: form.date,
      amount,
      category: form.category,
      type: form.type,
      description: form.description,
    };

    setTransactions((prev) => [payload, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setForm({
      date: "",
      amount: "",
      category: "",
      type: "expense",
      description: "",
    });
    showToast("Transaction added");
  }

  function handleDeleteTransaction(transactionId) {
    setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
    showToast("Transaction deleted");
  }

    function handleClearAll() {
      setTransactions([]);
      showToast("All transactions cleared");
    }

    function handleCsvUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsed = parseCsv(e.target.result);
        if (!parsed.length) {
          showToast("No valid rows found in CSV");
          return;
        }
        setTransactions(parsed);
        showToast(`Loaded ${parsed.length} transactions`);
      };
      reader.readAsText(file);
      event.target.value = "";
    }

  return (
    <main className="container">
      <header className="header">
        <h1>Smart Adaptive Personal Finance Dashboard</h1>
        <div className="header-controls">
          <div className="income-control">
            <label htmlFor="monthlyIncome">Monthly Income</label>
            <input
              id="monthlyIncome"
              type="number"
              min="1"
              step="0.01"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>
          <label className="btn btn-secondary" title="CSV must have columns: date, category, amount, type, description">
            Upload CSV
            <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleCsvUpload} />
          </label>
          <button type="button" className="btn btn-danger" onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </header>

      <section className="cards">
        <article className="card">
          <h2>Total Income</h2>
          <p>{formatMoney(totals.income)}</p>
        </article>
        <article className="card">
          <h2>Total Expense</h2>
          <p>{formatMoney(totals.expense)}</p>
        </article>
        <article className="card">
          <h2>Balance</h2>
          <p>{formatMoney(totals.balance)}</p>
        </article>
        <article className="card">
          <h2>Health Score</h2>
          <p>
            {health.score} ({health.label})
          </p>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Budget Progress</h2>
          <div className="list">
            {Object.entries(budgetStatus).map(([bucket, details]) => (
              <div key={bucket} className="row">
                <div>
                  <strong>{bucket}</strong>
                  <br />
                  <small>
                    Spent: {formatMoney(details.spent)} / {formatMoney(details.limit)}
                  </small>
                </div>
                <div>
                  <span className={`pill status-${details.status}`}>{details.status}</span>
                  <br />
                  <small>{details.percent_used}% used</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Top Spending Categories</h2>
          <div className="list">
            {!categorySpending.length ? (
              <span>No spending category data yet.</span>
            ) : (
              categorySpending.slice(0, 5).map((item) => (
                <div key={item.category} className="row">
                  <span>{item.category}</span>
                  <strong>{formatMoney(item.amount)}</strong>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <h2>Insights</h2>
          <ul className="list">
            {recommendations.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Weekly Report</h2>
          <div className="list">
            <div className="row">
              <span>Week</span>
              <strong>{weeklyReport.week_label}</strong>
            </div>
            <div className="row">
              <span>Income</span>
              <strong>{formatMoney(weeklyReport.total_income)}</strong>
            </div>
            <div className="row">
              <span>Spent</span>
              <strong>{formatMoney(weeklyReport.total_spending)}</strong>
            </div>
            <div className="row">
              <span>Saved</span>
              <strong>{formatMoney(weeklyReport.total_savings)}</strong>
            </div>
            <div className="row">
              <span>Top Category</span>
              <strong>{weeklyReport.top_spending_category}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel wide">
          <h2>Category Distribution</h2>
          <SimpleBarChart data={categorySpending} labelKey="category" valueKey="amount" />
        </article>
        <article className="panel wide">
          <h2>Weekly Spending Trend</h2>
          <SimpleBarChart data={weeklySpending} labelKey="week" valueKey="amount" />
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Add Transaction</h2>
          <form className="form-grid" onSubmit={handleAddTransaction}>
            <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={handleFormChange}
              required
            />
            <input
              name="category"
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={handleFormChange}
              required
            />
            <select name="type" value={form.type} onChange={handleFormChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              name="description"
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
            />
            <button type="submit">Add Transaction</button>
          </form>
        </article>

        <article className="panel wide">
          <h2>Recent Transactions</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!transactions.length ? (
                  <tr>
                    <td colSpan={6}>No transactions found.</td>
                  </tr>
                ) : (
                  transactions.slice(0, 12).map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{tx.category}</td>
                      <td>{tx.type}</td>
                      <td>{formatMoney(tx.amount)}</td>
                      <td>{tx.description || "-"}</td>
                      <td>
                        <button type="button" onClick={() => handleDeleteTransaction(tx.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <div id="toast" className={toast ? "show" : ""} role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  );
}
