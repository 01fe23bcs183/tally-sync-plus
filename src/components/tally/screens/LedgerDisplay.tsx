import React, { useState } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const formatCurrency = (n: number) => {
  const abs = Math.abs(n);
  return `${abs.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${n < 0 ? 'Cr' : n > 0 ? 'Dr' : ''}`;
};

const LedgerDisplay: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  return (
    <TallyTable
      title="List of Ledgers"
      columns={[
        { key: 'name', header: 'Particulars', width: '250px' },
        { key: 'parent', header: 'Under', width: '150px' },
        { key: 'closingBalance', header: 'Closing Balance', width: '150px', align: 'right',
          render: (v: number) => formatCurrency(v) },
      ]}
      data={ledgers}
      onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export default LedgerDisplay;
