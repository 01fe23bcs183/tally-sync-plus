import React, { useState } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useTallyKeyboard } from '@/hooks/useTallyKeyboard';

const ReportsMenu: React.FC = () => {
  const { pushScreen, popScreen } = useTallyRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { label: 'Day Book', screen: 'daybook' as const, title: 'Day Book' },
    { label: 'Cash/Bank Book', screen: 'cash-book' as const, title: 'Cash/Bank Book' },
    { label: 'Purchase Register', screen: 'purchase-register' as const, title: 'Purchase Register' },
    { label: 'Sales Register', screen: 'sales-register' as const, title: 'Sales Register' },
    { label: 'Journal Register', screen: 'journal-register' as const, title: 'Journal Register' },
    { label: 'Outstanding Receivables', screen: 'outstanding-receivables' as const, title: 'Outstanding Receivables' },
    { label: 'Outstanding Payables', screen: 'outstanding-payables' as const, title: 'Outstanding Payables' },
    { label: 'Group Summary', screen: 'group-summary' as const, title: 'Group Summary' },
    { label: 'Bank Reconciliation', screen: 'bank-reconciliation' as const, title: 'Bank Reconciliation' },
    { label: 'Interest Calculation', screen: 'interest-calculation' as const, title: 'Interest Calculation' },
    { label: 'Bill-wise Details', screen: 'bill-wise-details' as const, title: 'Bill-wise Details' },
    { label: '', isSeparator: true },
    { label: 'GST Reports (GSTR-1)', screen: 'gstr1' as const, title: 'GSTR-1' },
    { label: 'GST Reports (GSTR-3B)', screen: 'gstr3b' as const, title: 'GSTR-3B' },
    { label: 'TDS Reports', screen: 'tds-reports' as const, title: 'TDS Reports' },
    { label: 'TCS Reports', screen: 'tcs-reports' as const, title: 'TCS Reports' },
  ];

  const selectableItems = items.filter(i => !i.isSeparator);

  useTallyKeyboard({
    itemCount: selectableItems.length,
    selectedIndex,
    onIndexChange: setSelectedIndex,
    onSelect: (idx) => {
      const item = selectableItems[idx];
      if (item.screen) pushScreen(item.screen, {}, item.title);
    },
    onBack: popScreen,
  });

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">Reports</div>
      <div className="max-w-xs mx-auto">
        {items.map((item, idx) => {
          if (item.isSeparator) return <div key={idx} className="border-t border-[#3a5a8a] my-2" />;
          const si = selectableItems.indexOf(item);
          return (
            <div
              key={idx}
              className={`px-4 py-1.5 cursor-pointer text-sm ${
                si === selectedIndex ? 'bg-[#4a6fa5] text-white font-bold' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'
              }`}
              onClick={() => { setSelectedIndex(si); pushScreen(item.screen!, {}, item.title); }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsMenu;
