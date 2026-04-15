export type POStatus = 'draft' | 'approved' | 'sent' | 'partial' | 'received' | 'invoiced' | 'cancelled';

export interface POItem {
  id: string;
  itemName: string;
  quantity: number;
  receivedQty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  vendorName: string;
  status: POStatus;
  items: POItem[];
  totalAmount: number;
  dueDate: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface VendorScore {
  vendor: string;
  totalOrders: number;
  onTimeDelivery: number;
  avgDeliveryDays: number;
  qualityScore: number;
}

const DEMO_POS: PurchaseOrder[] = [
  {
    id: 'po-1', poNumber: 'PO-2025-001', date: '2025-04-01', vendorName: 'Raj Traders',
    status: 'invoiced', dueDate: '2025-04-10',
    items: [
      { id: 'i1', itemName: 'Component A', quantity: 100, receivedQty: 100, unit: 'Nos', rate: 120, amount: 12000 },
      { id: 'i2', itemName: 'Component B', quantity: 50, receivedQty: 50, unit: 'Nos', rate: 300, amount: 15000 },
    ],
    totalAmount: 27000, approvedBy: 'Manager', approvedDate: '2025-04-02',
  },
  {
    id: 'po-2', poNumber: 'PO-2025-002', date: '2025-04-05', vendorName: 'Steel Corp',
    status: 'received', dueDate: '2025-04-15',
    items: [
      { id: 'i3', itemName: 'MS Plate 6mm', quantity: 20, receivedQty: 20, unit: 'Sqm', rate: 1200, amount: 24000 },
    ],
    totalAmount: 24000, approvedBy: 'Manager', approvedDate: '2025-04-06',
  },
  {
    id: 'po-3', poNumber: 'PO-2025-003', date: '2025-04-08', vendorName: 'Tech Supplies Ltd',
    status: 'partial', dueDate: '2025-04-20',
    items: [
      { id: 'i4', itemName: 'Circuit Board', quantity: 50, receivedQty: 30, unit: 'Nos', rate: 800, amount: 40000 },
      { id: 'i5', itemName: 'Display Unit', quantity: 50, receivedQty: 0, unit: 'Nos', rate: 600, amount: 30000 },
    ],
    totalAmount: 70000, approvedBy: 'Manager', approvedDate: '2025-04-09',
  },
  {
    id: 'po-4', poNumber: 'PO-2025-004', date: '2025-04-10', vendorName: 'Raj Traders',
    status: 'sent', dueDate: '2025-04-25',
    items: [
      { id: 'i6', itemName: 'Packaging Material', quantity: 500, receivedQty: 0, unit: 'Nos', rate: 50, amount: 25000 },
    ],
    totalAmount: 25000, approvedBy: 'Manager', approvedDate: '2025-04-11',
  },
  {
    id: 'po-5', poNumber: 'PO-2025-005', date: '2025-04-12', vendorName: 'Global Parts Inc',
    status: 'approved', dueDate: '2025-04-28',
    items: [
      { id: 'i7', itemName: 'Battery Pack', quantity: 200, receivedQty: 0, unit: 'Nos', rate: 250, amount: 50000 },
      { id: 'i8', itemName: 'Screws & Fasteners', quantity: 1000, receivedQty: 0, unit: 'Nos', rate: 5, amount: 5000 },
    ],
    totalAmount: 55000,
  },
  {
    id: 'po-6', poNumber: 'PO-2025-006', date: '2025-04-14', vendorName: 'Steel Corp',
    status: 'draft', dueDate: '2025-04-30',
    items: [
      { id: 'i9', itemName: 'MS Angle 50x50', quantity: 30, receivedQty: 0, unit: 'Mtrs', rate: 450, amount: 13500 },
      { id: 'i10', itemName: 'Welding Rod', quantity: 100, receivedQty: 0, unit: 'Nos', rate: 15, amount: 1500 },
    ],
    totalAmount: 15000,
  },
  {
    id: 'po-7', poNumber: 'PO-2025-007', date: '2025-04-14', vendorName: 'Tech Supplies Ltd',
    status: 'draft', dueDate: '2025-05-05',
    items: [
      { id: 'i11', itemName: 'Casing', quantity: 100, receivedQty: 0, unit: 'Nos', rate: 400, amount: 40000 },
    ],
    totalAmount: 40000,
  },
];

const DEMO_VENDORS: VendorScore[] = [
  { vendor: 'Raj Traders', totalOrders: 24, onTimeDelivery: 92, avgDeliveryDays: 7, qualityScore: 88 },
  { vendor: 'Steel Corp', totalOrders: 15, onTimeDelivery: 80, avgDeliveryDays: 10, qualityScore: 95 },
  { vendor: 'Tech Supplies Ltd', totalOrders: 18, onTimeDelivery: 72, avgDeliveryDays: 12, qualityScore: 82 },
  { vendor: 'Global Parts Inc', totalOrders: 8, onTimeDelivery: 88, avgDeliveryDays: 8, qualityScore: 90 },
];

export const getPurchaseOrders = (): PurchaseOrder[] => DEMO_POS;
export const getVendorScores = (): VendorScore[] => DEMO_VENDORS;

export const PO_STATUS_CONFIG: Record<POStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  sent: { label: 'Sent', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  received: { label: 'Received', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  invoiced: { label: 'Invoiced', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const fmtPOAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const PO_PIPELINE: POStatus[] = ['draft', 'approved', 'sent', 'partial', 'received', 'invoiced'];
