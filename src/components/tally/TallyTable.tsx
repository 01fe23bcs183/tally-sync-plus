import React, { useState, useCallback } from 'react';
import { useTallyKeyboard } from '@/hooks/useTallyKeyboard';

export interface TallyColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, row: any) => React.ReactNode;
}

interface TallyTableProps {
  columns: TallyColumn[];
  data: any[];
  onSelect?: (row: any, index: number) => void;
  onBack?: () => void;
  title?: string;
  showTotal?: { key: string; label?: string }[];
  keyboardEnabled?: boolean;
  fKeyHandlers?: Record<string, () => void>;
}

const TallyTable: React.FC<TallyTableProps> = ({
  columns, data, onSelect, onBack, title, showTotal, keyboardEnabled = true, fKeyHandlers,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useTallyKeyboard({
    itemCount: data.length,
    selectedIndex,
    onIndexChange: setSelectedIndex,
    onSelect: (idx) => onSelect?.(data[idx], idx),
    onBack: () => onBack?.(),
    fKeyHandlers,
    enabled: keyboardEnabled,
  });

  const getColStyle = (col: TallyColumn): React.CSSProperties => ({
    width: col.width,
    minWidth: col.width,
    textAlign: col.align || 'left',
  });

  const formatValue = (col: TallyColumn, row: any) => {
    const val = row[col.key];
    if (col.render) return col.render(val, row);
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }
    return val ?? '';
  };

  const totals = showTotal?.reduce((acc, t) => {
    acc[t.key] = data.reduce((sum, row) => sum + (Number(row[t.key]) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="text-center font-bold text-[#ffeb3b] py-1 text-sm">
          {title}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead className="sticky top-0">
            <tr className="bg-[#4a6fa5] text-white">
              {columns.map(col => (
                <th key={col.key} className="p-1 border-r border-[#5a7fb5] font-bold" style={getColStyle(col)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className={`border-t border-[#3a5a8a] cursor-pointer ${
                  idx === selectedIndex ? 'bg-[#4a6fa5] text-white font-bold' : 'hover:bg-[#2a4a7a]'
                }`}
                onClick={() => { setSelectedIndex(idx); onSelect?.(row, idx); }}
              >
                {columns.map(col => (
                  <td key={col.key} className="p-1 border-r border-[#3a5a8a]" style={getColStyle(col)}>
                    {formatValue(col, row)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-[#aaa]">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="border-t-2 border-[#ffeb3b] bg-[#4a6fa5] text-white font-bold">
                {columns.map((col, ci) => (
                  <td key={col.key} className="p-1 border-r border-[#5a7fb5]" style={getColStyle(col)}>
                    {ci === 0 && (showTotal?.[0]?.label || 'Total')}
                    {totals[col.key] !== undefined
                      ? totals[col.key].toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default TallyTable;
