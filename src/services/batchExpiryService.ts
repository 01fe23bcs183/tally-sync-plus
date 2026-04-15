// Batch & Expiry Tracking Service

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'safe';

export interface BatchItem {
  id: string;
  stockItem: string;
  category: string;
  batchNo: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  purchaseRate: number;
  sellingRate: number;
  daysToExpiry: number;
  status: ExpiryStatus;
  godown: string;
}

const TODAY = new Date('2026-04-15');
function daysTo(d: string): number { return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / 86400000); }
function getStatus(days: number): ExpiryStatus {
  if (days <= 0) return 'expired';
  if (days <= 15) return 'critical';
  if (days <= 60) return 'warning';
  return 'safe';
}

const RAW: Omit<BatchItem, 'daysToExpiry' | 'status'>[] = [
  { id: 'bt1', stockItem: 'Paracetamol 500mg', category: 'Pharma', batchNo: 'B-101', mfgDate: '2025-04-20', expiryDate: '2026-04-20', quantity: 500, unit: 'TAB', purchaseRate: 1.2, sellingRate: 2.5, godown: 'Main Store' },
  { id: 'bt2', stockItem: 'Paracetamol 500mg', category: 'Pharma', batchNo: 'B-145', mfgDate: '2025-10-15', expiryDate: '2026-10-15', quantity: 1200, unit: 'TAB', purchaseRate: 1.3, sellingRate: 2.5, godown: 'Main Store' },
  { id: 'bt3', stockItem: 'Amoxicillin 250mg', category: 'Pharma', batchNo: 'B-205', mfgDate: '2025-05-10', expiryDate: '2026-05-10', quantity: 200, unit: 'CAP', purchaseRate: 3.5, sellingRate: 7.0, godown: 'Cold Storage' },
  { id: 'bt4', stockItem: 'Vitamin-C 1000mg', category: 'Pharma', batchNo: 'B-089', mfgDate: '2025-06-15', expiryDate: '2026-06-15', quantity: 1000, unit: 'TAB', purchaseRate: 2.0, sellingRate: 4.5, godown: 'Main Store' },
  { id: 'bt5', stockItem: 'Cough Syrup 100ml', category: 'Pharma', batchNo: 'B-312', mfgDate: '2024-10-01', expiryDate: '2026-04-01', quantity: 80, unit: 'BTL', purchaseRate: 25, sellingRate: 55, godown: 'Main Store' },
  { id: 'bt6', stockItem: 'Cough Syrup 100ml', category: 'Pharma', batchNo: 'B-415', mfgDate: '2025-08-01', expiryDate: '2027-02-01', quantity: 300, unit: 'BTL', purchaseRate: 28, sellingRate: 55, godown: 'Main Store' },
  { id: 'bt7', stockItem: 'Hand Sanitizer 500ml', category: 'FMCG', batchNo: 'HS-044', mfgDate: '2025-01-10', expiryDate: '2026-04-10', quantity: 150, unit: 'BTL', purchaseRate: 45, sellingRate: 99, godown: 'Warehouse-2' },
  { id: 'bt8', stockItem: 'Face Cream 50g', category: 'FMCG', batchNo: 'FC-078', mfgDate: '2025-07-20', expiryDate: '2026-07-20', quantity: 400, unit: 'TUB', purchaseRate: 60, sellingRate: 150, godown: 'Warehouse-2' },
  { id: 'bt9', stockItem: 'Protein Powder 1kg', category: 'Food', batchNo: 'PP-220', mfgDate: '2025-09-01', expiryDate: '2026-09-01', quantity: 50, unit: 'PKT', purchaseRate: 350, sellingRate: 699, godown: 'Main Store' },
  { id: 'bt10', stockItem: 'Olive Oil 1L', category: 'Food', batchNo: 'OL-155', mfgDate: '2025-04-15', expiryDate: '2026-04-15', quantity: 25, unit: 'BTL', purchaseRate: 280, sellingRate: 450, godown: 'Main Store' },
  { id: 'bt11', stockItem: 'Insulin Vial', category: 'Pharma', batchNo: 'IN-033', mfgDate: '2025-11-01', expiryDate: '2026-05-01', quantity: 40, unit: 'VL', purchaseRate: 150, sellingRate: 320, godown: 'Cold Storage' },
  { id: 'bt12', stockItem: 'Disinfectant 5L', category: 'FMCG', batchNo: 'DS-091', mfgDate: '2025-03-01', expiryDate: '2026-09-01', quantity: 60, unit: 'CAN', purchaseRate: 180, sellingRate: 350, godown: 'Warehouse-2' },
];

const DEMO: BatchItem[] = RAW.map(r => {
  const days = daysTo(r.expiryDate);
  return { ...r, daysToExpiry: days, status: getStatus(days) };
});

export function getBatchItems(): BatchItem[] { return DEMO; }

export function getBatchSummary() {
  return {
    total: DEMO.length,
    expired: DEMO.filter(b => b.status === 'expired').length,
    critical: DEMO.filter(b => b.status === 'critical').length,
    warning: DEMO.filter(b => b.status === 'warning').length,
    safe: DEMO.filter(b => b.status === 'safe').length,
    expiredValue: DEMO.filter(b => b.status === 'expired').reduce((s, b) => s + b.quantity * b.purchaseRate, 0),
  };
}

export const STATUS_CFG: Record<ExpiryStatus, { label: string; color: string; dot: string }> = {
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: '🔴' },
  critical: { label: '≤15 days', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: '🟠' },
  warning: { label: '≤60 days', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: '🟡' },
  safe: { label: 'Safe', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: '🟢' },
};
