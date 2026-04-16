import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useVouchers } from '@/hooks/useTallyData';

const VoucherDetail: React.FC = () => {
  const { popScreen, params } = useTallyRouter();
  const { data: vouchers = [] } = useVouchers();
  const voucher = vouchers.find(v => v.id === params.voucherId);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); popScreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [popScreen]);

  if (!voucher) {
    return (
      <div className="p-4 text-center text-[#aaa]">
        Voucher not found. <span className="text-[#ffeb3b]">Press Esc to go back.</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">
        {voucher.voucherType} Voucher — {voucher.voucherNumber}
      </div>
      <div className="max-w-lg mx-auto text-xs space-y-2">
        <div className="flex"><span className="w-32 text-[#aaa]">Date:</span><span>{voucher.date}</span></div>
        <div className="flex"><span className="w-32 text-[#aaa]">Voucher Type:</span><span>{voucher.voucherType}</span></div>
        <div className="flex"><span className="w-32 text-[#aaa]">Voucher No.:</span><span>{voucher.voucherNumber}</span></div>
        {voucher.partyName && (
          <div className="flex"><span className="w-32 text-[#aaa]">Party Name:</span><span>{voucher.partyName}</span></div>
        )}
        <div className="border-t border-[#3a5a8a] my-3" />
        <div className="font-bold text-[#ffeb3b] mb-1">Entries:</div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#4a6fa5] text-white">
              <th className="p-1 text-left">Particulars</th>
              <th className="p-1 text-right w-28">Debit</th>
              <th className="p-1 text-right w-28">Credit</th>
            </tr>
          </thead>
          <tbody>
            {voucher.entries.map((e, i) => (
              <tr key={i} className="border-t border-[#3a5a8a]">
                <td className="p-1">{e.ledgerName}</td>
                <td className="p-1 text-right font-mono">{e.isDebit ? e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</td>
                <td className="p-1 text-right font-mono">{!e.isDebit ? e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#3a5a8a] my-3" />
        <div className="flex"><span className="w-32 text-[#aaa]">Narration:</span><span>{voucher.narration}</span></div>
      </div>
    </div>
  );
};

export default VoucherDetail;
