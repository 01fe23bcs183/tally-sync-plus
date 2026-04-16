import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useVouchers } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const RegisterScreen: React.FC<{ type: string; title: string }> = ({ type, title }) => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: vouchers = [] } = useVouchers();

  const filtered = vouchers.filter(v => v.voucherType === type);
  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <TallyTable
      title={title}
      columns={[
        { key: 'date', header: 'Date', width: '90px' },
        { key: 'voucherNumber', header: 'Vch No.', width: '80px' },
        { key: 'partyName', header: 'Party Name' },
        { key: 'narration', header: 'Narration' },
        { key: 'totalAmount', header: 'Amount', width: '130px', align: 'right', render: fmt },
      ]}
      data={filtered}
      showTotal={[{ key: 'totalAmount' }]}
      onSelect={(row) => pushScreen('voucher-detail', { voucherId: row.id }, `Voucher ${row.voucherNumber}`)}
      onBack={popScreen}
    />
  );
};

export const SalesRegister: React.FC = () => <RegisterScreen type="Sales" title="Sales Register" />;
export const PurchaseRegister: React.FC = () => <RegisterScreen type="Purchase" title="Purchase Register" />;
export const JournalRegister: React.FC = () => <RegisterScreen type="Journal" title="Journal Register" />;
