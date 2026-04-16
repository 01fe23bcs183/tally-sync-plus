import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const INCOME_GROUPS = ['Sales Accounts'];
const EXPENSE_GROUPS = ['Purchase Accounts', 'Indirect Expenses'];

const ProfitLoss: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const income = ledgers.filter(l => INCOME_GROUPS.includes(l.parent));
  const expenses = ledgers.filter(l => EXPENSE_GROUPS.includes(l.parent));

  const totalIncome = Math.abs(income.reduce((s, l) => s + l.closingBalance, 0));
  const totalExpenses = expenses.reduce((s, l) => s + l.closingBalance, 0);
  const netProfit = totalIncome - totalExpenses;

  const fmt = (v: number) => v > 0 ? v.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <div className="flex flex-col h-full">
      <div className="text-center font-bold text-[#ffeb3b] py-1 text-sm">Profit & Loss A/c</div>
      <div className="flex flex-1 overflow-hidden">
        {/* Expenses */}
        <div className="flex-1 border-r border-[#4a6fa5]">
          <TallyTable
            title="Expenses"
            columns={[
              { key: 'name', header: 'Particulars' },
              { key: 'amount', header: 'Amount', width: '140px', align: 'right', render: fmt },
            ]}
            data={[
              ...expenses.map(l => ({ name: l.name, amount: l.closingBalance })),
              ...(netProfit > 0 ? [{ name: 'Net Profit', amount: netProfit }] : []),
            ]}
            showTotal={[{ key: 'amount', label: 'Total' }]}
            onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
            onBack={popScreen}
          />
        </div>
        {/* Income */}
        <div className="flex-1">
          <TallyTable
            title="Income"
            columns={[
              { key: 'name', header: 'Particulars' },
              { key: 'amount', header: 'Amount', width: '140px', align: 'right', render: fmt },
            ]}
            data={[
              ...income.map(l => ({ name: l.name, amount: Math.abs(l.closingBalance) })),
              ...(netProfit < 0 ? [{ name: 'Net Loss', amount: Math.abs(netProfit) }] : []),
            ]}
            showTotal={[{ key: 'amount', label: 'Total' }]}
            onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
            onBack={popScreen}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
