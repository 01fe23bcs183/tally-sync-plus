import { useState, useEffect, useCallback, useRef } from 'react';
import { useVouchers, useLedgers, useStockItems } from '@/hooks/useTallyData';
import { useApp } from '@/contexts/AppContext';

type TallyScreen = 'gateway' | 'daybook' | 'ledgers' | 'trialbalance' | 'balancesheet' | 'profitloss' | 'stocksummary' | 'voucher-sales' | 'voucher-purchase' | 'voucher-receipt' | 'voucher-payment' | 'voucher-journal' | 'voucher-contra';

const TallyMode = () => {
  const [screen, setScreen] = useState<TallyScreen>('gateway');
  const [menuIndex, setMenuIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { connection } = useApp();
  const { data: vouchers = [] } = useVouchers();
  const { data: ledgers = [] } = useLedgers();
  const { data: stockItems = [] } = useStockItems();

  const gatewayItems = [
    { label: 'Day Book', key: 'daybook' as TallyScreen, shortcut: 'D' },
    { label: 'List of Ledgers', key: 'ledgers' as TallyScreen, shortcut: 'L' },
    { label: 'Trial Balance', key: 'trialbalance' as TallyScreen, shortcut: 'T' },
    { label: 'Balance Sheet', key: 'balancesheet' as TallyScreen, shortcut: 'B' },
    { label: 'Profit & Loss A/c', key: 'profitloss' as TallyScreen, shortcut: 'P' },
    { label: 'Stock Summary', key: 'stocksummary' as TallyScreen, shortcut: 'S' },
    { label: '── Voucher Entry ──', key: 'gateway' as TallyScreen, shortcut: '' },
    { label: 'Sales Voucher (Alt+F5)', key: 'voucher-sales' as TallyScreen, shortcut: 'F5' },
    { label: 'Purchase Voucher (Alt+F9)', key: 'voucher-purchase' as TallyScreen, shortcut: 'F9' },
    { label: 'Receipt Voucher (F6)', key: 'voucher-receipt' as TallyScreen, shortcut: 'F6' },
    { label: 'Payment Voucher (F5)', key: 'voucher-payment' as TallyScreen, shortcut: 'F5' },
    { label: 'Journal Voucher (F7)', key: 'voucher-journal' as TallyScreen, shortcut: 'F7' },
    { label: 'Contra Voucher (F4)', key: 'voucher-contra' as TallyScreen, shortcut: 'F4' },
  ];

  const selectableItems = gatewayItems.filter(i => i.shortcut !== '');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (screen === 'gateway') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuIndex(i => (i + 1) % selectableItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuIndex(i => (i - 1 + selectableItems.length) % selectableItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = selectableItems[menuIndex];
        if (item) setScreen(item.key);
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setScreen('gateway');
      setMenuIndex(0);
    }
  }, [screen, menuIndex, selectableItems]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const formatCurrency = (n: number) => {
    const abs = Math.abs(n);
    return `${abs.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${n < 0 ? 'Cr' : 'Dr'}`;
  };

  const renderScreen = () => {
    switch (screen) {
      case 'gateway':
        return (
          <div className="flex h-full">
            {/* Left panel - Company info */}
            <div className="w-1/3 border-r border-[#4a6fa5] p-4">
              <div className="text-center mb-6">
                <p className="text-lg font-bold text-[#ffeb3b]">ABC Enterprises</p>
                <p className="text-xs">(Demo Company)</p>
                <p className="text-xs mt-2">1-Apr-2025 to 31-Mar-2026</p>
              </div>
              <div className="border-t border-[#4a6fa5] pt-4 text-xs space-y-1">
                <p>Current Date: 15-Apr-2026</p>
                <p>Ledgers: {ledgers.length}</p>
                <p>Vouchers: {vouchers.length}</p>
                <p>Stock Items: {stockItems.length}</p>
                <p className="mt-4">{connection.isConnected ? '● Connected to Tally' : '○ Demo Mode (Offline)'}</p>
              </div>
            </div>
            {/* Right panel - Menu */}
            <div className="flex-1 p-4">
              <p className="text-center text-lg font-bold text-[#ffeb3b] mb-4">Gateway of Tally</p>
              <div className="space-y-0.5">
                {gatewayItems.map((item, idx) => {
                  if (item.shortcut === '') {
                    return <p key={idx} className="text-[#aaa] text-sm py-1 text-center">{item.label}</p>;
                  }
                  const selectIdx = selectableItems.indexOf(item);
                  const isSelected = selectIdx === menuIndex;
                  return (
                    <div
                      key={idx}
                      className={`px-4 py-1 cursor-pointer text-sm ${isSelected ? 'bg-[#4a6fa5] text-white font-bold' : 'hover:bg-[#3a5a8a]'}`}
                      onClick={() => { setMenuIndex(selectIdx); setScreen(item.key); }}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'daybook':
        return (
          <div className="p-2">
            <div className="text-center font-bold text-[#ffeb3b] mb-2">Day Book</div>
            <div className="border border-[#4a6fa5]">
              <div className="grid grid-cols-[80px_80px_80px_1fr_120px] bg-[#4a6fa5] text-white text-xs font-bold">
                <div className="p-1 border-r border-[#5a7fb5]">Date</div>
                <div className="p-1 border-r border-[#5a7fb5]">Type</div>
                <div className="p-1 border-r border-[#5a7fb5]">Vch No.</div>
                <div className="p-1 border-r border-[#5a7fb5]">Particulars</div>
                <div className="p-1 text-right">Amount</div>
              </div>
              {vouchers.map(v => (
                <div key={v.id} className="grid grid-cols-[80px_80px_80px_1fr_120px] text-xs border-t border-[#3a5a8a] hover:bg-[#3a5a8a]">
                  <div className="p-1 border-r border-[#3a5a8a]">{v.date}</div>
                  <div className="p-1 border-r border-[#3a5a8a]">{v.voucherType}</div>
                  <div className="p-1 border-r border-[#3a5a8a]">{v.voucherNumber}</div>
                  <div className="p-1 border-r border-[#3a5a8a]">{v.partyName || v.narration}</div>
                  <div className="p-1 text-right font-mono">{formatCurrency(v.totalAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ledgers':
        return (
          <div className="p-2">
            <div className="text-center font-bold text-[#ffeb3b] mb-2">List of Ledgers</div>
            <div className="border border-[#4a6fa5]">
              <div className="grid grid-cols-[1fr_150px_150px_150px] bg-[#4a6fa5] text-white text-xs font-bold">
                <div className="p-1 border-r border-[#5a7fb5]">Particulars</div>
                <div className="p-1 border-r border-[#5a7fb5]">Under</div>
                <div className="p-1 border-r border-[#5a7fb5] text-right">Opening Bal</div>
                <div className="p-1 text-right">Closing Bal</div>
              </div>
              {ledgers.map(l => (
                <div key={l.name} className="grid grid-cols-[1fr_150px_150px_150px] text-xs border-t border-[#3a5a8a] hover:bg-[#3a5a8a]">
                  <div className="p-1 border-r border-[#3a5a8a]">{l.name}</div>
                  <div className="p-1 border-r border-[#3a5a8a] text-muted-foreground">{l.parent}</div>
                  <div className="p-1 border-r border-[#3a5a8a] text-right font-mono">{formatCurrency(l.openingBalance)}</div>
                  <div className="p-1 text-right font-mono">{formatCurrency(l.closingBalance)}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'trialbalance':
        const debitLedgers = ledgers.filter(l => l.closingBalance > 0);
        const creditLedgers = ledgers.filter(l => l.closingBalance < 0);
        const totalDebit = debitLedgers.reduce((s, l) => s + l.closingBalance, 0);
        const totalCredit = Math.abs(creditLedgers.reduce((s, l) => s + l.closingBalance, 0));
        return (
          <div className="p-2">
            <div className="text-center font-bold text-[#ffeb3b] mb-2">Trial Balance</div>
            <div className="border border-[#4a6fa5]">
              <div className="grid grid-cols-[1fr_150px_150px] bg-[#4a6fa5] text-white text-xs font-bold">
                <div className="p-1 border-r border-[#5a7fb5]">Particulars</div>
                <div className="p-1 border-r border-[#5a7fb5] text-right">Debit</div>
                <div className="p-1 text-right">Credit</div>
              </div>
              {ledgers.filter(l => l.closingBalance !== 0).map(l => (
                <div key={l.name} className="grid grid-cols-[1fr_150px_150px] text-xs border-t border-[#3a5a8a] hover:bg-[#3a5a8a]">
                  <div className="p-1 border-r border-[#3a5a8a]">{l.name}</div>
                  <div className="p-1 border-r border-[#3a5a8a] text-right font-mono">{l.closingBalance > 0 ? l.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</div>
                  <div className="p-1 text-right font-mono">{l.closingBalance < 0 ? Math.abs(l.closingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}</div>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_150px_150px] text-xs border-t-2 border-[#ffeb3b] font-bold bg-[#4a6fa5]">
                <div className="p-1 border-r border-[#5a7fb5]">Total</div>
                <div className="p-1 border-r border-[#5a7fb5] text-right font-mono">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className="p-1 text-right font-mono">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        );

      case 'stocksummary':
        return (
          <div className="p-2">
            <div className="text-center font-bold text-[#ffeb3b] mb-2">Stock Summary</div>
            <div className="border border-[#4a6fa5]">
              <div className="grid grid-cols-[1fr_80px_80px_100px_100px] bg-[#4a6fa5] text-white text-xs font-bold">
                <div className="p-1 border-r border-[#5a7fb5]">Name of Item</div>
                <div className="p-1 border-r border-[#5a7fb5]">Unit</div>
                <div className="p-1 border-r border-[#5a7fb5] text-right">Quantity</div>
                <div className="p-1 border-r border-[#5a7fb5] text-right">Rate</div>
                <div className="p-1 text-right">Value</div>
              </div>
              {stockItems.map(item => (
                <div key={item.name} className="grid grid-cols-[1fr_80px_80px_100px_100px] text-xs border-t border-[#3a5a8a] hover:bg-[#3a5a8a]">
                  <div className="p-1 border-r border-[#3a5a8a]">{item.name}</div>
                  <div className="p-1 border-r border-[#3a5a8a]">{item.unit}</div>
                  <div className="p-1 border-r border-[#3a5a8a] text-right font-mono">{item.closingBalance}</div>
                  <div className="p-1 border-r border-[#3a5a8a] text-right font-mono">{item.closingRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="p-1 text-right font-mono">{item.closingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-[#ffeb3b]">
            <div className="text-center">
              <p className="text-lg font-bold">{screen.replace('voucher-', '').toUpperCase()} Voucher Entry</p>
              <p className="text-sm mt-2">Press Esc to go back to Gateway</p>
              <p className="text-xs mt-4 text-[#aaa]">Full voucher entry form coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="h-full font-mono text-sm text-[#e0e0e0] outline-none overflow-auto"
      style={{ backgroundColor: '#1a3a5c' }}
    >
      {/* Top bar */}
      <div className="flex justify-between items-center px-2 py-1 text-xs" style={{ backgroundColor: '#0d2340' }}>
        <span className="text-[#ffeb3b] font-bold">TallySync - Tally Mode</span>
        <div className="flex gap-4">
          {screen !== 'gateway' && <span className="text-[#aaa]">Esc: Back</span>}
          <span className="text-[#aaa]">↑↓: Navigate</span>
          <span className="text-[#aaa]">Enter: Select</span>
          <span className="text-[#aaa]">Ctrl+M: Easy Mode</span>
        </div>
      </div>

      {/* Bottom function key bar */}
      <div className="flex-1 overflow-auto" style={{ height: 'calc(100% - 48px)' }}>
        {renderScreen()}
      </div>

      {/* Function keys */}
      <div className="flex text-xs" style={{ backgroundColor: '#0d2340' }}>
        {['F1:Help', 'F2:Date', 'F3:CmpInfo', 'F4:Contra', 'F5:Payment', 'F6:Receipt', 'F7:Journal', 'F8:Credit', 'F9:Purchase', 'F10:Rev'].map(key => (
          <div key={key} className="flex-1 text-center py-1 border-r border-[#1a3a5c] hover:bg-[#1a3a5c] cursor-pointer text-[#aaa]">
            {key}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TallyMode;
