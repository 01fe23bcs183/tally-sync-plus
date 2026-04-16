import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useVouchers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const formatCurrency = (n: number) =>
  `${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${n < 0 ? 'Cr' : 'Dr'}`;

const DayBook: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: vouchers = [] } = useVouchers();

  const data = vouchers.map(v => ({
    date: v.date,
    type: v.voucherType,
    vchNo: v.voucherNumber,
    particulars: v.partyName || v.narration,
    amount: v.totalAmount,
    id: v.id,
  }));

  return (
    <TallyTable
      title="Day Book"
      columns={[
        { key: 'date', header: 'Date', width: '90px' },
        { key: 'type', header: 'Vch Type', width: '80px' },
        { key: 'vchNo', header: 'Vch No.', width: '80px' },
        { key: 'particulars', header: 'Particulars' },
        { key: 'amount', header: 'Amount', width: '130px', align: 'right',
          render: (v: number) => formatCurrency(v) },
      ]}
      data={data}
      onSelect={(row) => pushScreen('voucher-detail', { voucherId: row.id }, `Voucher ${row.vchNo}`)}
      onBack={popScreen}
    />
  );
};

export default DayBook;
