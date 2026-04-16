import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const GroupSummary: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const groups: Record<string, { name: string; debit: number; credit: number; count: number }> = {};
  ledgers.forEach(l => {
    if (!groups[l.parent]) groups[l.parent] = { name: l.parent, debit: 0, credit: 0, count: 0 };
    groups[l.parent].count++;
    if (l.closingBalance > 0) groups[l.parent].debit += l.closingBalance;
    else groups[l.parent].credit += Math.abs(l.closingBalance);
  });

  const data = Object.values(groups);
  const fmt = (v: number) => v > 0 ? v.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <TallyTable
      title="Group Summary"
      columns={[
        { key: 'name', header: 'Group Name' },
        { key: 'count', header: 'Ledgers', width: '70px', align: 'right' },
        { key: 'debit', header: 'Debit', width: '130px', align: 'right', render: fmt },
        { key: 'credit', header: 'Credit', width: '130px', align: 'right', render: fmt },
      ]}
      data={data}
      showTotal={[{ key: 'debit' }, { key: 'credit' }]}
      onSelect={(row) => pushScreen('ledger-display', {}, row.name)}
      onBack={popScreen}
    />
  );
};

export default GroupSummary;
