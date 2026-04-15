// Bulk import service: file parsing, column mapping, validation, batch import

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { fuzzyMatch } from './voucherPatternService';
import { importVoucher } from './tallyXmlService';
import { VoucherType, VoucherEntry } from '@/types/tally';

// ─── File Parsing ───

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
}

export const parseFile = (file: File): Promise<ParsedFile> => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'txt') return parseCsv(file);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file);
  return Promise.reject(new Error('Unsupported file format. Use CSV or Excel.'));
};

const parseCsv = (file: File): Promise<ParsedFile> =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data.length) return reject(new Error('Empty CSV file'));
        resolve({
          headers: result.meta.fields || [],
          rows: result.data as Record<string, string>[],
          fileName: file.name,
        });
      },
      error: (err) => reject(err),
    });
  });

const parseExcel = (file: File): Promise<ParsedFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        if (!data.length) return reject(new Error('Empty Excel file'));
        const headers = Object.keys(data[0]);
        resolve({ headers, rows: data.map(r => {
          const row: Record<string, string> = {};
          for (const k of headers) row[k] = String(r[k] ?? '');
          return row;
        }), fileName: file.name });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });

// ─── Column Mapping ───

export type TallyField = 'date' | 'voucherType' | 'partyName' | 'debitAmount' | 'creditAmount' | 'amount' | 'narration' | 'ledgerName' | 'ignore';

export const TALLY_FIELDS: { value: TallyField; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'voucherType', label: 'Voucher Type' },
  { value: 'partyName', label: 'Party / Ledger Name' },
  { value: 'debitAmount', label: 'Debit Amount' },
  { value: 'creditAmount', label: 'Credit Amount' },
  { value: 'amount', label: 'Amount (single column)' },
  { value: 'narration', label: 'Narration' },
  { value: 'ledgerName', label: 'Counter Ledger' },
  { value: 'ignore', label: '— Ignore —' },
];

const FIELD_KEYWORDS: Record<TallyField, string[]> = {
  date: ['date', 'dt', 'txn date', 'transaction date', 'value date', 'posting date'],
  voucherType: ['type', 'voucher type', 'vch type', 'transaction type'],
  partyName: ['party', 'party name', 'customer', 'vendor', 'name', 'payee', 'beneficiary'],
  debitAmount: ['debit', 'dr', 'debit amount', 'withdrawal', 'dr amount'],
  creditAmount: ['credit', 'cr', 'credit amount', 'deposit', 'cr amount'],
  amount: ['amount', 'total', 'value', 'amt'],
  narration: ['narration', 'description', 'particulars', 'remarks', 'memo', 'reference', 'details'],
  ledgerName: ['ledger', 'account', 'head', 'gl account', 'counter ledger'],
  ignore: [],
};

export const autoMapColumns = (headers: string[]): Record<string, TallyField> => {
  const mapping: Record<string, TallyField> = {};
  const used = new Set<TallyField>();

  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    let bestField: TallyField = 'ignore';
    let bestScore = 0;

    for (const [field, keywords] of Object.entries(FIELD_KEYWORDS) as [TallyField, string[]][]) {
      if (field === 'ignore' || used.has(field)) continue;
      for (const kw of keywords) {
        if (lower === kw) { bestField = field; bestScore = 100; break; }
        if (lower.includes(kw) && kw.length > bestScore) { bestField = field; bestScore = kw.length; }
      }
      if (bestScore === 100) break;
    }

    mapping[header] = bestField;
    if (bestField !== 'ignore') used.add(bestField);
  }

  return mapping;
};

// ─── Row Validation ───

export interface ImportRow {
  index: number;
  raw: Record<string, string>;
  date: string;
  voucherType: VoucherType;
  partyName: string;
  amount: number;
  isDebit: boolean;
  narration: string;
  counterLedger: string;
  matchedLedger: string | null;
  errors: string[];
  warnings: string[];
}

const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  // Try common formats
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  // DD-MM-YYYY or DD/MM/YYYY
  const match = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (match) {
    const [, day, month, year] = match;
    const y = year.length === 2 ? '20' + year : year;
    const d2 = new Date(`${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
  }

  return null;
};

const parseAmount = (amtStr: string): number => {
  if (!amtStr) return 0;
  const cleaned = amtStr.replace(/[₹,$\s,]/g, '').replace(/\(([^)]+)\)/, '-$1');
  return parseFloat(cleaned) || 0;
};

const guessVoucherType = (isDebit: boolean, partyName: string, narration: string): VoucherType => {
  const lower = (partyName + ' ' + narration).toLowerCase();
  if (lower.includes('salary') || lower.includes('rent') || lower.includes('expense')) return 'Payment';
  if (lower.includes('sale') || lower.includes('invoice')) return isDebit ? 'Receipt' : 'Sales';
  if (lower.includes('purchase')) return isDebit ? 'Purchase' : 'Payment';
  return isDebit ? 'Receipt' : 'Payment';
};

export const processRows = (
  rows: Record<string, string>[],
  mapping: Record<string, TallyField>,
  ledgerNames: string[]
): ImportRow[] => {
  const getField = (row: Record<string, string>, field: TallyField): string => {
    for (const [col, mapped] of Object.entries(mapping)) {
      if (mapped === field) return row[col] || '';
    }
    return '';
  };

  return rows.map((raw, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Date
    const dateStr = getField(raw, 'date');
    const date = parseDate(dateStr);
    if (!date) errors.push('Invalid date');

    // Amount
    const debitStr = getField(raw, 'debitAmount');
    const creditStr = getField(raw, 'creditAmount');
    const amountStr = getField(raw, 'amount');
    let amount = 0;
    let isDebit = true;

    if (debitStr || creditStr) {
      const dr = parseAmount(debitStr);
      const cr = parseAmount(creditStr);
      if (dr > 0) { amount = dr; isDebit = true; }
      else if (cr > 0) { amount = cr; isDebit = false; }
    } else if (amountStr) {
      amount = parseAmount(amountStr);
      isDebit = amount >= 0;
      amount = Math.abs(amount);
    }

    if (amount === 0) errors.push('Missing/zero amount');

    // Party
    const partyName = getField(raw, 'partyName').trim();
    if (!partyName) warnings.push('No party name');

    // Ledger matching
    const matchResults = partyName ? fuzzyMatch(partyName, ledgerNames) : [];
    const matchedLedger = matchResults.length > 0 && matchResults[0].toLowerCase() === partyName.toLowerCase()
      ? matchResults[0]
      : matchResults.length > 0 ? matchResults[0] : null;

    if (partyName && !matchedLedger) warnings.push('Ledger not found — will create new');

    // Narration
    const narration = getField(raw, 'narration').trim();

    // Counter ledger
    const counterLedger = getField(raw, 'ledgerName').trim();

    // Voucher type
    const typeStr = getField(raw, 'voucherType').trim();
    const voucherType: VoucherType = (['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra'].includes(typeStr)
      ? typeStr as VoucherType
      : guessVoucherType(isDebit, partyName, narration));

    return {
      index,
      raw,
      date: date || '',
      voucherType,
      partyName,
      amount,
      isDebit,
      narration,
      counterLedger,
      matchedLedger,
      errors,
      warnings,
    };
  });
};

// ─── Batch Import ───

export interface ImportProgress {
  total: number;
  completed: number;
  success: number;
  failed: number;
  errors: { index: number; error: string }[];
}

export const batchImport = async (
  rows: ImportRow[],
  companyName: string,
  defaultCounterLedger: string,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> => {
  const validRows = rows.filter(r => r.errors.length === 0);
  const progress: ImportProgress = {
    total: validRows.length,
    completed: 0,
    success: 0,
    failed: 0,
    errors: [],
  };

  const BATCH_SIZE = 10;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    for (const row of batch) {
      const counterLedger = row.counterLedger || row.matchedLedger || defaultCounterLedger;
      const entries: VoucherEntry[] = [
        { ledgerName: row.partyName || counterLedger, amount: row.amount, isDebit: row.isDebit },
        { ledgerName: counterLedger, amount: row.amount, isDebit: !row.isDebit },
      ];

      try {
        const success = await importVoucher(companyName, {
          voucherType: row.voucherType,
          date: row.date.split('-').reverse().join('-'),
          narration: row.narration,
          partyName: row.partyName || undefined,
          entries,
        });

        if (success) {
          progress.success++;
        } else {
          progress.failed++;
          progress.errors.push({ index: row.index, error: 'Tally rejected the voucher' });
        }
      } catch (err) {
        progress.failed++;
        progress.errors.push({ index: row.index, error: String(err) });
      }

      progress.completed++;
      onProgress({ ...progress });
    }
  }

  return progress;
};

// ─── Import Templates ───

export interface ImportTemplate {
  id: string;
  name: string;
  mapping: Record<string, TallyField>;
  defaultVoucherType: VoucherType;
  defaultCounterLedger: string;
  createdAt: string;
}

const IMPORT_TEMPLATES_KEY = 'import_templates';

export const getImportTemplates = (): ImportTemplate[] => {
  try { return JSON.parse(localStorage.getItem(IMPORT_TEMPLATES_KEY) || '[]'); }
  catch { return []; }
};

export const saveImportTemplate = (t: Omit<ImportTemplate, 'id' | 'createdAt'>): ImportTemplate => {
  const templates = getImportTemplates();
  const newT: ImportTemplate = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  templates.push(newT);
  localStorage.setItem(IMPORT_TEMPLATES_KEY, JSON.stringify(templates));
  return newT;
};

export const deleteImportTemplate = (id: string): void => {
  const templates = getImportTemplates().filter(t => t.id !== id);
  localStorage.setItem(IMPORT_TEMPLATES_KEY, JSON.stringify(templates));
};
