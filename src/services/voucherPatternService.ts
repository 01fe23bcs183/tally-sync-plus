// Smart voucher entry services: pattern analysis, duplicate detection, templates

import { Voucher, VoucherType, VoucherEntry, Ledger } from '@/types/tally';

// ─── Duplicate Detection ───

export interface DuplicateMatch {
  voucher: Voucher;
  score: number; // 0-100
  reasons: string[];
}

export const detectDuplicates = (
  vouchers: Voucher[],
  partyName: string | undefined,
  amount: number,
  date: string,
  voucherType: VoucherType
): DuplicateMatch[] => {
  if (!amount || amount === 0) return [];

  const targetDate = new Date(date);
  const matches: DuplicateMatch[] = [];

  for (const v of vouchers) {
    if (v.voucherType !== voucherType) continue;

    let score = 0;
    const reasons: string[] = [];

    // Amount match (±5%)
    const amtDiff = Math.abs(v.totalAmount - amount) / Math.max(amount, 1);
    if (amtDiff === 0) {
      score += 40;
      reasons.push('Exact amount match');
    } else if (amtDiff <= 0.05) {
      score += 25;
      reasons.push(`Amount within 5% (${formatCur(v.totalAmount)})`);
    }

    // Party match
    if (partyName && v.partyName &&
        v.partyName.toLowerCase() === partyName.toLowerCase()) {
      score += 35;
      reasons.push('Same party');
    }

    // Date proximity (within 7 days)
    const vDate = new Date(v.date);
    const daysDiff = Math.abs(targetDate.getTime() - vDate.getTime()) / 86400000;
    if (daysDiff <= 1) {
      score += 25;
      reasons.push('Same/next day');
    } else if (daysDiff <= 7) {
      score += 15;
      reasons.push(`Within ${Math.round(daysDiff)} days`);
    }

    if (score >= 50) {
      matches.push({ voucher: v, score, reasons });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 3);
};

const formatCur = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Pattern Analysis ───

export interface LedgerPairSuggestion {
  creditLedger: string;
  frequency: number;
  lastUsed: string;
}

export const suggestLedgerPairs = (
  vouchers: Voucher[],
  debitLedger: string,
  voucherType: VoucherType
): LedgerPairSuggestion[] => {
  const pairCounts: Record<string, { count: number; lastDate: string }> = {};

  for (const v of vouchers) {
    if (v.voucherType !== voucherType) continue;
    const debits = v.entries.filter(e => e.isDebit);
    const credits = v.entries.filter(e => !e.isDebit);

    for (const dr of debits) {
      if (dr.ledgerName.toLowerCase() !== debitLedger.toLowerCase()) continue;
      for (const cr of credits) {
        const key = cr.ledgerName;
        if (!pairCounts[key]) pairCounts[key] = { count: 0, lastDate: '' };
        pairCounts[key].count++;
        if (v.date > pairCounts[key].lastDate) pairCounts[key].lastDate = v.date;
      }
    }
  }

  return Object.entries(pairCounts)
    .map(([ledger, data]) => ({
      creditLedger: ledger,
      frequency: data.count,
      lastUsed: data.lastDate,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
};

// ─── Narration Suggestions ───

export const suggestNarrations = (
  vouchers: Voucher[],
  partyName: string | undefined,
  voucherType: VoucherType
): string[] => {
  const narrations: Record<string, number> = {};

  for (const v of vouchers) {
    if (v.voucherType !== voucherType) continue;
    if (partyName && v.partyName?.toLowerCase() !== partyName.toLowerCase()) continue;
    if (!v.narration) continue;
    narrations[v.narration] = (narrations[v.narration] || 0) + 1;
  }

  return Object.entries(narrations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([n]) => n);
};

// ─── Templates ───

export interface VoucherTemplate {
  id: string;
  name: string;
  voucherType: VoucherType;
  entries: VoucherEntry[];
  narration: string;
  partyName?: string;
  createdAt: string;
}

const TEMPLATES_KEY = 'voucher_templates';

export const getTemplates = (): VoucherTemplate[] => {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveTemplate = (template: Omit<VoucherTemplate, 'id' | 'createdAt'>): VoucherTemplate => {
  const templates = getTemplates();
  const newTemplate: VoucherTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return newTemplate;
};

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

// ─── Fuzzy Search ───

export const fuzzyMatch = (query: string, items: string[]): string[] => {
  if (!query) return items.slice(0, 20);
  const q = query.toLowerCase();
  
  const scored = items.map(item => {
    const lower = item.toLowerCase();
    let score = 0;
    
    if (lower === q) score = 100;
    else if (lower.startsWith(q)) score = 80;
    else if (lower.includes(q)) score = 60;
    else {
      // Character-by-character fuzzy
      let qi = 0;
      for (let i = 0; i < lower.length && qi < q.length; i++) {
        if (lower[i] === q[qi]) qi++;
      }
      if (qi === q.length) score = 30 + (q.length / lower.length) * 20;
    }
    
    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map(s => s.item);
};

// ─── Validation ───

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const validateVoucher = (
  voucherType: VoucherType,
  entries: VoucherEntry[],
  date: string,
  partyName?: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!date) errors.push({ field: 'date', message: 'Date is required', severity: 'error' });
  if (entries.length < 2) errors.push({ field: 'entries', message: 'At least 2 ledger entries required', severity: 'error' });

  const totalDebit = entries.filter(e => e.isDebit).reduce((s, e) => s + Math.abs(e.amount), 0);
  const totalCredit = entries.filter(e => !e.isDebit).reduce((s, e) => s + Math.abs(e.amount), 0);

  if (entries.length >= 2 && Math.abs(totalDebit - totalCredit) > 0.01) {
    errors.push({
      field: 'entries',
      message: `Debit (${formatCur(totalDebit)}) ≠ Credit (${formatCur(totalCredit)})`,
      severity: 'error',
    });
  }

  if (['Sales', 'Purchase', 'Receipt', 'Payment'].includes(voucherType) && !partyName) {
    errors.push({ field: 'partyName', message: 'Party name recommended for this voucher type', severity: 'warning' });
  }

  for (const e of entries) {
    if (!e.ledgerName) errors.push({ field: 'entries', message: 'Ledger name is required for all entries', severity: 'error' });
    if (e.amount <= 0) errors.push({ field: 'entries', message: `Amount must be positive for ${e.ledgerName || 'entry'}`, severity: 'error' });
  }

  return errors;
};
