import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const OutstandingReceivables: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const debtors = ledgers.filter(l => l.parent === 'Sundry Debtors' && l.closingBalance > 0);
  const fmt = (v: number) => v.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <TallyTable
      title="Outstanding Receivables"
      columns={[
        { key: 'name', header: 'Party Name' },
        { key: 'closingBalance', header: 'Amount Due', width: '150px', align: 'right', render: fmt },
      ]}
      data={debtors}
      showTotal={[{ key: 'closingBalance', label: 'Total' }]}
      onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export const OutstandingPayables: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const creditors = ledgers.filter(l => l.parent === 'Sundry Creditors' && l.closingBalance < 0);
  const fmt = (v: number) => v.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <TallyTable
      title="Outstanding Payables"
      columns={[
        { key: 'name', header: 'Party Name' },
        { key: 'amount', header: 'Amount Due', width: '150px', align: 'right', render: fmt },
      ]}
      data={creditors.map(l => ({ name: l.name, amount: Math.abs(l.closingBalance) }))}
      showTotal={[{ key: 'amount', label: 'Total' }]}
      onSelect={(row) => pushScreen('ledger-vouchers', { ledgerName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export default OutstandingReceivables;
