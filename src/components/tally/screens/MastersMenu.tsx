import React, { useState } from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useTallyKeyboard } from '@/hooks/useTallyKeyboard';

const MastersMenu: React.FC = () => {
  const { pushScreen, popScreen } = useTallyRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { label: 'Accounts Info.', children: [
      { label: 'Ledgers', children: [
        { label: 'Create', screen: 'ledger-create' as const, title: 'Ledger Creation' },
        { label: 'Alter', screen: 'ledger-alter' as const, title: 'Alter Ledger' },
        { label: 'Display', screen: 'ledger-display' as const, title: 'Display Ledger' },
      ]},
      { label: 'Groups', children: [
        { label: 'Create', screen: 'group-create' as const, title: 'Group Creation' },
        { label: 'Alter', screen: 'group-alter' as const, title: 'Alter Group' },
        { label: 'Display', screen: 'group-display' as const, title: 'Display Group' },
      ]},
    ]},
    { label: 'Inventory Info.', children: [
      { label: 'Stock Items', children: [
        { label: 'Create', screen: 'stock-item-create' as const, title: 'Stock Item Creation' },
        { label: 'Alter', screen: 'stock-item-alter' as const, title: 'Alter Stock Item' },
        { label: 'Display', screen: 'stock-item-display' as const, title: 'Display Stock Item' },
      ]},
      { label: 'Stock Groups', children: [
        { label: 'Create', screen: 'stock-group-create' as const, title: 'Stock Group Creation' },
        { label: 'Alter', screen: 'stock-group-alter' as const, title: 'Alter Stock Group' },
      ]},
      { label: 'Units of Measure', children: [
        { label: 'Create', screen: 'unit-create' as const, title: 'Unit Creation' },
        { label: 'Alter', screen: 'unit-alter' as const, title: 'Alter Unit' },
      ]},
      { label: 'Godowns', children: [
        { label: 'Create', screen: 'godown-create' as const, title: 'Godown Creation' },
        { label: 'Alter', screen: 'godown-alter' as const, title: 'Alter Godown' },
        { label: 'Display', screen: 'godown-display' as const, title: 'Display Godown' },
      ]},
    ]},
    { label: 'Cost Centres', children: [
      { label: 'Create', screen: 'cost-centre-create' as const, title: 'Cost Centre Creation' },
      { label: 'Alter', screen: 'cost-centre-alter' as const, title: 'Alter Cost Centre' },
      { label: 'Display', screen: 'cost-centre-display' as const, title: 'Display Cost Centre' },
    ]},
    { label: 'Voucher Types', screen: 'voucher-type-alter' as const, title: 'Voucher Types' },
  ];

  // Flatten for menu display
  const [expandedPath, setExpandedPath] = useState<number[]>([]);
  
  // Simple flat menu approach
  type FlatItem = { label: string; indent: number; screen?: any; title?: string; hasChildren?: boolean; path: number[] };
  
  const flattenItems = (items: any[], indent = 0, path: number[] = []): FlatItem[] => {
    const result: FlatItem[] = [];
    items.forEach((item: any, i: number) => {
      const currentPath = [...path, i];
      const isExpanded = expandedPath.length >= currentPath.length && 
        currentPath.every((v, idx) => expandedPath[idx] === v);
      
      result.push({
        label: item.label,
        indent,
        screen: item.screen,
        title: item.title,
        hasChildren: !!item.children,
        path: currentPath,
      });
      
      if (item.children && isExpanded) {
        result.push(...flattenItems(item.children, indent + 1, currentPath));
      }
    });
    return result;
  };

  const flatItems = flattenItems(items);

  useTallyKeyboard({
    itemCount: flatItems.length,
    selectedIndex,
    onIndexChange: setSelectedIndex,
    onSelect: (idx) => {
      const item = flatItems[idx];
      if (item.hasChildren) {
        setExpandedPath(item.path);
      } else if (item.screen) {
        pushScreen(item.screen, {}, item.title);
      }
    },
    onBack: popScreen,
  });

  return (
    <div className="p-4">
      <div className="text-center font-bold text-[#ffeb3b] mb-4 text-sm">Masters</div>
      <div className="max-w-sm mx-auto">
        {flatItems.map((item, idx) => (
          <div
            key={idx}
            className={`py-1 cursor-pointer text-xs ${
              idx === selectedIndex ? 'bg-[#4a6fa5] text-white font-bold' : 'text-[#e0e0e0] hover:bg-[#2a4a7a]'
            }`}
            style={{ paddingLeft: `${(item.indent * 20) + 16}px` }}
            onClick={() => {
              setSelectedIndex(idx);
              if (item.hasChildren) setExpandedPath(item.path);
              else if (item.screen) pushScreen(item.screen, {}, item.title);
            }}
          >
            {item.hasChildren ? (expandedPath.length >= item.path.length && item.path.every((v, i) => expandedPath[i] === v) ? '▼ ' : '► ') : '  '}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MastersMenu;
