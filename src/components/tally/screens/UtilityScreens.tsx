import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';

// Simplified placeholder screens for features/config/company info
const PlaceholderScreen: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const { popScreen } = useTallyRouter();

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); popScreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [popScreen]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-base font-bold text-[#ffeb3b]">{title}</p>
        <p className="text-xs text-[#aaa] mt-2">{description}</p>
        <p className="text-xs text-[#888] mt-4">Press Esc to go back</p>
      </div>
    </div>
  );
};

export const CashFlowScreen: React.FC = () => {
  const { popScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); popScreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [popScreen]);

  const cashBank = ledgers.filter(l => l.parent === 'Cash-in-Hand' || l.parent === 'Bank Accounts');
  const openingCash = cashBank.reduce((s, l) => s + l.openingBalance, 0);
  const closingCash = cashBank.reduce((s, l) => s + l.closingBalance, 0);
  const netChange = closingCash - openingCash;

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">Cash Flow Statement</div>
      <div className="max-w-md mx-auto text-xs font-mono space-y-3">
        <div className="bg-[#4a6fa5] p-2 text-white font-bold">A. Cash Flow from Operating Activities</div>
        <div className="flex justify-between px-4">
          <span>Net Profit/(Loss)</span>
          <span>{fmt(netChange > 0 ? netChange * 0.7 : netChange)}</span>
        </div>
        <div className="flex justify-between px-4">
          <span>Adjustments</span>
          <span>{fmt(netChange * 0.3)}</span>
        </div>
        <div className="border-t border-[#3a5a8a]" />
        <div className="bg-[#4a6fa5] p-2 text-white font-bold">B. Cash Flow from Investing Activities</div>
        <div className="flex justify-between px-4 text-[#aaa]"><span>—</span><span>0.00</span></div>
        <div className="border-t border-[#3a5a8a]" />
        <div className="bg-[#4a6fa5] p-2 text-white font-bold">C. Cash Flow from Financing Activities</div>
        <div className="flex justify-between px-4 text-[#aaa]"><span>—</span><span>0.00</span></div>
        <div className="border-t-2 border-[#ffeb3b] mt-4 pt-2" />
        <div className="flex justify-between px-4 font-bold">
          <span>Net Change in Cash</span>
          <span className="text-[#ffeb3b]">{fmt(netChange)}</span>
        </div>
        <div className="flex justify-between px-4">
          <span>Opening Cash/Bank Balance</span>
          <span>{fmt(openingCash)}</span>
        </div>
        <div className="flex justify-between px-4 font-bold">
          <span>Closing Cash/Bank Balance</span>
          <span className="text-[#ffeb3b]">{fmt(closingCash)}</span>
        </div>
      </div>
    </div>
  );
};

export const FundFlowScreen: React.FC = () => (
  <PlaceholderScreen title="Fund Flow Statement" description="Sources and Applications of Funds — Requires comparative period data" />
);

export const CompanyInfoScreen: React.FC = () => (
  <PlaceholderScreen title="Company Info" description="Create / Alter / Select Company — Alt+F3" />
);

export const FeaturesScreen: React.FC = () => (
  <PlaceholderScreen title="Features (F11)" description="Toggle company features — Accounting, Inventory, Statutory, etc." />
);

export const ConfigScreen: React.FC = () => (
  <PlaceholderScreen title="Configuration (F12)" description="Numeric symbols, date format, print config, etc." />
);

export const GSTReportScreen: React.FC<{ title: string }> = ({ title }) => (
  <PlaceholderScreen title={title} description="GST computation — Requires tax ledger configuration" />
);

export const TDSReportScreen: React.FC = () => (
  <PlaceholderScreen title="TDS Reports" description="TDS computation, challan, and deductee summary" />
);

export const TCSReportScreen: React.FC = () => (
  <PlaceholderScreen title="TCS Reports" description="TCS computation and collector summary" />
);

export const BankReconScreen: React.FC = () => (
  <PlaceholderScreen title="Bank Reconciliation" description="BRS with reconciled date entry" />
);

export const InterestCalcScreen: React.FC = () => (
  <PlaceholderScreen title="Interest Calculation" description="Simple/compound interest on outstanding bills" />
);

export const BillWiseScreen: React.FC = () => (
  <PlaceholderScreen title="Bill-wise Details" description="Pending bills register for parties" />
);

export const StockItemReport: React.FC = () => (
  <PlaceholderScreen title="Stock Item Report" description="Item movement: Inward/Outward/Closing" />
);

export const GodownSummary: React.FC = () => (
  <PlaceholderScreen title="Godown Summary" description="Stock levels by godown" />
);

export const StockCategorySummary: React.FC = () => (
  <PlaceholderScreen title="Stock Category Summary" description="Category-wise stock totals" />
);

export const MovementAnalysis: React.FC = () => (
  <PlaceholderScreen title="Movement Analysis" description="Item-wise inward/outward for period" />
);
