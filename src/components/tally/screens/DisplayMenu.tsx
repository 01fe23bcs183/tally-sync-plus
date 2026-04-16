import React, { useState } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useTallyKeyboard } from '@/hooks/useTallyKeyboard';

const DisplayMenu: React.FC = () => {
  const { pushScreen, popScreen } = useTallyRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { label: 'Trial Balance', screen: 'trial-balance' as const, title: 'Trial Balance' },
    { label: 'Balance Sheet', screen: 'balance-sheet' as const, title: 'Balance Sheet' },
    { label: 'Profit & Loss A/c', screen: 'profit-loss' as const, title: 'Profit & Loss A/c' },
    { label: 'Stock Summary', screen: 'stock-summary' as const, title: 'Stock Summary' },
    { label: 'Ratio Analysis', screen: 'ratio-analysis' as const, title: 'Ratio Analysis' },
    { label: 'Cash Flow', screen: 'cash-flow' as const, title: 'Cash Flow' },
    { label: 'Fund Flow', screen: 'fund-flow' as const, title: 'Fund Flow' },
  ];

  useTallyKeyboard({
    itemCount: items.length,
    selectedIndex,
    onIndexChange: setSelectedIndex,
    onSelect: (idx) => {
      const item = items[idx];
      if (item.screen) pushScreen(item.screen, {}, item.title);
    },
    onBack: popScreen,
  });

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">Display</div>
      <div className="max-w-xs mx-auto">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`px-4 py-1.5 cursor-pointer text-sm ${
              idx === selectedIndex ? 'bg-[#4a6fa5] text-white font-bold' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'
            }`}
            onClick={() => { setSelectedIndex(idx); pushScreen(item.screen, {}, item.title); }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayMenu;
