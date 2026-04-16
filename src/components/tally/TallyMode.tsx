import React, { useRef, useEffect } from 'react';
import { TallyRouterProvider, useTallyRouter } from './TallyScreenRouter';
import TallyTopBar from './TallyTopBar';
import TallyFKeyBar from './TallyFKeyBar';

// Screens
import TallyGateway from './screens/TallyGateway';
import MastersMenu from './screens/MastersMenu';
import DisplayMenu from './screens/DisplayMenu';
import ReportsMenu from './screens/ReportsMenu';
import LedgerCreate from './screens/LedgerCreate';
import LedgerDisplay from './screens/LedgerDisplay';
import StockItemCreate from './screens/StockItemCreate';
import DayBook from './screens/DayBook';
import TrialBalance from './screens/TrialBalance';
import BalanceSheet from './screens/BalanceSheet';
import ProfitLoss from './screens/ProfitLoss';
import StockSummary from './screens/StockSummary';
import VoucherDetail from './screens/VoucherDetail';
import LedgerVouchers from './screens/LedgerVouchers';
import VoucherEntry from './screens/VoucherEntry';
import { SalesRegister, PurchaseRegister, JournalRegister } from './screens/Registers';
import GroupSummary from './screens/GroupSummary';
import CashBankBook from './screens/CashBankBook';
import OutstandingReceivables, { OutstandingPayables } from './screens/Outstanding';
import RatioAnalysis from './screens/RatioAnalysis';
import {
  CashFlowScreen, FundFlowScreen, CompanyInfoScreen,
  FeaturesScreen, ConfigScreen, GSTReportScreen,
  TDSReportScreen, TCSReportScreen, BankReconScreen,
  InterestCalcScreen, BillWiseScreen, StockItemReport,
  GodownSummary, StockCategorySummary, MovementAnalysis,
} from './screens/UtilityScreens';

const TallyScreenRenderer: React.FC = () => {
  const { currentScreen, pushScreen } = useTallyRouter();

  switch (currentScreen) {
    case 'gateway': return <TallyGateway />;
    case 'masters': return <MastersMenu />;
    case 'display-menu': return <DisplayMenu />;
    case 'reports-menu': return <ReportsMenu />;

    // Masters
    case 'ledger-create': return <LedgerCreate />;
    case 'ledger-alter': return <LedgerDisplay />;
    case 'ledger-display': return <LedgerDisplay />;
    case 'group-create': return <LedgerCreate />; // Reuse form pattern
    case 'group-alter': return <LedgerDisplay />;
    case 'group-display': return <LedgerDisplay />;
    case 'stock-item-create': return <StockItemCreate />;
    case 'stock-item-alter': return <LedgerDisplay />;
    case 'stock-item-display': return <LedgerDisplay />;
    case 'stock-group-create': return <StockItemCreate />;
    case 'stock-group-alter': return <LedgerDisplay />;
    case 'godown-create': return <LedgerCreate />;
    case 'godown-alter': return <LedgerDisplay />;
    case 'godown-display': return <LedgerDisplay />;
    case 'cost-centre-create': return <LedgerCreate />;
    case 'cost-centre-alter': return <LedgerDisplay />;
    case 'cost-centre-display': return <LedgerDisplay />;
    case 'unit-create': return <LedgerCreate />;
    case 'unit-alter': return <LedgerDisplay />;
    case 'voucher-type-alter': return <LedgerDisplay />;

    // Voucher Entry
    case 'voucher-sales': return <VoucherEntry voucherType="Sales" />;
    case 'voucher-purchase': return <VoucherEntry voucherType="Purchase" />;
    case 'voucher-payment': return <VoucherEntry voucherType="Payment" />;
    case 'voucher-receipt': return <VoucherEntry voucherType="Receipt" />;
    case 'voucher-journal': return <VoucherEntry voucherType="Journal" />;
    case 'voucher-contra': return <VoucherEntry voucherType="Contra" />;
    case 'voucher-debit-note': return <VoucherEntry voucherType="Debit Note" />;
    case 'voucher-credit-note': return <VoucherEntry voucherType="Credit Note" />;

    // Reports
    case 'daybook': return <DayBook />;
    case 'cash-book': case 'bank-book': return <CashBankBook />;
    case 'sales-register': return <SalesRegister />;
    case 'purchase-register': return <PurchaseRegister />;
    case 'journal-register': return <JournalRegister />;
    case 'ledger-vouchers': return <LedgerVouchers />;
    case 'voucher-detail': return <VoucherDetail />;

    // Statements
    case 'trial-balance': return <TrialBalance />;
    case 'balance-sheet': return <BalanceSheet />;
    case 'profit-loss': return <ProfitLoss />;
    case 'stock-summary': return <StockSummary />;
    case 'outstanding-receivables': return <OutstandingReceivables />;
    case 'outstanding-payables': return <OutstandingPayables />;
    case 'group-summary': return <GroupSummary />;

    // Inventory Reports
    case 'stock-item-report': return <StockItemReport />;
    case 'godown-summary': return <GodownSummary />;
    case 'stock-category-summary': return <StockCategorySummary />;
    case 'movement-analysis': return <MovementAnalysis />;

    // Statutory
    case 'gstr1': return <GSTReportScreen title="GSTR-1" />;
    case 'gstr3b': return <GSTReportScreen title="GSTR-3B" />;
    case 'gst-payment': return <GSTReportScreen title="GST Payment" />;
    case 'tds-reports': return <TDSReportScreen />;
    case 'tcs-reports': return <TCSReportScreen />;
    case 'statutory-ledger': return <LedgerDisplay />;

    // Display & Utilities
    case 'ratio-analysis': return <RatioAnalysis />;
    case 'cash-flow': return <CashFlowScreen />;
    case 'fund-flow': return <FundFlowScreen />;
    case 'bank-reconciliation': return <BankReconScreen />;
    case 'interest-calculation': return <InterestCalcScreen />;
    case 'bill-wise-details': return <BillWiseScreen />;
    case 'company-info': return <CompanyInfoScreen />;
    case 'features-f11': return <FeaturesScreen />;
    case 'config-f12': return <ConfigScreen />;

    default:
      return (
        <div className="flex items-center justify-center h-full text-[#ffeb3b]">
          <div className="text-center">
            <p className="text-lg font-bold">{currentScreen}</p>
            <p className="text-sm mt-2 text-[#aaa]">Press Esc to go back</p>
          </div>
        </div>
      );
  }
};

const TallyModeInner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentScreen, pushScreen } = useTallyRouter();

  useEffect(() => { containerRef.current?.focus(); }, []);

  // Context-sensitive F-key bar
  const getFKeys = () => {
    if (currentScreen === 'gateway') {
      return [
        { key: 'F1', label: 'Help' },
        { key: 'F2', label: 'Date' },
        { key: 'F3', label: 'Cmp Info' },
        { key: 'F4', label: 'Contra', action: () => pushScreen('voucher-contra', {}, 'Contra Voucher') },
        { key: 'F5', label: 'Payment', action: () => pushScreen('voucher-payment', {}, 'Payment Voucher') },
        { key: 'F6', label: 'Receipt', action: () => pushScreen('voucher-receipt', {}, 'Receipt Voucher') },
        { key: 'F7', label: 'Journal', action: () => pushScreen('voucher-journal', {}, 'Journal Voucher') },
        { key: 'F8', label: 'Sales', action: () => pushScreen('voucher-sales', {}, 'Sales Voucher') },
        { key: 'F9', label: 'Purchase', action: () => pushScreen('voucher-purchase', {}, 'Purchase Voucher') },
        { key: 'F10', label: 'Memo' },
      ];
    }
    return [
      { key: 'F1', label: 'Help' },
      { key: 'F2', label: 'Period' },
      { key: 'F3', label: 'Company' },
      { key: 'F4', label: 'Filter' },
      { key: 'F5', label: 'Export' },
      { key: 'F6', label: 'Print' },
      { key: 'F7', label: '' },
      { key: 'F8', label: '' },
      { key: 'F9', label: '' },
      { key: 'F10', label: '' },
    ];
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="h-full font-mono text-sm text-[#e0e0e0] outline-none flex flex-col"
      style={{ backgroundColor: '#1a3a5c' }}
    >
      <TallyTopBar />
      <div className="flex-1 overflow-auto">
        <TallyScreenRenderer />
      </div>
      <TallyFKeyBar keys={getFKeys()} />
    </div>
  );
};

const TallyMode: React.FC = () => (
  <TallyRouterProvider>
    <TallyModeInner />
  </TallyRouterProvider>
);

export default TallyMode;
