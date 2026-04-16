import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const CashBankBook: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const cashBankLedgers = ledgers.filter(l =>
    l.parent === 'Cash-in-Hand' || l.parent === 'Bank Accounts'
  );

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    return `${abs.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${n < 0 ? 'Cr' : 'Dr'}`;
  };

  return (
    <TallyTable
      title="Cash/Bank Book"
      columns={[
        { key: 'name', header: 'Account Name' },
        { key: 'parent', header: 'Type', width: '120px' },
        { key: 'openingBalance', header: 'Opening', width: '140px', align: 'right', render: fmt },
        { key: 'closingBalance', header: 'Closing', width: '140px', align: 'right', render: fmt },
      ]}
      data={cashBankLedgers}
      onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export default CashBankBook;
