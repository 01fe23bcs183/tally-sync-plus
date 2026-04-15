export interface CashFlowMonth {
  month: string;
  openingBalance: number;
  inflows: number;
  outflows: number;
  netFlow: number;
  closingBalance: number;
  isProjected: boolean;
}

export interface ReceivableProjection {
  id: string;
  party: string;
  amount: number;
  dueDate: string;
  expectedDate: string;
  avgPaymentDays: number;
  probability: number;
}

export interface PayableItem {
  id: string;
  party: string;
  amount: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  adjustments: { month: string; inflowChange: number; outflowChange: number }[];
}

const DEMO_CASHFLOW: CashFlowMonth[] = [
  { month: 'Jan 2025', openingBalance: 850000, inflows: 420000, outflows: 380000, netFlow: 40000, closingBalance: 890000, isProjected: false },
  { month: 'Feb 2025', openingBalance: 890000, inflows: 385000, outflows: 410000, netFlow: -25000, closingBalance: 865000, isProjected: false },
  { month: 'Mar 2025', openingBalance: 865000, inflows: 510000, outflows: 395000, netFlow: 115000, closingBalance: 980000, isProjected: false },
  { month: 'Apr 2025', openingBalance: 980000, inflows: 470000, outflows: 440000, netFlow: 30000, closingBalance: 1010000, isProjected: false },
  { month: 'May 2025', openingBalance: 1010000, inflows: 445000, outflows: 420000, netFlow: 25000, closingBalance: 1035000, isProjected: true },
  { month: 'Jun 2025', openingBalance: 1035000, inflows: 390000, outflows: 450000, netFlow: -60000, closingBalance: 975000, isProjected: true },
  { month: 'Jul 2025', openingBalance: 975000, inflows: 480000, outflows: 410000, netFlow: 70000, closingBalance: 1045000, isProjected: true },
];

const DEMO_RECEIVABLES: ReceivableProjection[] = [
  { id: 'r1', party: 'Apex Industries', amount: 155000, dueDate: '2025-04-25', expectedDate: '2025-04-28', avgPaymentDays: 32, probability: 95 },
  { id: 'r2', party: 'Metro Distributors', amount: 98000, dueDate: '2025-04-30', expectedDate: '2025-05-08', avgPaymentDays: 38, probability: 82 },
  { id: 'r3', party: 'Sunrise Retail', amount: 72000, dueDate: '2025-05-05', expectedDate: '2025-05-18', avgPaymentDays: 45, probability: 70 },
  { id: 'r4', party: 'Global Exports', amount: 65000, dueDate: '2025-05-10', expectedDate: '2025-05-14', avgPaymentDays: 28, probability: 90 },
  { id: 'r5', party: 'National Traders', amount: 43000, dueDate: '2025-05-15', expectedDate: '2025-05-30', avgPaymentDays: 50, probability: 60 },
];

const DEMO_PAYABLES: PayableItem[] = [
  { id: 'p1', party: 'Raj Traders', amount: 52000, dueDate: '2025-04-20', priority: 'high', category: 'Raw Materials' },
  { id: 'p2', party: 'Steel Corp', amount: 48000, dueDate: '2025-04-22', priority: 'high', category: 'Raw Materials' },
  { id: 'p3', party: 'Tech Supplies Ltd', amount: 120000, dueDate: '2025-04-28', priority: 'medium', category: 'Components' },
  { id: 'p4', party: 'Office Rent', amount: 35000, dueDate: '2025-05-01', priority: 'high', category: 'Overhead' },
  { id: 'p5', party: 'Global Parts Inc', amount: 55000, dueDate: '2025-05-05', priority: 'medium', category: 'Components' },
  { id: 'p6', party: 'Insurance Co', amount: 18000, dueDate: '2025-05-10', priority: 'low', category: 'Insurance' },
  { id: 'p7', party: 'Utility Provider', amount: 12000, dueDate: '2025-05-15', priority: 'low', category: 'Utilities' },
];

const DEMO_SCENARIOS: Scenario[] = [
  { id: 'sc-1', name: 'Delayed Receivables', description: 'Top 3 customers delay payment by 15 days', adjustments: [
    { month: 'May 2025', inflowChange: -180000, outflowChange: 0 },
    { month: 'Jun 2025', inflowChange: 180000, outflowChange: 0 },
  ]},
  { id: 'sc-2', name: 'New Equipment Purchase', description: 'Capital expenditure of ₹3L in June', adjustments: [
    { month: 'Jun 2025', inflowChange: 0, outflowChange: 300000 },
  ]},
  { id: 'sc-3', name: 'Sales Growth 20%', description: 'Optimistic: 20% increase in sales', adjustments: [
    { month: 'May 2025', inflowChange: 89000, outflowChange: 40000 },
    { month: 'Jun 2025', inflowChange: 78000, outflowChange: 35000 },
    { month: 'Jul 2025', inflowChange: 96000, outflowChange: 45000 },
  ]},
];

export const getCashFlowData = (): CashFlowMonth[] => DEMO_CASHFLOW;
export const getReceivables = (): ReceivableProjection[] => DEMO_RECEIVABLES;
export const getPayables = (): PayableItem[] => DEMO_PAYABLES;
export const getScenarios = (): Scenario[] => DEMO_SCENARIOS;

export const applyScenario = (base: CashFlowMonth[], scenario: Scenario): CashFlowMonth[] => {
  const result = base.map(m => ({ ...m }));
  scenario.adjustments.forEach(adj => {
    const idx = result.findIndex(m => m.month === adj.month);
    if (idx >= 0) {
      result[idx].inflows += adj.inflowChange;
      result[idx].outflows += adj.outflowChange;
      result[idx].netFlow = result[idx].inflows - result[idx].outflows;
    }
  });
  // Recalculate balances from first projected month
  for (let i = 1; i < result.length; i++) {
    result[i].openingBalance = result[i - 1].closingBalance;
    result[i].closingBalance = result[i].openingBalance + result[i].netFlow;
  }
  return result;
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export const fmtCFAmt = (v: number) =>
  (v < 0 ? '-' : '') + '₹' + Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
