import React from 'react';

export interface FKeyDef {
  key: string;   // e.g. 'F1', 'F2'
  label: string; // e.g. 'Help', 'Date'
  action?: () => void;
}

const defaultKeys: FKeyDef[] = [
  { key: 'F1', label: 'Help' },
  { key: 'F2', label: 'Date' },
  { key: 'F3', label: 'Cmp Info' },
  { key: 'F4', label: 'Contra' },
  { key: 'F5', label: 'Payment' },
  { key: 'F6', label: 'Receipt' },
  { key: 'F7', label: 'Journal' },
  { key: 'F8', label: 'Sales' },
  { key: 'F9', label: 'Purchase' },
  { key: 'F10', label: 'Memo' },
];

interface TallyFKeyBarProps {
  keys?: FKeyDef[];
}

const TallyFKeyBar: React.FC<TallyFKeyBarProps> = ({ keys = defaultKeys }) => (
  <div className="flex text-xs shrink-0" style={{ backgroundColor: '#0d2340' }}>
    {keys.map(k => (
      <div
        key={k.key}
        className="flex-1 text-center py-1 border-r border-[#1a3a5c] hover:bg-[#1a3a5c] cursor-pointer text-[#aaa]"
        onClick={k.action}
      >
        <span className="text-[#ffeb3b]">{k.key}</span>:{k.label}
      </div>
    ))}
  </div>
);

export default TallyFKeyBar;
