import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const TrialBalance: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const data = ledgers
    .filter(l => l.closingBalance !== 0)
    .map(l => ({
      name: l.name,
      debit: l.closingBalance > 0 ? l.closingBalance : 0,
      credit: l.closingBalance < 0 ? Math.abs(l.closingBalance) : 0,
    }));

  const fmt = (v: number) => v > 0 ? v.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <TallyTable
      title="Trial Balance"
      columns={[
        { key: 'name', header: 'Particulars' },
        { key: 'debit', header: 'Debit', width: '150px', align: 'right', render: fmt },
        { key: 'credit', header: 'Credit', width: '150px', align: 'right', render: fmt },
      ]}
      data={data}
      showTotal={[{ key: 'debit' }, { key: 'credit' }]}
      onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export default TrialBalance;
