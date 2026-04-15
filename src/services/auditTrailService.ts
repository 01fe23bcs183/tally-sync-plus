// Audit Trail Service

export type AuditAction = 'create' | 'edit' | 'delete' | 'print' | 'export' | 'login' | 'logout';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  module: string;
  voucherNo?: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  hash: string;
}

const DEMO: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-04-15 14:32:10', user: 'Admin', action: 'edit', module: 'Sales Voucher', voucherNo: 'S-001', description: 'Amount changed', oldValue: '₹1,75,000', newValue: '₹1,80,000', ipAddress: '192.168.1.10', hash: 'a3f2b1c4' },
  { id: 'a2', timestamp: '2026-04-15 14:28:45', user: 'Admin', action: 'create', module: 'Journal Voucher', voucherNo: 'J-005', description: 'New journal entry created — ₹50,000', ipAddress: '192.168.1.10', hash: 'b4e3c2d5' },
  { id: 'a3', timestamp: '2026-04-15 13:15:22', user: 'Clerk', action: 'delete', module: 'Purchase Voucher', voucherNo: 'P-003', description: 'Voucher deleted — ₹12,000', ipAddress: '192.168.1.15', hash: 'c5f4d3e6' },
  { id: 'a4', timestamp: '2026-04-15 12:45:00', user: 'Admin', action: 'edit', module: 'Ledger', voucherNo: undefined, description: 'Ledger "Office Rent" group changed', oldValue: 'Indirect Expenses', newValue: 'Direct Expenses', ipAddress: '192.168.1.10', hash: 'd6a5e4f7' },
  { id: 'a5', timestamp: '2026-04-15 11:30:10', user: 'Clerk', action: 'create', module: 'Sales Voucher', voucherNo: 'S-045', description: 'New sales invoice — ₹2,30,000 to XYZ Corp', ipAddress: '192.168.1.15', hash: 'e7b6f5a8' },
  { id: 'a6', timestamp: '2026-04-15 11:00:00', user: 'Admin', action: 'export', module: 'Reports', description: 'Trial Balance exported to Excel', ipAddress: '192.168.1.10', hash: 'f8c7a6b9' },
  { id: 'a7', timestamp: '2026-04-15 10:15:30', user: 'Clerk', action: 'edit', module: 'Sales Voucher', voucherNo: 'S-042', description: 'Party name corrected', oldValue: 'ABC Traders', newValue: 'ABC Trading Co', ipAddress: '192.168.1.15', hash: 'a9d8b7c0' },
  { id: 'a8', timestamp: '2026-04-15 09:30:00', user: 'Admin', action: 'login', module: 'System', description: 'User logged in', ipAddress: '192.168.1.10', hash: 'b0e9c8d1' },
  { id: 'a9', timestamp: '2026-04-14 17:45:00', user: 'Clerk', action: 'logout', module: 'System', description: 'User logged out', ipAddress: '192.168.1.15', hash: 'c1f0d9e2' },
  { id: 'a10', timestamp: '2026-04-14 16:20:15', user: 'Admin', action: 'edit', module: 'Purchase Voucher', voucherNo: 'P-028', description: 'Tax rate corrected', oldValue: '12%', newValue: '18%', ipAddress: '192.168.1.10', hash: 'd2a1e0f3' },
  { id: 'a11', timestamp: '2026-04-14 15:10:00', user: 'Clerk', action: 'create', module: 'Receipt Voucher', voucherNo: 'R-015', description: 'Receipt from Kumar & Sons — ₹45,000', ipAddress: '192.168.1.15', hash: 'e3b2f1a4' },
  { id: 'a12', timestamp: '2026-04-14 14:00:00', user: 'Admin', action: 'print', module: 'Sales Voucher', voucherNo: 'S-040', description: 'Invoice printed — 2 copies', ipAddress: '192.168.1.10', hash: 'f4c3a2b5' },
  { id: 'a13', timestamp: '2026-04-14 11:30:00', user: 'Clerk', action: 'delete', module: 'Journal Voucher', voucherNo: 'J-003', description: 'Duplicate entry removed — ₹8,500', ipAddress: '192.168.1.15', hash: 'a5d4b3c6' },
  { id: 'a14', timestamp: '2026-04-14 09:00:00', user: 'Admin', action: 'login', module: 'System', description: 'User logged in', ipAddress: '192.168.1.10', hash: 'b6e5c4d7' },
];

export function getAuditEntries(): AuditEntry[] { return DEMO; }

export function getAuditSummary() {
  return {
    total: DEMO.length,
    creates: DEMO.filter(e => e.action === 'create').length,
    edits: DEMO.filter(e => e.action === 'edit').length,
    deletes: DEMO.filter(e => e.action === 'delete').length,
    users: [...new Set(DEMO.map(e => e.user))],
    integrityOk: true,
  };
}

export const ACTION_CONFIG: Record<AuditAction, { label: string; emoji: string }> = {
  create: { label: 'Created', emoji: '➕' },
  edit: { label: 'Edited', emoji: '✏️' },
  delete: { label: 'Deleted', emoji: '🗑️' },
  print: { label: 'Printed', emoji: '🖨️' },
  export: { label: 'Exported', emoji: '📤' },
  login: { label: 'Login', emoji: '🔑' },
  logout: { label: 'Logout', emoji: '🚪' },
};
