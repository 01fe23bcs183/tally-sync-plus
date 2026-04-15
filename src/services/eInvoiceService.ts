// E-Invoice Service

export type IRNStatus = 'pending' | 'generated' | 'cancelled' | 'error';

export interface EInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  partyName: string;
  gstin: string;
  amount: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  irnStatus: IRNStatus;
  irn?: string;
  ackNo?: string;
  ackDate?: string;
  cancelReason?: string;
  errorMessage?: string;
  qrData?: string;
}

const DEMO: EInvoice[] = [
  { id: 'e1', invoiceNo: 'INV-2026-0225', invoiceDate: '2026-04-02', partyName: 'Raj Traders', gstin: '27AAACR5678F1ZQ', amount: 206500, taxableValue: 175000, igst: 0, cgst: 15750, sgst: 15750, irnStatus: 'generated', irn: '7b3df8a1c2e4f6a8b0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6', ackNo: 'ACK-112026040200225', ackDate: '2026-04-02', qrData: 'eyJpcm4iOiI3YjNkZjhhMWMyZTRmNmE4YjBkMmU0ZjZhOGIwYzJkNGU2ZjhhMGIyYzRkNmU4ZjBhMmI0YzZkOGUwZjJhNGI2In0=' },
  { id: 'e2', invoiceNo: 'INV-2026-0226', invoiceDate: '2026-04-03', partyName: 'XYZ Corp', gstin: '29AABCX1234K1ZP', amount: 271400, taxableValue: 230000, igst: 41400, cgst: 0, sgst: 0, irnStatus: 'generated', irn: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', ackNo: 'ACK-112026040300226', ackDate: '2026-04-03', qrData: 'eyJpcm4iOiJhMWIyYzNkNGU1ZjZhN2I4YzlkMGUxZjJhM2I0YzVkNmU3ZjhhOWIwYzFkMmUzZjRhNWI2YzdkOGU5ZjBhMWIyIn0=' },
  { id: 'e3', invoiceNo: 'INV-2026-0227', invoiceDate: '2026-04-05', partyName: 'ABC Ltd', gstin: '', amount: 53100, taxableValue: 45000, igst: 0, cgst: 4050, sgst: 4050, irnStatus: 'error', errorMessage: 'Buyer GSTIN is missing — required for B2B e-invoice' },
  { id: 'e4', invoiceNo: 'INV-2026-0228', invoiceDate: '2026-04-06', partyName: 'Metro Distributors', gstin: '27AABCM9012N1ZR', amount: 354000, taxableValue: 300000, igst: 0, cgst: 27000, sgst: 27000, irnStatus: 'pending' },
  { id: 'e5', invoiceNo: 'INV-2026-0229', invoiceDate: '2026-04-07', partyName: 'Steel Industries', gstin: '33AABCS3456P1ZS', amount: 590000, taxableValue: 500000, igst: 90000, cgst: 0, sgst: 0, irnStatus: 'pending' },
  { id: 'e6', invoiceNo: 'INV-2026-0230', invoiceDate: '2026-04-08', partyName: 'Global Exports', gstin: '27AABCG7890Q1ZT', amount: 472000, taxableValue: 400000, igst: 72000, cgst: 0, sgst: 0, irnStatus: 'pending' },
  { id: 'e7', invoiceNo: 'INV-2026-0231', invoiceDate: '2026-04-09', partyName: 'Kumar Electronics', gstin: '27AABCK1234R1ZU', amount: 118000, taxableValue: 100000, igst: 0, cgst: 9000, sgst: 9000, irnStatus: 'generated', irn: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', ackNo: 'ACK-112026040900231', ackDate: '2026-04-09', qrData: 'eyJpcm4iOiJjM2Q0ZTVmNmE3YjhjOWQwZTFmMmEzYjRjNWQ2ZTdmOGE5YjBjMWQyZTNmNGE1YjZjN2Q4ZTlmMGExYjJjM2Q0In0=' },
  { id: 'e8', invoiceNo: 'INV-2026-0220', invoiceDate: '2026-03-28', partyName: 'Sunrise Traders', gstin: '27AABCS5678S1ZV', amount: 165200, taxableValue: 140000, igst: 0, cgst: 12600, sgst: 12600, irnStatus: 'cancelled', irn: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', cancelReason: 'Duplicate invoice — original INV-2026-0218' },
];

export function getEInvoices(): EInvoice[] { return DEMO; }

export function getEInvoiceSummary() {
  const all = DEMO;
  return {
    total: all.length,
    generated: all.filter(e => e.irnStatus === 'generated').length,
    pending: all.filter(e => e.irnStatus === 'pending').length,
    error: all.filter(e => e.irnStatus === 'error').length,
    cancelled: all.filter(e => e.irnStatus === 'cancelled').length,
    pendingValue: all.filter(e => e.irnStatus === 'pending').reduce((s, e) => s + e.amount, 0),
  };
}

export function formatEInvAmount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${n.toLocaleString('en-IN')}`;
}
