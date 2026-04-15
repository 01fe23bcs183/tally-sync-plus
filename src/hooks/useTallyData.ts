import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import * as tallyApi from '@/services/tallyXmlService';
import { Ledger, StockItem, Voucher, Company } from '@/types/tally';

// Demo data for when Tally is not connected
const demoCompanies: Company[] = [
  { name: 'ABC Enterprises', formalName: 'ABC Enterprises Pvt Ltd', financialYearFrom: '01-Apr-2025', financialYearTo: '31-Mar-2026', booksFrom: '01-Apr-2025' },
];

const demoLedgers: Ledger[] = [
  { name: 'Cash', parent: 'Cash-in-Hand', openingBalance: 50000, closingBalance: 125000 },
  { name: 'Bank of India', parent: 'Bank Accounts', openingBalance: 500000, closingBalance: 875000 },
  { name: 'Sundry Debtors', parent: 'Sundry Debtors', openingBalance: 250000, closingBalance: 320000 },
  { name: 'Sundry Creditors', parent: 'Sundry Creditors', openingBalance: -180000, closingBalance: -145000 },
  { name: 'Sales Account', parent: 'Sales Accounts', openingBalance: 0, closingBalance: -1200000 },
  { name: 'Purchase Account', parent: 'Purchase Accounts', openingBalance: 0, closingBalance: 800000 },
  { name: 'Rent Expense', parent: 'Indirect Expenses', openingBalance: 0, closingBalance: 120000 },
  { name: 'Salary Expense', parent: 'Indirect Expenses', openingBalance: 0, closingBalance: 300000 },
  { name: 'Capital Account', parent: 'Capital Account', openingBalance: -1000000, closingBalance: -1000000 },
  { name: 'GST Output', parent: 'Duties & Taxes', openingBalance: 0, closingBalance: -216000 },
  { name: 'GST Input', parent: 'Duties & Taxes', openingBalance: 0, closingBalance: 144000 },
  { name: 'Profit & Loss A/c', parent: 'Primary', openingBalance: 0, closingBalance: 0 },
];

const demoStockItems: StockItem[] = [
  { name: 'Laptop - Dell Inspiron', parent: 'Electronics', category: 'Laptops', unit: 'Nos', openingBalance: 50, openingRate: 35000, openingValue: 1750000, closingBalance: 32, closingRate: 35000, closingValue: 1120000 },
  { name: 'Mouse - Logitech', parent: 'Accessories', category: 'Peripherals', unit: 'Nos', openingBalance: 200, openingRate: 500, openingValue: 100000, closingBalance: 145, closingRate: 500, closingValue: 72500 },
  { name: 'Keyboard - HP', parent: 'Accessories', category: 'Peripherals', unit: 'Nos', openingBalance: 150, openingRate: 800, openingValue: 120000, closingBalance: 98, closingRate: 800, closingValue: 78400 },
  { name: 'Monitor - Samsung 24"', parent: 'Electronics', category: 'Monitors', unit: 'Nos', openingBalance: 30, openingRate: 12000, openingValue: 360000, closingBalance: 18, closingRate: 12000, closingValue: 216000 },
];

const demoVouchers: Voucher[] = [
  { id: '1', date: '2026-04-15', voucherType: 'Sales', voucherNumber: 'S-001', narration: 'Sold 5 laptops', entries: [{ ledgerName: 'Sundry Debtors', amount: 175000, isDebit: true }, { ledgerName: 'Sales Account', amount: 175000, isDebit: false }], totalAmount: 175000, partyName: 'Rajesh Traders', isSynced: true, syncStatus: 'synced' },
  { id: '2', date: '2026-04-14', voucherType: 'Purchase', voucherNumber: 'P-001', narration: 'Purchased keyboards', entries: [{ ledgerName: 'Purchase Account', amount: 40000, isDebit: true }, { ledgerName: 'Sundry Creditors', amount: 40000, isDebit: false }], totalAmount: 40000, partyName: 'Tech Suppliers Ltd', isSynced: true, syncStatus: 'synced' },
  { id: '3', date: '2026-04-13', voucherType: 'Receipt', voucherNumber: 'R-001', narration: 'Received from Rajesh', entries: [{ ledgerName: 'Bank of India', amount: 100000, isDebit: true }, { ledgerName: 'Sundry Debtors', amount: 100000, isDebit: false }], totalAmount: 100000, partyName: 'Rajesh Traders', isSynced: true, syncStatus: 'synced' },
  { id: '4', date: '2026-04-12', voucherType: 'Payment', voucherNumber: 'PM-001', narration: 'Rent paid', entries: [{ ledgerName: 'Rent Expense', amount: 25000, isDebit: true }, { ledgerName: 'Bank of India', amount: 25000, isDebit: false }], totalAmount: 25000, isSynced: true, syncStatus: 'synced' },
  { id: '5', date: '2026-04-11', voucherType: 'Journal', voucherNumber: 'J-001', narration: 'Salary provision', entries: [{ ledgerName: 'Salary Expense', amount: 50000, isDebit: true }, { ledgerName: 'Sundry Creditors', amount: 50000, isDebit: false }], totalAmount: 50000, isSynced: false, syncStatus: 'pending' },
];

export const useCompanies = () => {
  const { connection } = useApp();
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      if (!connection.isConnected) return demoCompanies;
      const companies = await tallyApi.fetchCompanies();
      return companies.map(c => ({ ...c, financialYearFrom: '', financialYearTo: '', booksFrom: '' }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useLedgers = () => {
  const { connection, selectedCompany } = useApp();
  return useQuery({
    queryKey: ['ledgers', selectedCompany],
    queryFn: async () => {
      if (!connection.isConnected || !selectedCompany) return demoLedgers;
      return tallyApi.fetchLedgers(selectedCompany);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useStockItems = () => {
  const { connection, selectedCompany } = useApp();
  return useQuery({
    queryKey: ['stockItems', selectedCompany],
    queryFn: async () => {
      if (!connection.isConnected || !selectedCompany) return demoStockItems;
      return tallyApi.fetchStockItems(selectedCompany);
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useVouchers = () => {
  const { connection, selectedCompany } = useApp();
  return useQuery({
    queryKey: ['vouchers', selectedCompany],
    queryFn: async () => {
      if (!connection.isConnected || !selectedCompany) return demoVouchers;
      return tallyApi.fetchVouchers(selectedCompany);
    },
    staleTime: 60 * 1000,
  });
};
