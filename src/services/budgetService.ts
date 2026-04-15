// Budget Management Service - budget CRUD, tracking, alerts, variance analysis

export interface BudgetItem {
  id: string;
  ledgerName: string;
  group: string;
  annualBudget: number;
  monthlyBreakdown: number[];
  actualSpent: number;
  monthlyActual: number[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
  items: BudgetItem[];
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  ledgerName: string;
  level: 'warning' | 'danger' | 'exceeded';
  percent: number;
  message: string;
}

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// Generate monthly breakdown with slight variation
function spreadBudget(annual: number): number[] {
  const base = annual / 12;
  return Array.from({ length: 12 }, () => Math.round(base + (Math.random() - 0.5) * base * 0.1));
}

function spreadActual(monthly: number[], spentRatio: number): number[] {
  // Only fill up to current month (assuming ~12 months into FY for demo)
  const currentMonth = 11; // Mar index
  return monthly.map((m, i) => i <= currentMonth ? Math.round(m * spentRatio * (0.85 + Math.random() * 0.3)) : 0);
}

const DEMO_ITEMS: BudgetItem[] = [
  { id: '1', ledgerName: 'Salaries & Wages', group: 'Personnel', annualBudget: 2000000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '2', ledgerName: 'Rent Expense', group: 'Overheads', annualBudget: 600000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '3', ledgerName: 'Marketing Expense', group: 'Marketing', annualBudget: 800000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '4', ledgerName: 'Travel Expense', group: 'Operations', annualBudget: 400000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '5', ledgerName: 'Office Expenses', group: 'Overheads', annualBudget: 300000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '6', ledgerName: 'Professional Fees', group: 'Services', annualBudget: 500000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '7', ledgerName: 'IT & Software', group: 'Technology', annualBudget: 350000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '8', ledgerName: 'Insurance', group: 'Overheads', annualBudget: 200000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '9', ledgerName: 'Utilities', group: 'Overheads', annualBudget: 180000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
  { id: '10', ledgerName: 'Training & Development', group: 'Personnel', annualBudget: 250000, monthlyBreakdown: [], actualSpent: 0, monthlyActual: [] },
].map(item => {
  const monthly = spreadBudget(item.annualBudget);
  // Vary spend ratios: some over, some under
  const ratios: Record<string, number> = {
    'Salaries & Wages': 0.97, 'Rent Expense': 1.0, 'Marketing Expense': 1.15,
    'Travel Expense': 1.28, 'Office Expenses': 0.93, 'Professional Fees': 0.85,
    'IT & Software': 1.05, 'Insurance': 1.0, 'Utilities': 0.88, 'Training & Development': 0.72,
  };
  const actuals = spreadActual(monthly, ratios[item.ledgerName] ?? 1);
  return {
    ...item,
    monthlyBreakdown: monthly,
    monthlyActual: actuals,
    actualSpent: actuals.reduce((s, v) => s + v, 0),
  };
});

export function getBudgetItems(): BudgetItem[] {
  return DEMO_ITEMS;
}

export function getBudgetSummary(): BudgetSummary {
  const items = DEMO_ITEMS;
  const totalBudget = items.reduce((s, i) => s + i.annualBudget, 0);
  const totalActual = items.reduce((s, i) => s + i.actualSpent, 0);
  const variance = totalBudget - totalActual;
  const variancePercent = Math.round(((totalActual - totalBudget) / totalBudget) * 100);

  const alerts: BudgetAlert[] = items
    .map(i => {
      const pct = Math.round((i.actualSpent / i.annualBudget) * 100);
      if (pct >= 100) return { ledgerName: i.ledgerName, level: 'exceeded' as const, percent: pct, message: `${i.ledgerName} exceeded budget by ${pct - 100}%` };
      if (pct >= 90) return { ledgerName: i.ledgerName, level: 'danger' as const, percent: pct, message: `${i.ledgerName} at ${pct}% of budget` };
      if (pct >= 80) return { ledgerName: i.ledgerName, level: 'warning' as const, percent: pct, message: `${i.ledgerName} at ${pct}% of budget` };
      return null;
    })
    .filter((a): a is BudgetAlert => a !== null)
    .sort((a, b) => b.percent - a.percent);

  return { totalBudget, totalActual, variance, variancePercent, items, alerts };
}

export function getMonthlyComparison(): { month: string; budget: number; actual: number }[] {
  return MONTHS.map((month, i) => ({
    month,
    budget: DEMO_ITEMS.reduce((s, item) => s + item.monthlyBreakdown[i], 0),
    actual: DEMO_ITEMS.reduce((s, item) => s + item.monthlyActual[i], 0),
  }));
}

export function getMonths(): string[] {
  return MONTHS;
}

export function formatBudgetAmount(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}
