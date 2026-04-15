export type SOStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'invoiced' | 'cancelled';

export interface SOItem {
  id: string;
  itemName: string;
  quantity: number;
  deliveredQty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  date: string;
  customerName: string;
  status: SOStatus;
  items: SOItem[];
  totalAmount: number;
  deliveryDate: string;
  notes?: string;
  confirmedBy?: string;
  confirmedDate?: string;
}

export interface CustomerMetric {
  customer: string;
  totalOrders: number;
  fulfillmentRate: number;
  avgFulfillmentDays: number;
  totalRevenue: number;
}

const DEMO_SOS: SalesOrder[] = [
  {
    id: 'so-1', soNumber: 'SO-2025-001', date: '2025-04-01', customerName: 'Apex Industries',
    status: 'invoiced', deliveryDate: '2025-04-08',
    items: [
      { id: 's1', itemName: 'Widget A', quantity: 200, deliveredQty: 200, unit: 'Nos', rate: 150, amount: 30000 },
      { id: 's2', itemName: 'Widget B', quantity: 100, deliveredQty: 100, unit: 'Nos', rate: 250, amount: 25000 },
    ],
    totalAmount: 55000, confirmedBy: 'Sales Mgr', confirmedDate: '2025-04-02',
  },
  {
    id: 'so-2', soNumber: 'SO-2025-002', date: '2025-04-03', customerName: 'Metro Distributors',
    status: 'delivered', deliveryDate: '2025-04-12',
    items: [
      { id: 's3', itemName: 'Component X', quantity: 500, deliveredQty: 500, unit: 'Nos', rate: 80, amount: 40000 },
    ],
    totalAmount: 40000, confirmedBy: 'Sales Mgr', confirmedDate: '2025-04-04',
  },
  {
    id: 'so-3', soNumber: 'SO-2025-003', date: '2025-04-06', customerName: 'Sunrise Retail',
    status: 'shipped', deliveryDate: '2025-04-18',
    items: [
      { id: 's4', itemName: 'Display Unit', quantity: 50, deliveredQty: 0, unit: 'Nos', rate: 600, amount: 30000 },
      { id: 's5', itemName: 'Casing', quantity: 50, deliveredQty: 0, unit: 'Nos', rate: 400, amount: 20000 },
    ],
    totalAmount: 50000, confirmedBy: 'Sales Mgr', confirmedDate: '2025-04-07',
  },
  {
    id: 'so-4', soNumber: 'SO-2025-004', date: '2025-04-08', customerName: 'Apex Industries',
    status: 'processing', deliveryDate: '2025-04-22',
    items: [
      { id: 's6', itemName: 'Battery Pack', quantity: 100, deliveredQty: 60, unit: 'Nos', rate: 250, amount: 25000 },
      { id: 's7', itemName: 'Circuit Board', quantity: 100, deliveredQty: 0, unit: 'Nos', rate: 800, amount: 80000 },
    ],
    totalAmount: 105000, confirmedBy: 'Sales Mgr', confirmedDate: '2025-04-09',
  },
  {
    id: 'so-5', soNumber: 'SO-2025-005', date: '2025-04-10', customerName: 'Global Exports',
    status: 'confirmed', deliveryDate: '2025-04-25',
    items: [
      { id: 's8', itemName: 'Packaging Material', quantity: 1000, deliveredQty: 0, unit: 'Nos', rate: 50, amount: 50000 },
    ],
    totalAmount: 50000, confirmedBy: 'Sales Mgr', confirmedDate: '2025-04-11',
  },
  {
    id: 'so-6', soNumber: 'SO-2025-006', date: '2025-04-12', customerName: 'Metro Distributors',
    status: 'new', deliveryDate: '2025-04-28',
    items: [
      { id: 's9', itemName: 'Widget A', quantity: 300, deliveredQty: 0, unit: 'Nos', rate: 150, amount: 45000 },
      { id: 's10', itemName: 'Screws & Fasteners', quantity: 2000, deliveredQty: 0, unit: 'Nos', rate: 5, amount: 10000 },
    ],
    totalAmount: 55000,
  },
  {
    id: 'so-7', soNumber: 'SO-2025-007', date: '2025-04-14', customerName: 'Sunrise Retail',
    status: 'new', deliveryDate: '2025-05-02',
    items: [
      { id: 's11', itemName: 'Component X', quantity: 200, deliveredQty: 0, unit: 'Nos', rate: 80, amount: 16000 },
    ],
    totalAmount: 16000,
  },
];

const DEMO_CUSTOMERS: CustomerMetric[] = [
  { customer: 'Apex Industries', totalOrders: 32, fulfillmentRate: 95, avgFulfillmentDays: 6, totalRevenue: 1250000 },
  { customer: 'Metro Distributors', totalOrders: 20, fulfillmentRate: 88, avgFulfillmentDays: 9, totalRevenue: 860000 },
  { customer: 'Sunrise Retail', totalOrders: 14, fulfillmentRate: 78, avgFulfillmentDays: 11, totalRevenue: 520000 },
  { customer: 'Global Exports', totalOrders: 10, fulfillmentRate: 92, avgFulfillmentDays: 7, totalRevenue: 780000 },
];

export const getSalesOrders = (): SalesOrder[] => DEMO_SOS;
export const getCustomerMetrics = (): CustomerMetric[] => DEMO_CUSTOMERS;

export const SO_STATUS_CONFIG: Record<SOStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  invoiced: { label: 'Invoiced', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const fmtSOAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const SO_PIPELINE: SOStatus[] = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'invoiced'];
