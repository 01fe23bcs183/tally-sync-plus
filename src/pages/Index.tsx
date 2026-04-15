import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import AppHeader from '@/components/AppHeader';
import EasyDashboard from '@/components/easy/EasyDashboard';
import EasyLedgers from '@/components/easy/EasyLedgers';
import EasyVouchers from '@/components/easy/EasyVouchers';
import EasyInventory from '@/components/easy/EasyInventory';
import TallyMode from '@/components/tally/TallyMode';
import ConnectionSetup from '@/components/ConnectionSetup';
import { Button } from '@/components/ui/button';
import MultiCurrencyDashboard from '@/components/easy/MultiCurrencyDashboard';
import CostCenterDashboard from '@/components/easy/CostCenterDashboard';
import BudgetDashboard from '@/components/easy/BudgetDashboard';
import BankReconciliation from '@/components/easy/BankReconciliation';
import InterestDashboard from '@/components/easy/InterestDashboard';
import BillWiseDashboard from '@/components/easy/BillWiseDashboard';
import DebitCreditNotes from '@/components/easy/DebitCreditNotes';
import MemoVoucherDashboard from '@/components/easy/MemoVoucherDashboard';
import GSTReturnDashboard from '@/components/easy/GSTReturnDashboard';
import GSTReconDashboard from '@/components/easy/GSTReconDashboard';
import EInvoiceDashboard from '@/components/easy/EInvoiceDashboard';
import EWayBillDashboard from '@/components/easy/EWayBillDashboard';
import { LayoutDashboard, BookOpen, FileText, Package, Settings, X, ArrowRightLeft, FolderTree, Wallet, Building2, Percent, Receipt, FileMinus, StickyNote, IndianRupee, GitCompare, FileCheck, Truck } from 'lucide-react';

type EasyTab = 'dashboard' | 'ledgers' | 'vouchers' | 'inventory' | 'currency' | 'costcenters' | 'budget' | 'reconciliation' | 'interest' | 'billwise' | 'notes' | 'memo' | 'gst' | 'gstrecon' | 'einvoice' | 'ewaybill' | 'settings';

const Index = () => {
  const { mode } = useApp();
  const [activeTab, setActiveTab] = useState<EasyTab>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  if (mode === 'tally') {
    return (
      <div className="h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 overflow-hidden">
          <TallyMode />
        </div>
      </div>
    );
  }

  const tabs: { key: EasyTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'ledgers', label: 'Ledgers', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'vouchers', label: 'Vouchers', icon: <FileText className="h-4 w-4" /> },
    { key: 'inventory', label: 'Inventory', icon: <Package className="h-4 w-4" /> },
    { key: 'currency', label: 'Currency', icon: <ArrowRightLeft className="h-4 w-4" /> },
    { key: 'costcenters', label: 'Cost Centers', icon: <FolderTree className="h-4 w-4" /> },
    { key: 'budget', label: 'Budget', icon: <Wallet className="h-4 w-4" /> },
    { key: 'reconciliation', label: 'Bank Recon', icon: <Building2 className="h-4 w-4" /> },
    { key: 'interest', label: 'Interest', icon: <Percent className="h-4 w-4" /> },
    { key: 'billwise', label: 'Bills', icon: <Receipt className="h-4 w-4" /> },
    { key: 'notes', label: 'Dr/Cr Notes', icon: <FileMinus className="h-4 w-4" /> },
    { key: 'memo', label: 'Memo', icon: <StickyNote className="h-4 w-4" /> },
    { key: 'gst', label: 'GST Returns', icon: <IndianRupee className="h-4 w-4" /> },
    { key: 'gstrecon', label: 'GST Recon', icon: <GitCompare className="h-4 w-4" /> },
    { key: 'einvoice', label: 'E-Invoice', icon: <FileCheck className="h-4 w-4" /> },
    { key: 'ewaybill', label: 'E-Way Bill', icon: <Truck className="h-4 w-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader />
      {/* Tab bar */}
      <div className="border-b bg-card px-4 flex items-center gap-1">
        {tabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            className="gap-1.5 rounded-none border-b-2 border-transparent data-[active=true]:border-primary"
            data-active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {showSettings ? (
          <div className="p-6">
            <ConnectionSetup onClose={() => setShowSettings(false)} />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <EasyDashboard />}
            {activeTab === 'ledgers' && <EasyLedgers />}
            {activeTab === 'vouchers' && <EasyVouchers />}
            {activeTab === 'inventory' && <EasyInventory />}
            {activeTab === 'currency' && <MultiCurrencyDashboard />}
            {activeTab === 'costcenters' && <CostCenterDashboard />}
            {activeTab === 'budget' && <BudgetDashboard />}
            {activeTab === 'reconciliation' && <BankReconciliation />}
            {activeTab === 'interest' && <InterestDashboard />}
            {activeTab === 'billwise' && <BillWiseDashboard />}
            {activeTab === 'notes' && <DebitCreditNotes />}
            {activeTab === 'memo' && <MemoVoucherDashboard />}
            {activeTab === 'gst' && <GSTReturnDashboard />}
            {activeTab === 'gstrecon' && <GSTReconDashboard />}
            {activeTab === 'einvoice' && <EInvoiceDashboard />}
            {activeTab === 'ewaybill' && <EWayBillDashboard />}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
