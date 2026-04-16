import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';

const RatioAnalysis: React.FC = () => {
  const { popScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); popScreen(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [popScreen]);

  const totalAssets = ledgers
    .filter(l => ['Cash-in-Hand', 'Bank Accounts', 'Sundry Debtors'].includes(l.parent))
    .reduce((s, l) => s + Math.abs(l.closingBalance), 0);
  const totalLiabilities = ledgers
    .filter(l => ['Sundry Creditors'].includes(l.parent))
    .reduce((s, l) => s + Math.abs(l.closingBalance), 0);
  const totalIncome = Math.abs(ledgers.filter(l => l.parent === 'Sales Accounts').reduce((s, l) => s + l.closingBalance, 0));
  const totalExpenses = ledgers.filter(l => ['Purchase Accounts', 'Indirect Expenses'].includes(l.parent)).reduce((s, l) => s + l.closingBalance, 0);
  const netProfit = totalIncome - totalExpenses;

  const ratios = [
    { name: 'Current Ratio', value: totalLiabilities > 0 ? (totalAssets / totalLiabilities).toFixed(2) : 'N/A' },
    { name: 'Net Profit Ratio', value: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) + '%' : 'N/A' },
    { name: 'Gross Profit Ratio', value: totalIncome > 0 ? (((totalIncome - ledgers.filter(l => l.parent === 'Purchase Accounts').reduce((s, l) => s + l.closingBalance, 0)) / totalIncome) * 100).toFixed(2) + '%' : 'N/A' },
    { name: 'Operating Ratio', value: totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(2) + '%' : 'N/A' },
    { name: 'Return on Capital', value: 'N/A' },
  ];

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">Ratio Analysis</div>
      <div className="max-w-md mx-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-[#4a6fa5] text-white">
              <th className="p-2 text-left">Ratio</th>
              <th className="p-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {ratios.map(r => (
              <tr key={r.name} className="border-t border-[#3a5a8a]">
                <td className="p-2">{r.name}</td>
                <td className="p-2 text-right text-[#ffeb3b]">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RatioAnalysis;
