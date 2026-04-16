import React from 'react';
import { useTallyRouter } from './TallyScreenRouter';

interface TallyTopBarProps {
  companyName?: string;
  currentDate?: string;
  period?: string;
}

const TallyTopBar: React.FC<TallyTopBarProps> = ({
  companyName = 'ABC Enterprises',
  currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  period = '1-Apr-2025 to 31-Mar-2026',
}) => {
  const { breadcrumb, currentScreen } = useTallyRouter();

  return (
    <div className="shrink-0" style={{ backgroundColor: '#0d2340' }}>
      <div className="flex justify-between items-center px-3 py-1 text-xs">
        <span className="text-[#ffeb3b] font-bold">{companyName}</span>
        <div className="flex gap-6 text-[#aaa]">
          <span>Current Date: {currentDate}</span>
          <span>{period}</span>
        </div>
      </div>
      {breadcrumb.length > 1 && (
        <div className="px-3 pb-1 text-[10px] text-[#888]">
          {breadcrumb.join(' > ')}
        </div>
      )}
    </div>
  );
};

export default TallyTopBar;
