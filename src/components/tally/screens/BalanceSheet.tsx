import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const ASSET_GROUPS = ['Cash-in-Hand', 'Bank Accounts', 'Sundry Debtors', 'Duties & Taxes'];
const LIABILITY_GROUPS = ['Sundry Creditors', 'Capital Account'];

const BalanceSheet: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const assets = ledgers.filter(l => ASSET_GROUPS.includes(l.parent) && l.closingBalance > 0);
  const liabilities = ledgers.filter(l => LIABILITY_GROUPS.includes(l.parent) || l.closingBalance < 0);

  const totalAssets = assets.reduce((s, l) => s + l.closingBalance, 0);
  const totalLiabilities = Math.abs(liabilities.reduce((s, l) => s + l.closingBalance, 0));
  const difference = totalAssets - totalLiabilities;

  const data = [
    ...liabilities.map(l => ({ name: l.name, side: 'Liabilities', amount: Math.abs(l.closingBalance) })),
    { name: '═══════════════', side: '', amount: 0 },
    ...assets.map(l => ({ name: l.name, side: 'Assets', amount: l.closingBalance })),
    ...(difference !== 0 ? [{ name: 'Difference in Opening Balances', side: '', amount: Math.abs(difference) }] : []),
  ];

  const fmt = (v: number) => v > 0 ? v.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <div className="flex flex-col h-full">
      <div className="text-center font-bold text-[#ffeb3b] py-1 text-sm">Balance Sheet</div>
      <div className="flex flex-1 overflow-hidden">
        {/* Liabilities */}
        <div className="flex-1 border-r border-[#4a6fa5]">
          <TallyTable
            title="Liabilities"
            columns={[
              { key: 'name', header: 'Particulars' },
              { key: 'amount', header: 'Amount', width: '140px', align: 'right', render: fmt },
            ]}
            data={liabilities.map(l => ({ name: l.name, amount: Math.abs(l.closingBalance) }))}
            showTotal={[{ key: 'amount', label: 'Total' }]}
            onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
            onBack={popScreen}
          />
        </div>
        {/* Assets */}
        <div className="flex-1">
          <TallyTable
            title="Assets"
            columns={[
              { key: 'name', header: 'Particulars' },
              { key: 'amount', header: 'Amount', width: '140px', align: 'right', render: fmt },
            ]}
            data={assets.map(l => ({ name: l.name, amount: l.closingBalance }))}
            showTotal={[{ key: 'amount', label: 'Total' }]}
            onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
            onBack={popScreen}
          />
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
