import React, { useState } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useTallyKeyboard } from '@/hooks/useTallyKeyboard';
import { useLedgers, useVouchers, useStockItems, useCompanies } from '@/hooks/useTallyData';
import { useApp } from '@/contexts/AppContext';

interface MenuItem {
  label: string;
  screen?: any;
  title?: string;
  isSeparator?: boolean;
  children?: MenuItem[];
}

const TallyGateway: React.FC = () => {
  const { pushScreen } = useTallyRouter();
  const { connection } = useApp();
  const { data: ledgers = [] } = useLedgers();
  const { data: vouchers = [] } = useVouchers();
  const { data: stockItems = [] } = useStockItems();
  const { data: companies = [] } = useCompanies();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems: MenuItem[] = [
    { label: 'Masters', screen: 'masters', title: 'Masters' },
    { label: 'Transactions (Vouchers)', screen: 'voucher-sales', title: 'Voucher Entry' },
    { label: 'Display', screen: 'display-menu', title: 'Display' },
    { label: 'Reports', screen: 'reports-menu', title: 'Reports' },
    { label: '', isSeparator: true },
    { label: 'Company Info. (Alt+F3)', screen: 'company-info', title: 'Company Info' },
    { label: 'Features (F11)', screen: 'features-f11', title: 'Features' },
    { label: 'Configuration (F12)', screen: 'config-f12', title: 'Configuration' },
    { label: '', isSeparator: true },
    { label: 'Quit (Ctrl+Q)' },
  ];

  const selectableItems = menuItems.filter(i => !i.isSeparator && i.label !== '');

  useTallyKeyboard({
    itemCount: selectableItems.length,
    selectedIndex,
    onIndexChange: setSelectedIndex,
    onSelect: (idx) => {
      const item = selectableItems[idx];
      if (item.screen) pushScreen(item.screen, {}, item.title);
    },
    onBack: () => {},
    fKeyHandlers: {
      'F4': () => pushScreen('voucher-contra', {}, 'Contra Voucher'),
      'F5': () => pushScreen('voucher-payment', {}, 'Payment Voucher'),
      'F6': () => pushScreen('voucher-receipt', {}, 'Receipt Voucher'),
      'F7': () => pushScreen('voucher-journal', {}, 'Journal Voucher'),
      'F8': () => pushScreen('voucher-sales', {}, 'Sales Voucher'),
      'F9': () => pushScreen('voucher-purchase', {}, 'Purchase Voucher'),
    },
  });

  const company = companies[0];

  return (
    <div className="flex h-full">
      {/* Left panel - Company info */}
      <div className="w-[280px] border-r border-[#4a6fa5] p-3 flex flex-col">
        <div className="text-center mb-4">
          <p className="text-base font-bold text-[#ffeb3b]">{company?.name || 'ABC Enterprises'}</p>
          <p className="text-[10px] text-[#aaa]">{company?.formalName || '(Demo Company)'}</p>
        </div>
        <div className="border-t border-[#3a5a8a] pt-3 text-xs space-y-1 text-[#ccc]">
          <p>Financial Year:</p>
          <p className="text-[#e0e0e0] ml-2">{company?.financialYearFrom || '01-Apr-2025'} to {company?.financialYearTo || '31-Mar-2026'}</p>
          <p className="mt-2">Books beginning from:</p>
          <p className="text-[#e0e0e0] ml-2">{company?.booksFrom || '01-Apr-2025'}</p>
        </div>
        <div className="border-t border-[#3a5a8a] mt-4 pt-3 text-xs space-y-1 text-[#888]">
          <p>Ledgers: <span className="text-[#e0e0e0]">{ledgers.length}</span></p>
          <p>Vouchers: <span className="text-[#e0e0e0]">{vouchers.length}</span></p>
          <p>Stock Items: <span className="text-[#e0e0e0]">{stockItems.length}</span></p>
        </div>
        <div className="mt-auto border-t border-[#3a5a8a] pt-3 text-xs">
          <p className={connection.isConnected ? 'text-green-400' : 'text-[#888]'}>
            {connection.isConnected ? '● Connected to Tally' : '○ Demo Mode (Offline)'}
          </p>
          <p className="text-[10px] text-[#666] mt-1">Ctrl+M: Switch to Easy Mode</p>
        </div>
      </div>

      {/* Right panel - Menu */}
      <div className="flex-1 p-4">
        <p className="text-center text-base font-bold text-[#ffeb3b] mb-6">Gateway of Tally</p>
        <div className="max-w-xs mx-auto">
          {menuItems.map((item, idx) => {
            if (item.isSeparator) {
              return <div key={idx} className="border-t border-[#3a5a8a] my-2" />;
            }
            const selectIdx = selectableItems.indexOf(item);
            const isSelected = selectIdx === selectedIndex;
            return (
              <div
                key={idx}
                className={`px-4 py-1.5 cursor-pointer text-sm ${
                  isSelected ? 'bg-[#4a6fa5] text-white font-bold' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'
                }`}
                onClick={() => {
                  const si = selectableItems.indexOf(item);
                  setSelectedIndex(si);
                  if (item.screen) pushScreen(item.screen, {}, item.title);
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TallyGateway;
