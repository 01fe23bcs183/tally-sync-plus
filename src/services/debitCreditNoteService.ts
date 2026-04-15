// Debit/Credit Note Service

export type NoteType = 'credit' | 'debit';
export type NoteReason = 'return' | 'rate_difference' | 'damaged' | 'shortage' | 'quality' | 'other';
export type NoteStatus = 'draft' | 'review' | 'approved' | 'synced';

export interface LinkedInvoice {
  invoiceNumber: string;
  date: string;
  partyName: string;
  amount: number;
  gstRate: number;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  name: string;
  qty: number;
  rate: number;
  amount: number;
  gstRate: number;
}

export interface NoteEntry {
  itemName: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface DebitCreditNote {
  id: string;
  noteType: NoteType;
  noteNumber: string;
  date: string;
  partyName: string;
  linkedInvoice: string;
  reason: NoteReason;
  reasonText: string;
  entries: NoteEntry[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  status: NoteStatus;
}

const REASON_LABELS: Record<NoteReason, string> = {
  return: 'Goods Returned',
  rate_difference: 'Rate Difference',
  damaged: 'Damaged Goods',
  shortage: 'Short Supply',
  quality: 'Quality Issue',
  other: 'Other Adjustment',
};

export function getReasonLabel(reason: NoteReason): string {
  return REASON_LABELS[reason];
}

export function getAllReasons(): { value: NoteReason; label: string }[] {
  return Object.entries(REASON_LABELS).map(([value, label]) => ({ value: value as NoteReason, label }));
}

// Demo invoices for linking
const DEMO_INVOICES: LinkedInvoice[] = [
  { invoiceNumber: 'INV-218', date: '2026-03-15', partyName: 'Raj Traders', amount: 150000, gstRate: 18, items: [
    { name: 'Widget A', qty: 100, rate: 500, amount: 50000, gstRate: 18 },
    { name: 'Widget B', qty: 50, rate: 1200, amount: 60000, gstRate: 18 },
    { name: 'Gadget X', qty: 20, rate: 2000, amount: 40000, gstRate: 18 },
  ]},
  { invoiceNumber: 'INV-225', date: '2026-04-01', partyName: 'Kumar & Sons', amount: 175000, gstRate: 18, items: [
    { name: 'Steel Rod 12mm', qty: 200, rate: 450, amount: 90000, gstRate: 18 },
    { name: 'Steel Plate 5mm', qty: 50, rate: 1700, amount: 85000, gstRate: 18 },
  ]},
  { invoiceNumber: 'INV-201', date: '2026-02-20', partyName: 'ABC Corp', amount: 95000, gstRate: 12, items: [
    { name: 'Component P1', qty: 500, rate: 120, amount: 60000, gstRate: 12 },
    { name: 'Component P2', qty: 250, rate: 140, amount: 35000, gstRate: 12 },
  ]},
  { invoiceNumber: 'PUR-180', date: '2026-03-10', partyName: 'Steel Suppliers Ltd', amount: 320000, gstRate: 18, items: [
    { name: 'Raw Steel', qty: 1000, rate: 220, amount: 220000, gstRate: 18 },
    { name: 'Alloy Mix', qty: 200, rate: 500, amount: 100000, gstRate: 18 },
  ]},
];

// Demo existing notes
const DEMO_NOTES: DebitCreditNote[] = [
  { id: 'cn1', noteType: 'credit', noteNumber: 'CN-001', date: '2026-03-25', partyName: 'Raj Traders', linkedInvoice: 'INV-218', reason: 'return', reasonText: 'Goods Returned', entries: [{ itemName: 'Widget A', qty: 5, rate: 500, amount: 2500 }], subtotal: 2500, cgst: 225, sgst: 225, total: 2950, status: 'synced' },
  { id: 'cn2', noteType: 'credit', noteNumber: 'CN-002', date: '2026-04-02', partyName: 'ABC Corp', linkedInvoice: 'INV-201', reason: 'quality', reasonText: 'Quality Issue', entries: [{ itemName: 'Component P1', qty: 20, rate: 120, amount: 2400 }], subtotal: 2400, cgst: 144, sgst: 144, total: 2688, status: 'approved' },
  { id: 'dn1', noteType: 'debit', noteNumber: 'DN-001', date: '2026-04-05', partyName: 'Steel Suppliers Ltd', linkedInvoice: 'PUR-180', reason: 'damaged', reasonText: 'Damaged Goods', entries: [{ itemName: 'Raw Steel', qty: 50, rate: 220, amount: 11000 }], subtotal: 11000, cgst: 990, sgst: 990, total: 12980, status: 'review' },
  { id: 'dn2', noteType: 'debit', noteNumber: 'DN-002', date: '2026-04-10', partyName: 'Steel Suppliers Ltd', linkedInvoice: 'PUR-180', reason: 'rate_difference', reasonText: 'Rate Difference', entries: [{ itemName: 'Alloy Mix', qty: 200, rate: 15, amount: 3000 }], subtotal: 3000, cgst: 270, sgst: 270, total: 3540, status: 'draft' },
];

export function getInvoices(): LinkedInvoice[] {
  return DEMO_INVOICES;
}

export function getInvoiceByNumber(num: string): LinkedInvoice | undefined {
  return DEMO_INVOICES.find(i => i.invoiceNumber === num);
}

export function getNotes(): DebitCreditNote[] {
  return DEMO_NOTES;
}

export function getNotesByType(type: NoteType): DebitCreditNote[] {
  return DEMO_NOTES.filter(n => n.noteType === type);
}

export function getNotesForInvoice(invoiceNumber: string): DebitCreditNote[] {
  return DEMO_NOTES.filter(n => n.linkedInvoice === invoiceNumber);
}

export function calculateGST(subtotal: number, gstRate: number): { cgst: number; sgst: number; total: number } {
  const halfRate = gstRate / 2;
  const cgst = Math.round(subtotal * halfRate / 100);
  const sgst = Math.round(subtotal * halfRate / 100);
  return { cgst, sgst, total: subtotal + cgst + sgst };
}

export function formatNoteAmt(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const STATUS_CONFIG: Record<NoteStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  review: { label: 'In Review', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  synced: { label: 'Synced', variant: 'default' },
};
