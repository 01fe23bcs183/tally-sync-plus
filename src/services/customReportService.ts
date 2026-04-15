export type FieldSource = 'voucher' | 'ledger' | 'stock' | 'computed';
export type AggregationType = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'none';

export interface ReportField {
  id: string;
  name: string;
  label: string;
  source: FieldSource;
  type: 'text' | 'number' | 'date' | 'currency';
  aggregation?: AggregationType;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  columns: ReportField[];
  filters: Record<string, string>;
  groupBy?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  createdAt: string;
  scheduled?: 'daily' | 'weekly' | 'monthly';
}

export interface ReportRow {
  [key: string]: string | number;
}

export const AVAILABLE_FIELDS: ReportField[] = [
  { id: 'f-date', name: 'date', label: 'Voucher Date', source: 'voucher', type: 'date' },
  { id: 'f-vtype', name: 'voucherType', label: 'Voucher Type', source: 'voucher', type: 'text' },
  { id: 'f-vnum', name: 'voucherNo', label: 'Voucher No', source: 'voucher', type: 'text' },
  { id: 'f-party', name: 'partyName', label: 'Party Name', source: 'ledger', type: 'text' },
  { id: 'f-group', name: 'ledgerGroup', label: 'Ledger Group', source: 'ledger', type: 'text' },
  { id: 'f-amount', name: 'amount', label: 'Amount', source: 'voucher', type: 'currency', aggregation: 'sum' },
  { id: 'f-debit', name: 'debit', label: 'Debit', source: 'voucher', type: 'currency', aggregation: 'sum' },
  { id: 'f-credit', name: 'credit', label: 'Credit', source: 'voucher', type: 'currency', aggregation: 'sum' },
  { id: 'f-item', name: 'stockItem', label: 'Stock Item', source: 'stock', type: 'text' },
  { id: 'f-qty', name: 'quantity', label: 'Quantity', source: 'stock', type: 'number', aggregation: 'sum' },
  { id: 'f-rate', name: 'rate', label: 'Rate', source: 'stock', type: 'currency' },
  { id: 'f-gst', name: 'gstRate', label: 'GST Rate %', source: 'voucher', type: 'number' },
  { id: 'f-balance', name: 'closingBalance', label: 'Closing Balance', source: 'ledger', type: 'currency', aggregation: 'sum' },
  { id: 'f-narration', name: 'narration', label: 'Narration', source: 'voucher', type: 'text' },
];

const DEMO_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl-1', name: 'Monthly Sales Summary', description: 'Party-wise sales with GST breakdown',
    columns: [
      AVAILABLE_FIELDS[3], AVAILABLE_FIELDS[5], AVAILABLE_FIELDS[11], AVAILABLE_FIELDS[0],
    ],
    filters: { voucherType: 'Sales', dateRange: 'Apr 2025' },
    groupBy: 'partyName', sortBy: 'amount', sortDir: 'desc',
    createdAt: '2025-04-01',
  },
  {
    id: 'tpl-2', name: 'Purchase Register', description: 'Detailed purchase with item-wise breakup',
    columns: [
      AVAILABLE_FIELDS[0], AVAILABLE_FIELDS[2], AVAILABLE_FIELDS[3], AVAILABLE_FIELDS[8], AVAILABLE_FIELDS[9], AVAILABLE_FIELDS[5],
    ],
    filters: { voucherType: 'Purchase', dateRange: 'Apr 2025' },
    sortBy: 'date', sortDir: 'asc',
    createdAt: '2025-04-02', scheduled: 'monthly',
  },
  {
    id: 'tpl-3', name: 'Outstanding Debtors', description: 'Party-wise outstanding amounts',
    columns: [
      AVAILABLE_FIELDS[3], AVAILABLE_FIELDS[4], AVAILABLE_FIELDS[12],
    ],
    filters: { ledgerGroup: 'Sundry Debtors' },
    sortBy: 'closingBalance', sortDir: 'desc',
    createdAt: '2025-04-05', scheduled: 'weekly',
  },
];

const DEMO_DATA: Record<string, ReportRow[]> = {
  'tpl-1': [
    { partyName: 'Apex Industries', amount: 155000, gstRate: 18, date: '2025-04-15' },
    { partyName: 'Metro Distributors', amount: 98000, gstRate: 18, date: '2025-04-12' },
    { partyName: 'Sunrise Retail', amount: 72000, gstRate: 12, date: '2025-04-10' },
    { partyName: 'Global Exports', amount: 65000, gstRate: 0, date: '2025-04-08' },
    { partyName: 'National Traders', amount: 43000, gstRate: 18, date: '2025-04-05' },
  ],
  'tpl-2': [
    { date: '2025-04-01', voucherNo: 'PUR-101', partyName: 'Raj Traders', stockItem: 'Component A', quantity: 100, amount: 12000 },
    { date: '2025-04-03', voucherNo: 'PUR-102', partyName: 'Steel Corp', stockItem: 'MS Plate 6mm', quantity: 20, amount: 24000 },
    { date: '2025-04-05', voucherNo: 'PUR-103', partyName: 'Tech Supplies', stockItem: 'Circuit Board', quantity: 50, amount: 40000 },
    { date: '2025-04-08', voucherNo: 'PUR-104', partyName: 'Global Parts', stockItem: 'Battery Pack', quantity: 200, amount: 50000 },
    { date: '2025-04-10', voucherNo: 'PUR-105', partyName: 'Raj Traders', stockItem: 'Packaging', quantity: 500, amount: 25000 },
  ],
  'tpl-3': [
    { partyName: 'Apex Industries', ledgerGroup: 'Sundry Debtors', closingBalance: 285000 },
    { partyName: 'Metro Distributors', ledgerGroup: 'Sundry Debtors', closingBalance: 142000 },
    { partyName: 'Sunrise Retail', ledgerGroup: 'Sundry Debtors', closingBalance: 98000 },
    { partyName: 'National Traders', ledgerGroup: 'Sundry Debtors', closingBalance: 56000 },
    { partyName: 'Global Exports', ledgerGroup: 'Sundry Debtors', closingBalance: 35000 },
  ],
};

export const getReportTemplates = (): ReportTemplate[] => DEMO_TEMPLATES;
export const getReportData = (templateId: string): ReportRow[] => DEMO_DATA[templateId] || [];
export const getAvailableFields = (): ReportField[] => AVAILABLE_FIELDS;

export const SOURCE_CONFIG: Record<FieldSource, { label: string; color: string }> = {
  voucher: { label: 'Voucher', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ledger: { label: 'Ledger', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  stock: { label: 'Stock', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  computed: { label: 'Computed', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

export const fmtReportAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
