// Tally data types

export type AppMode = 'easy' | 'tally';

export interface TallyConnection {
  host: string;
  port: number;
  isConnected: boolean;
  lastSync: Date | null;
  companyName: string | null;
}

export interface Company {
  name: string;
  formalName: string;
  financialYearFrom: string;
  financialYearTo: string;
  booksFrom: string;
}

export interface LedgerGroup {
  name: string;
  parent: string;
  primaryGroup: string;
  nature: string;
}

export interface Ledger {
  name: string;
  parent: string;
  openingBalance: number;
  closingBalance: number;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
}

export interface StockItem {
  name: string;
  parent: string;
  category: string;
  unit: string;
  openingBalance: number;
  openingRate: number;
  openingValue: number;
  closingBalance: number;
  closingRate: number;
  closingValue: number;
  godownWise?: { godown: string; quantity: number }[];
}

export interface StockGroup {
  name: string;
  parent: string;
}

export interface VoucherEntry {
  ledgerName: string;
  amount: number;
  isDebit: boolean;
}

export type VoucherType = 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal' | 'Contra' | 'Credit Note' | 'Debit Note';

export interface Voucher {
  id: string;
  date: string;
  voucherType: VoucherType;
  voucherNumber: string;
  narration: string;
  entries: VoucherEntry[];
  totalAmount: number;
  partyName?: string;
  isSynced: boolean;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface BalanceSheetItem {
  name: string;
  amount: number;
  children?: BalanceSheetItem[];
}

export interface ProfitLossItem {
  name: string;
  amount: number;
  children?: ProfitLossItem[];
}

export interface DayBookEntry {
  date: string;
  voucherType: string;
  voucherNumber: string;
  partyName: string;
  amount: number;
  narration: string;
}

export interface SyncState {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  errors: string[];
}
