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
import TDSDashboard from '@/components/easy/TDSDashboard';
import TCSDashboard from '@/components/easy/TCSDashboard';
import AuditTrailDashboard from '@/components/easy/AuditTrailDashboard';
import BarcodeDashboard from '@/components/easy/BarcodeDashboard';
import BatchExpiryDashboard from '@/components/easy/BatchExpiryDashboard';
import MultiGodownDashboard from '@/components/easy/MultiGodownDashboard';
import ManufacturingDashboard from '@/components/easy/ManufacturingDashboard';
import PurchaseOrderDashboard from '@/components/easy/PurchaseOrderDashboard';
import SalesOrderDashboard from '@/components/easy/SalesOrderDashboard';
import StockAgingDashboard from '@/components/easy/StockAgingDashboard';
import ReorderAlertDashboard from '@/components/easy/ReorderAlertDashboard';
import { LayoutDashboard, BookOpen, FileText, Package, Settings, X, ArrowRightLeft, FolderTree, Wallet, Building2, Percent, Receipt, FileMinus, StickyNote, IndianRupee, GitCompare, FileCheck, Truck, Scissors, ShieldCheck, ClipboardList, ScanBarcode, FlaskConical, Warehouse, Factory, ShoppingCart, ShoppingBag, Clock, BellRing } from 'lucide-react';

type EasyTab = 'dashboard' | 'ledgers' | 'vouchers' | 'inventory' | 'currency' | 'costcenters' | 'budget' | 'reconciliation' | 'interest' | 'billwise' | 'notes' | 'memo' | 'gst' | 'gstrecon' | 'einvoice' | 'ewaybill' | 'tds' | 'tcs' | 'audit' | 'barcode' | 'batch' | 'godowns' | 'manufacturing' | 'purchaseorders' | 'salesorders' | 'stockaging' | 'reorder' | 'settings';

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
    { key: 'tds', label: 'TDS', icon: <Scissors className="h-4 w-4" /> },
    { key: 'tcs', label: 'TCS', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'audit', label: 'Audit Trail', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'barcode', label: 'Barcode', icon: <ScanBarcode className="h-4 w-4" /> },
    { key: 'batch', label: 'Batch/Expiry', icon: <FlaskConical className="h-4 w-4" /> },
    { key: 'godowns', label: 'Godowns', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'manufacturing', label: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
    { key: 'purchaseorders', label: 'Purchase Orders', icon: <ShoppingCart className="h-4 w-4" /> },
    { key: 'salesorders', label: 'Sales Orders', icon: <ShoppingBag className="h-4 w-4" /> },
    { key: 'stockaging', label: 'Stock Aging', icon: <Clock className="h-4 w-4" /> },
    { key: 'reorder', label: 'Reorder Alerts', icon: <BellRing className="h-4 w-4" /> },
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
            {activeTab === 'tds' && <TDSDashboard />}
            {activeTab === 'tcs' && <TCSDashboard />}
            {activeTab === 'audit' && <AuditTrailDashboard />}
            {activeTab === 'barcode' && <BarcodeDashboard />}
            {activeTab === 'batch' && <BatchExpiryDashboard />}
            {activeTab === 'godowns' && <MultiGodownDashboard />}
            {activeTab === 'manufacturing' && <ManufacturingDashboard />}
            {activeTab === 'purchaseorders' && <PurchaseOrderDashboard />}
            {activeTab === 'salesorders' && <SalesOrderDashboard />}
            {activeTab === 'stockaging' && <StockAgingDashboard />}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
