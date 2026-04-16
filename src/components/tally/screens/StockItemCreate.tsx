import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useStockItems } from '@/hooks/useTallyData';
import TallyForm from '../TallyForm';

const StockItemCreate: React.FC = () => {
  const { popScreen } = useTallyRouter();
  const { data: stockItems = [] } = useStockItems();
  const groups = [...new Set(stockItems.map(s => s.parent))];
  const units = [...new Set(stockItems.map(s => s.unit))];

  return (
    <TallyForm
      title="Stock Item Creation"
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'parent', label: 'Under', type: 'autocomplete', options: groups, required: true },
        { key: 'unit', label: 'Units', type: 'autocomplete', options: units, required: true },
        { key: 'openingBalance', label: 'Opening Balance (Qty)', type: 'number', defaultValue: 0 },
        { key: 'openingRate', label: 'Rate per Unit', type: 'number', defaultValue: 0 },
        { key: 'openingValue', label: 'Opening Value', type: 'number', defaultValue: 0 },
      ]}
      onSubmit={(values) => {
        console.log('Create stock item:', values);
        popScreen();
      }}
      onCancel={popScreen}
    />
  );
};

export default StockItemCreate;
