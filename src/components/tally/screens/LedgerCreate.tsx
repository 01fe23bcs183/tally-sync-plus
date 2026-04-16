import React from 'react';
import { useTallyRouter } from '../TallyScreenRouter';
import { useLedgers } from '@/hooks/useTallyData';
import TallyForm from '../TallyForm';

const LedgerCreate: React.FC = () => {
  const { popScreen } = useTallyRouter();
  const { data: ledgers = [] } = useLedgers();

  const groups = [...new Set(ledgers.map(l => l.parent))];

  return (
    <TallyForm
      title="Ledger Creation"
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'parent', label: 'Under', type: 'autocomplete', options: groups, required: true },
        { key: 'openingBalance', label: 'Opening Balance', type: 'number', defaultValue: 0 },
        { key: 'address', label: 'Mailing Name', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'email', label: 'E-Mail', type: 'text' },
        { key: 'gstNumber', label: 'GSTIN/UIN', type: 'text' },
        { key: 'panNumber', label: 'PAN/IT No.', type: 'text' },
      ]}
      onSubmit={(values) => {
        console.log('Create ledger:', values);
        popScreen();
      }}
      onCancel={popScreen}
    />
  );
};

export default LedgerCreate;
