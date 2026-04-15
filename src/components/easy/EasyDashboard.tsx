import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLedgers, useVouchers, useStockItems } from '@/hooks/useTallyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight,
  Package, FileText, Users, BarChart3, CreditCard, Receipt, Wallet
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

const formatCurrency = (amount: number) => {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
  return `₹${amount.toFixed(0)}`;
};

const CHART_COLORS = [
  'hsl(222, 47%, 31%)', 'hsl(210, 70%, 50%)', 'hsl(180, 60%, 45%)',
  'hsl(150, 50%, 45%)', 'hsl(45, 80%, 55%)', 'hsl(0, 60%, 55%)',
];

const EasyDashboard = () => {
  const { selectedCompany } = useApp();
  const { data: ledgers = [] } = useLedgers();
  const { data: vouchers = [] } = useVouchers();
  const { data: stockItems = [] } = useStockItems();

  const totalSales = Math.abs(ledgers.find(l => l.name === 'Sales Account')?.closingBalance || 0);
  const totalPurchases = Math.abs(ledgers.find(l => l.name === 'Purchase Account')?.closingBalance || 0);
  const cashBalance = ledgers.find(l => l.name === 'Cash')?.closingBalance || 0;
  const bankBalance = ledgers.find(l => l.parent === 'Bank Accounts')?.closingBalance || 0;
  const receivables = ledgers.filter(l => l.parent === 'Sundry Debtors').reduce((s, l) => s + l.closingBalance, 0);
  const payables = Math.abs(ledgers.filter(l => l.parent === 'Sundry Creditors').reduce((s, l) => s + l.closingBalance, 0));
  const grossProfit = totalSales - totalPurchases;

  const voucherTypeData = ['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal'].map(type => ({
    name: type,
    count: vouchers.filter(v => v.voucherType === type).length,
    amount: vouchers.filter(v => v.voucherType === type).reduce((s, v) => s + v.totalAmount, 0),
  }));

  const recentVouchers = [...vouchers].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const expenseData = ledgers
    .filter(l => l.parent === 'Indirect Expenses' && l.closingBalance > 0)
    .map(l => ({ name: l.name, value: l.closingBalance }));

  const monthlyData = [
    { month: 'Nov', sales: 180000, purchases: 120000 },
    { month: 'Dec', sales: 220000, purchases: 150000 },
    { month: 'Jan', sales: 195000, purchases: 130000 },
    { month: 'Feb', sales: 250000, purchases: 160000 },
    { month: 'Mar', sales: 280000, purchases: 170000 },
    { month: 'Apr', sales: totalSales / 3, purchases: totalPurchases / 3 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Sales" value={formatCurrency(totalSales)} icon={<TrendingUp />} trend="+12.5%" positive />
        <KpiCard title="Total Purchases" value={formatCurrency(totalPurchases)} icon={<TrendingDown />} trend="+8.2%" positive={false} />
        <KpiCard title="Gross Profit" value={formatCurrency(grossProfit)} icon={<IndianRupee />} trend="+18.3%" positive />
        <KpiCard title="Cash + Bank" value={formatCurrency(cashBalance + bankBalance)} icon={<Wallet />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Receivables" value={formatCurrency(receivables)} icon={<ArrowUpRight />} subtitle="Outstanding" />
        <KpiCard title="Payables" value={formatCurrency(payables)} icon={<ArrowDownRight />} subtitle="Outstanding" />
        <KpiCard title="Stock Items" value={String(stockItems.length)} icon={<Package />} subtitle="Active" />
        <KpiCard title="Vouchers" value={String(vouchers.length)} icon={<FileText />} subtitle="This period" />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales vs Purchases Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="sales" stroke="hsl(210, 70%, 50%)" fill="hsl(210, 70%, 50%)" fillOpacity={0.15} name="Sales" />
                <Area type="monotone" dataKey="purchases" stroke="hsl(0, 60%, 55%)" fill="hsl(0, 60%, 55%)" fillOpacity={0.15} name="Purchases" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expenseData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No expense data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voucher Summary & Recent */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Voucher Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={voucherTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(222, 47%, 31%)" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVouchers.map(v => (
                <div key={v.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <VoucherIcon type={v.voucherType} />
                    <div>
                      <p className="text-sm font-medium">{v.partyName || v.narration || v.voucherType}</p>
                      <p className="text-xs text-muted-foreground">{v.voucherType} • {v.voucherNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(v.totalAmount)}</p>
                    <Badge variant={v.syncStatus === 'synced' ? 'secondary' : v.syncStatus === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">
                      {v.syncStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, trend, positive, subtitle }: {
  title: string; value: string; icon: React.ReactNode;
  trend?: string; positive?: boolean; subtitle?: string;
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
              {trend} vs last month
            </p>
          )}
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="text-muted-foreground opacity-50">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const VoucherIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Sales: <Receipt className="h-4 w-4 text-green-600" />,
    Purchase: <CreditCard className="h-4 w-4 text-red-500" />,
    Receipt: <ArrowUpRight className="h-4 w-4 text-blue-500" />,
    Payment: <ArrowDownRight className="h-4 w-4 text-orange-500" />,
    Journal: <FileText className="h-4 w-4 text-muted-foreground" />,
  };
  return <>{icons[type] || <FileText className="h-4 w-4" />}</>;
};

export default EasyDashboard;
