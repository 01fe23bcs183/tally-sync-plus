import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useStockItems } from '@/hooks/useTallyData';
import TallyTable from '../TallyTable';

const StockSummary: React.FC = () => {
  const { popScreen, pushScreen } = useTallyRouter();
  const { data: stockItems = [] } = useStockItems();

  const fmt = (v: number) => v.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <TallyTable
      title="Stock Summary"
      columns={[
        { key: 'name', header: 'Name of Item' },
        { key: 'unit', header: 'Unit', width: '60px' },
        { key: 'closingBalance', header: 'Quantity', width: '80px', align: 'right' },
        { key: 'closingRate', header: 'Rate', width: '100px', align: 'right', render: fmt },
        { key: 'closingValue', header: 'Value', width: '120px', align: 'right', render: fmt },
      ]}
      data={stockItems}
      showTotal={[{ key: 'closingValue', label: 'Total' }]}
      onSelect={(row) => pushScreen('stock-item-report', { itemName: row.name }, row.name)}
      onBack={popScreen}
    />
  );
};

export default StockSummary;
