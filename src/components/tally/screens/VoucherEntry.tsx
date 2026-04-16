import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import { VoucherType } from '@/types/tally';

interface VoucherLine {
  ledgerName: string;
  amount: number;
  isDebit: boolean;
}

interface VoucherEntryProps {
  voucherType: VoucherType;
  defaultDebitGroup?: string;
  defaultCreditGroup?: string;
}

const VoucherEntry: React.FC<VoucherEntryProps> = ({ voucherType, defaultDebitGroup, defaultCreditGroup }) => {
  const { popScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();
  const [lines, setLines] = useState<VoucherLine[]>([
    { ledgerName: '', amount: 0, isDebit: true },
    { ledgerName: '', amount: 0, isDebit: false },
  ]);
  const [narration, setNarration] = useState('');
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [activeField, setActiveField] = useState<'ledger' | 'amount'>('ledger');
  const [showConfirm, setShowConfirm] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [autocompleteFilter, setAutocompleteFilter] = useState('');
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [focusNarration, setFocusNarration] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ledgerNames = ledgers.map(l => l.name);
  const filteredLedgers = ledgerNames.filter(n => n.toLowerCase().includes(autocompleteFilter.toLowerCase()));

  const totalDebit = lines.filter(l => l.isDebit).reduce((s, l) => s + l.amount, 0);
  const totalCredit = lines.filter(l => !l.isDebit).reduce((s, l) => s + l.amount, 0);

  useEffect(() => { inputRef.current?.focus(); }, [activeLineIdx, activeField, focusNarration]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (showConfirm) { setShowConfirm(false); return; }
      if (autocompleteOpen) { setAutocompleteOpen(false); return; }
      popScreen();
      return;
    }

    if (showConfirm) {
      if (e.key === 'y' || e.key === 'Y' || (e.ctrlKey && e.key === 'a')) {
        e.preventDefault();
        console.log('Submit voucher:', { voucherType, lines, narration });
        popScreen();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowConfirm(false);
      }
      return;
    }

    if (autocompleteOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAutocompleteIndex(i => Math.min(i + 1, filteredLedgers.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setAutocompleteIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredLedgers[autocompleteIndex]) {
          const newLines = [...lines];
          newLines[activeLineIdx].ledgerName = filteredLedgers[autocompleteIndex];
          setLines(newLines);
        }
        setAutocompleteOpen(false);
        setActiveField('amount');
        return;
      }
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (focusNarration) {
        setShowConfirm(true);
        setFocusNarration(false);
        return;
      }
      if (activeField === 'ledger') {
        setActiveField('amount');
      } else {
        // Move to next line or narration
        if (activeLineIdx < lines.length - 1) {
          setActiveLineIdx(activeLineIdx + 1);
          setActiveField('ledger');
        } else {
          // Add new line if amounts don't balance
          if (totalDebit !== totalCredit) {
            const isDebit = totalDebit < totalCredit;
            setLines([...lines, { ledgerName: '', amount: Math.abs(totalDebit - totalCredit), isDebit }]);
            setActiveLineIdx(lines.length);
            setActiveField('ledger');
          } else {
            setFocusNarration(true);
          }
        }
      }
    }

    // Ctrl+A to accept
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      setShowConfirm(true);
    }
  }, [showConfirm, autocompleteOpen, activeField, activeLineIdx, lines, narration, filteredLedgers, autocompleteIndex, totalDebit, totalCredit, focusNarration, popScreen, voucherType]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const fmt = (n: number) => n > 0 ? n.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';

  return (
    <div className="flex flex-col h-full">
      <div className="text-center font-bold text-[#ffeb3b] py-1 text-sm border-b border-[#4a6fa5]">
        {voucherType} Voucher
      </div>
      <div className="text-xs px-3 py-1 text-[#aaa] flex justify-between border-b border-[#3a5a8a]">
        <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
        <span>No: (Auto)</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0">
            <tr className="bg-[#4a6fa5] text-white">
              <th className="p-1 text-left w-8">#</th>
              <th className="p-1 text-left">Particulars</th>
              <th className="p-1 text-center w-12">Dr/Cr</th>
              <th className="p-1 text-right w-36">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={`border-t border-[#3a5a8a] ${idx === activeLineIdx ? 'bg-[#2a4a7a]' : ''}`}>
                <td className="p-1 text-[#888]">{idx + 1}</td>
                <td className="p-1 relative">
                  {idx === activeLineIdx && activeField === 'ledger' ? (
                    <div className="relative">
                      <input
                        ref={inputRef}
                        className="w-full bg-transparent border-b border-[#4a6fa5] text-[#e0e0e0] outline-none"
                        value={line.ledgerName}
                        onChange={e => {
                          const newLines = [...lines];
                          newLines[idx].ledgerName = e.target.value;
                          setLines(newLines);
                          setAutocompleteFilter(e.target.value);
                          setAutocompleteOpen(true);
                          setAutocompleteIndex(0);
                        }}
                        onFocus={() => { setAutocompleteOpen(true); setAutocompleteFilter(line.ledgerName); }}
                        placeholder="Type ledger name..."
                      />
                      {autocompleteOpen && filteredLedgers.length > 0 && (
                        <div className="absolute z-50 top-full left-0 w-64 max-h-32 overflow-auto bg-[#0d2340] border border-[#4a6fa5]">
                          {filteredLedgers.map((name, oi) => (
                            <div
                              key={name}
                              className={`px-2 py-0.5 cursor-pointer ${oi === autocompleteIndex ? 'bg-[#4a6fa5] text-white' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'}`}
                              onClick={() => {
                                const newLines = [...lines];
                                newLines[idx].ledgerName = name;
                                setLines(newLines);
                                setAutocompleteOpen(false);
                                setActiveField('amount');
                              }}
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="cursor-pointer" onClick={() => { setActiveLineIdx(idx); setActiveField('ledger'); }}>
                      {line.ledgerName || <span className="text-[#666]">—</span>}
                    </span>
                  )}
                </td>
                <td className="p-1 text-center">
                  <span
                    className="cursor-pointer text-[#ffeb3b]"
                    onClick={() => {
                      const newLines = [...lines];
                      newLines[idx].isDebit = !newLines[idx].isDebit;
                      setLines(newLines);
                    }}
                  >
                    {line.isDebit ? 'Dr' : 'Cr'}
                  </span>
                </td>
                <td className="p-1 text-right">
                  {idx === activeLineIdx && activeField === 'amount' ? (
                    <input
                      ref={inputRef}
                      type="number"
                      className="w-full bg-transparent border-b border-[#4a6fa5] text-[#e0e0e0] outline-none text-right"
                      value={line.amount || ''}
                      onChange={e => {
                        const newLines = [...lines];
                        newLines[idx].amount = parseFloat(e.target.value) || 0;
                        setLines(newLines);
                      }}
                    />
                  ) : (
                    <span className="cursor-pointer" onClick={() => { setActiveLineIdx(idx); setActiveField('amount'); }}>
                      {fmt(line.amount)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t-2 border-[#ffeb3b] px-3 py-1 text-xs flex justify-between bg-[#4a6fa5]">
        <span>Total Debit: <span className="font-mono">{fmt(totalDebit)}</span></span>
        <span>Total Credit: <span className="font-mono">{fmt(totalCredit)}</span></span>
        <span className={totalDebit === totalCredit ? 'text-green-300' : 'text-red-300'}>
          {totalDebit === totalCredit ? '✓ Balanced' : `Diff: ${fmt(Math.abs(totalDebit - totalCredit))}`}
        </span>
      </div>

      {/* Narration */}
      <div className={`border-t border-[#3a5a8a] px-3 py-1 text-xs ${focusNarration ? 'bg-[#2a4a7a]' : ''}`}>
        <span className="text-[#aaa]">Narration: </span>
        <input
          ref={focusNarration ? inputRef : undefined}
          className="bg-transparent border-none text-[#e0e0e0] outline-none w-[80%]"
          value={narration}
          onChange={e => setNarration(e.target.value)}
          onFocus={() => setFocusNarration(true)}
          placeholder="Enter narration..."
        />
      </div>

      {showConfirm && (
        <div className="border-t border-[#4a6fa5] p-2 text-center text-xs bg-[#0d2340]">
          <span className="text-[#ffeb3b]">Accept? Yes or No</span>
          <span className="text-[#aaa] ml-4">(Y/Ctrl+A to accept, N/Esc to edit)</span>
        </div>
      )}
    </div>
  );
};

export default VoucherEntry;
