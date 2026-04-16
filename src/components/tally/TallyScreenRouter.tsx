import { useState, useCallback, createContext, useContext } from 'react';

export type TallyScreenId =
  | 'gateway'
  // Masters
  | 'masters' | 'accounts-info' | 'inventory-info'
  | 'ledger-create' | 'ledger-alter' | 'ledger-display'
  | 'group-create' | 'group-alter' | 'group-display'
  | 'stock-item-create' | 'stock-item-alter' | 'stock-item-display'
  | 'stock-group-create' | 'stock-group-alter' | 'stock-group-display'
  | 'unit-create' | 'unit-alter'
  | 'godown-create' | 'godown-alter' | 'godown-display'
  | 'cost-centre-create' | 'cost-centre-alter' | 'cost-centre-display'
  | 'voucher-type-alter'
  // Voucher Entry
  | 'voucher-sales' | 'voucher-purchase' | 'voucher-payment'
  | 'voucher-receipt' | 'voucher-journal' | 'voucher-contra'
  | 'voucher-debit-note' | 'voucher-credit-note'
  // Reports
  | 'display-menu' | 'reports-menu'
  | 'daybook' | 'cash-book' | 'bank-book'
  | 'purchase-register' | 'sales-register' | 'journal-register'
  | 'ledger-vouchers' | 'voucher-detail'
  | 'trial-balance' | 'balance-sheet' | 'profit-loss'
  | 'outstanding-receivables' | 'outstanding-payables'
  | 'group-summary' | 'group-vouchers'
  | 'stock-summary' | 'stock-item-report'
  | 'godown-summary' | 'stock-category-summary' | 'movement-analysis'
  | 'gstr1' | 'gstr3b' | 'tds-reports' | 'tcs-reports'
  | 'gst-payment' | 'statutory-ledger'
  | 'cash-flow' | 'fund-flow' | 'ratio-analysis'
  | 'bank-reconciliation' | 'interest-calculation'
  | 'bill-wise-details' | 'company-info' | 'features-f11' | 'config-f12';

export interface ScreenStackEntry {
  screen: TallyScreenId;
  params?: Record<string, any>;
  title?: string;
}

interface TallyRouterContextType {
  currentScreen: TallyScreenId;
  screenStack: ScreenStackEntry[];
  params: Record<string, any>;
  pushScreen: (screen: TallyScreenId, params?: Record<string, any>, title?: string) => void;
  popScreen: () => void;
  resetToGateway: () => void;
  breadcrumb: string[];
}

const TallyRouterContext = createContext<TallyRouterContextType | undefined>(undefined);

export const useTallyRouter = () => {
  const ctx = useContext(TallyRouterContext);
  if (!ctx) throw new Error('useTallyRouter must be used within TallyRouterProvider');
  return ctx;
};

export const TallyRouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenStack, setScreenStack] = useState<ScreenStackEntry[]>([
    { screen: 'gateway', title: 'Gateway of Tally' }
  ]);

  const currentEntry = screenStack[screenStack.length - 1];
  const currentScreen = currentEntry.screen;
  const params = currentEntry.params || {};

  const pushScreen = useCallback((screen: TallyScreenId, params?: Record<string, any>, title?: string) => {
    setScreenStack(prev => [...prev, { screen, params, title }]);
  }, []);

  const popScreen = useCallback(() => {
    setScreenStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const resetToGateway = useCallback(() => {
    setScreenStack([{ screen: 'gateway', title: 'Gateway of Tally' }]);
  }, []);

  const breadcrumb = screenStack.map(e => e.title || e.screen);

  return (
    <TallyRouterContext.Provider value={{
      currentScreen, screenStack, params,
      pushScreen, popScreen, resetToGateway, breadcrumb,
    }}>
      {children}
    </TallyRouterContext.Provider>
  );
};
