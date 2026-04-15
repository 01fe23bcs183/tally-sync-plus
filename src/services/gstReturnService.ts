// GST Return Filing Service

export type GSTReturnType = 'GSTR1' | 'GSTR3B' | 'GSTR9';
export type FilingStatus = 'not_started' | 'draft' | 'validated' | 'filed';
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface GSTR1Section {
  code: string;
  label: string;
  invoiceCount: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  totalTax: number;
}

export interface GSTR3BSummary {
  outputTax: { igst: number; cgst: number; sgst: number; cess: number };
  itcAvailable: { igst: number; cgst: number; sgst: number; cess: number };
  exemptSupplies: number;
  nonGstSupplies: number;
  netPayable: { igst: number; cgst: number; sgst: number; cess: number };
}

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  invoiceNo: string;
  partyName: string;
  message: string;
  suggestion: string;
  field: string;
}

export interface HSNEntry {
  hsn: string;
  description: string;
  uqc: string;
  quantity: number;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  rate: number;
}

export interface FilingRecord {
  id: string;
  returnType: GSTReturnType;
  period: string;
  status: FilingStatus;
  filedDate?: string;
  arn?: string;
}

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)} K`;
  return `₹${abs.toLocaleString('en-IN')}`;
}
export { fmt as formatGSTAmount };

export function getGSTR1Sections(): GSTR1Section[] {
  return [
    { code: 'B2B', label: 'B2B Invoices', invoiceCount: 145, taxableValue: 2850000, igst: 285000, cgst: 128250, sgst: 128250, cess: 0, totalTax: 541500 },
    { code: 'B2CL', label: 'B2C Large (>₹2.5L)', invoiceCount: 12, taxableValue: 320000, igst: 57600, cgst: 0, sgst: 0, cess: 0, totalTax: 57600 },
    { code: 'B2CS', label: 'B2C Small', invoiceCount: 890, taxableValue: 1580000, igst: 0, cgst: 142200, sgst: 142200, cess: 0, totalTax: 284400 },
    { code: 'CDNR', label: 'Credit/Debit Notes (Registered)', invoiceCount: 8, taxableValue: 120000, igst: 10800, cgst: 5400, sgst: 5400, cess: 0, totalTax: 21600 },
    { code: 'CDNUR', label: 'Credit/Debit Notes (Unregistered)', invoiceCount: 3, taxableValue: 45000, igst: 0, cgst: 4050, sgst: 4050, cess: 0, totalTax: 8100 },
    { code: 'EXP', label: 'Exports', invoiceCount: 3, taxableValue: 210000, igst: 0, cgst: 0, sgst: 0, cess: 0, totalTax: 0 },
    { code: 'NIL', label: 'Nil Rated / Exempt', invoiceCount: 15, taxableValue: 95000, igst: 0, cgst: 0, sgst: 0, cess: 0, totalTax: 0 },
  ];
}

export function getGSTR3BSummary(): GSTR3BSummary {
  return {
    outputTax: { igst: 353400, cgst: 279900, sgst: 279900, cess: 0 },
    itcAvailable: { igst: 210000, cgst: 195000, sgst: 195000, cess: 0 },
    exemptSupplies: 95000,
    nonGstSupplies: 35000,
    netPayable: { igst: 143400, cgst: 84900, sgst: 84900, cess: 0 },
  };
}

export function getValidationIssues(): ValidationIssue[] {
  return [
    { id: 'v1', severity: 'error', invoiceNo: 'INV-2026-0342', partyName: 'Quick Supplies', message: 'Buyer GSTIN is missing', suggestion: 'Add GSTIN 27AAACQ1234F1ZP from master data', field: 'GSTIN' },
    { id: 'v2', severity: 'error', invoiceNo: 'INV-2026-0401', partyName: 'Metro Traders', message: 'Invalid GSTIN format (check digit mismatch)', suggestion: 'Verify GSTIN on GST portal', field: 'GSTIN' },
    { id: 'v3', severity: 'warning', invoiceNo: 'INV-2026-0388', partyName: 'Global Exports Ltd', message: 'HSN code 8471 is only 4 digits (6+ required for turnover >₹5Cr)', suggestion: 'Update to 847130 (computers)', field: 'HSN' },
    { id: 'v4', severity: 'warning', invoiceNo: 'INV-2026-0295', partyName: 'ABC Corp', message: 'Tax rate 12% applied but HSN 9954 typically attracts 18%', suggestion: 'Verify applicable rate for this HSN', field: 'TaxRate' },
    { id: 'v5', severity: 'info', invoiceNo: 'INV-2026-0410', partyName: 'State Traders', message: 'Place of supply differs from billing address state', suggestion: 'Confirm if IGST should apply instead of CGST+SGST', field: 'PlaceOfSupply' },
    { id: 'v6', severity: 'warning', invoiceNo: 'INV-2026-0415', partyName: 'Kumar & Sons', message: 'Invoice value ₹2,48,000 close to B2C Large threshold (₹2,50,000)', suggestion: 'Verify if this should be classified as B2C Large', field: 'Value' },
  ];
}

export function getHSNSummary(): HSNEntry[] {
  return [
    { hsn: '847130', description: 'Laptops & Computers', uqc: 'NOS', quantity: 120, taxableValue: 1800000, igst: 162000, cgst: 81000, sgst: 81000, rate: 18 },
    { hsn: '851762', description: 'Networking Equipment', uqc: 'NOS', quantity: 450, taxableValue: 675000, igst: 60750, cgst: 30375, sgst: 30375, rate: 18 },
    { hsn: '940360', description: 'Office Furniture', uqc: 'NOS', quantity: 85, taxableValue: 425000, igst: 0, cgst: 38250, sgst: 38250, rate: 18 },
    { hsn: '490199', description: 'Printed Books', uqc: 'NOS', quantity: 2000, taxableValue: 300000, igst: 0, cgst: 0, sgst: 0, rate: 0 },
    { hsn: '9954', description: 'Construction Services', uqc: 'NA', quantity: 5, taxableValue: 520000, igst: 93600, cgst: 0, sgst: 0, rate: 18 },
  ];
}

export function getFilingHistory(): FilingRecord[] {
  return [
    { id: 'f1', returnType: 'GSTR1', period: 'Mar 2026', status: 'filed', filedDate: '2026-04-11', arn: 'AA270426001234Z' },
    { id: 'f2', returnType: 'GSTR3B', period: 'Mar 2026', status: 'filed', filedDate: '2026-04-18', arn: 'AA270426005678Z' },
    { id: 'f3', returnType: 'GSTR1', period: 'Feb 2026', status: 'filed', filedDate: '2026-03-10', arn: 'AA270326009012Z' },
    { id: 'f4', returnType: 'GSTR3B', period: 'Feb 2026', status: 'filed', filedDate: '2026-03-19', arn: 'AA270326003456Z' },
    { id: 'f5', returnType: 'GSTR1', period: 'Apr 2026', status: 'draft', filedDate: undefined, arn: undefined },
    { id: 'f6', returnType: 'GSTR3B', period: 'Apr 2026', status: 'not_started', filedDate: undefined, arn: undefined },
  ];
}
