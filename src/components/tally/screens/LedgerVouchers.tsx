import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useVouchers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const formatCurrency = (n: number) =>
  `${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${n < 0 ? 'Cr' : 'Dr'}`;

const LedgerVouchers: React.FC = () => {
  const { popScreen, params, pushScreen } = useTallyRouter();
  const { data: vouchers = [] } = useVouchers();
  const ledgerName = params.ledgerName || '';

  const filtered = vouchers.filter(v =>
    v.entries.some(e => e.ledgerName === ledgerName)
  );

  let runningBalance = 0;
  const data = filtered.map(v => {
    const entry = v.entries.find(e => e.ledgerName === ledgerName);
    const amount = entry ? (entry.isDebit ? entry.amount : -entry.amount) : 0;
    runningBalance += amount;
    return {
      date: v.date,
      type: v.voucherType,
      vchNo: v.voucherNumber,
      particulars: v.entries.filter(e => e.ledgerName !== ledgerName).map(e => e.ledgerName).join(', '),
      debit: amount > 0 ? amount : 0,
      credit: amount < 0 ? Math.abs(amount) : 0,
      balance: runningBalance,
      id: v.id,
    };
  });

  const fmt = (v: number) => v > 0 ? v.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <TallyTable
      title={`Ledger: ${ledgerName}`}
      columns={[
        { key: 'date', header: 'Date', width: '90px' },
        { key: 'type', header: 'Vch Type', width: '80px' },
        { key: 'vchNo', header: 'Vch No.', width: '70px' },
        { key: 'particulars', header: 'Particulars' },
        { key: 'debit', header: 'Debit', width: '110px', align: 'right', render: fmt },
        { key: 'credit', header: 'Credit', width: '110px', align: 'right', render: fmt },
        { key: 'balance', header: 'Cl. Bal', width: '110px', align: 'right',
          render: (v: number) => formatCurrency(v) },
      ]}
      data={data}
      showTotal={[{ key: 'debit' }, { key: 'credit' }]}
      onSelect={(row) => pushScreen('voucher-detail', { voucherId: row.id }, `Voucher ${row.vchNo}`)}
      onBack={popScreen}
    />
  );
};

export default LedgerVouchers;
