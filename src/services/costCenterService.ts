// Cost Center Service - hierarchy, allocation, performance analytics

export interface CostCenter {
  name: string;
  parent: string;
  category: string;
  revenue: number;
  expenses: number;
  budget: number;
  budgetUsed: number;
}

export interface CostCenterCategory {
  name: string;
  centers: CostCenter[];
}

export interface CostCenterAllocation {
  centerName: string;
  amount: number;
  percentage: number;
}

export interface CenterPerformance {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
  budgetTotal: number;
  budgetUsed: number;
  budgetPercent: number;
}

// Demo data
const DEMO_CENTERS: CostCenter[] = [
  { name: 'Sales', parent: 'Departments', category: 'Departments', revenue: 1200000, expenses: 800000, budget: 1000000, budgetUsed: 800000 },
  { name: 'Marketing', parent: 'Departments', category: 'Departments', revenue: 200000, expenses: 500000, budget: 600000, budgetUsed: 500000 },
  { name: 'Operations', parent: 'Departments', category: 'Departments', revenue: 0, expenses: 600000, budget: 700000, budgetUsed: 600000 },
  { name: 'Engineering', parent: 'Departments', category: 'Departments', revenue: 0, expenses: 1050000, budget: 1200000, budgetUsed: 1050000 },
  { name: 'HR & Admin', parent: 'Departments', category: 'Departments', revenue: 0, expenses: 350000, budget: 400000, budgetUsed: 350000 },
  { name: 'Project Alpha', parent: 'Projects', category: 'Projects', revenue: 1500000, expenses: 1100000, budget: 2000000, budgetUsed: 1500000 },
  { name: 'Project Beta', parent: 'Projects', category: 'Projects', revenue: 800000, expenses: 650000, budget: 1000000, budgetUsed: 800000 },
  { name: 'Project Gamma', parent: 'Projects', category: 'Projects', revenue: 300000, expenses: 420000, budget: 500000, budgetUsed: 420000 },
  { name: 'Mumbai', parent: 'Locations', category: 'Locations', revenue: 1800000, expenses: 1200000, budget: 1500000, budgetUsed: 1200000 },
  { name: 'Delhi', parent: 'Locations', category: 'Locations', revenue: 900000, expenses: 700000, budget: 800000, budgetUsed: 700000 },
  { name: 'Bangalore', parent: 'Locations', category: 'Locations', revenue: 600000, expenses: 550000, budget: 600000, budgetUsed: 550000 },
];

const DEMO_MONTHLY_DATA = [
  { month: 'Nov', Sales: 650000, Marketing: 420000, Operations: 480000, Engineering: 850000 },
  { month: 'Dec', Sales: 700000, Marketing: 450000, Operations: 500000, Engineering: 900000 },
  { month: 'Jan', Sales: 720000, Marketing: 470000, Operations: 520000, Engineering: 950000 },
  { month: 'Feb', Sales: 750000, Marketing: 480000, Operations: 550000, Engineering: 1000000 },
  { month: 'Mar', Sales: 780000, Marketing: 490000, Operations: 580000, Engineering: 1020000 },
  { month: 'Apr', Sales: 800000, Marketing: 500000, Operations: 600000, Engineering: 1050000 },
];

export function getCostCenters(): CostCenter[] {
  return DEMO_CENTERS;
}

export function getCategorized(): CostCenterCategory[] {
  const categories: Record<string, CostCenter[]> = {};
  DEMO_CENTERS.forEach(c => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });
  return Object.entries(categories).map(([name, centers]) => ({ name, centers }));
}

export function getPerformanceData(): CenterPerformance[] {
  return DEMO_CENTERS.map(c => ({
    name: c.name,
    revenue: c.revenue,
    expenses: c.expenses,
    profit: c.revenue - c.expenses,
    budgetTotal: c.budget,
    budgetUsed: c.budgetUsed,
    budgetPercent: Math.round((c.budgetUsed / c.budget) * 100),
  }));
}

export function getMonthlyTrend() {
  return DEMO_MONTHLY_DATA;
}

export function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}
