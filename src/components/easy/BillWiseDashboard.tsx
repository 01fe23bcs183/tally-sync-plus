import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown, ChevronRight, Receipt, CreditCard, Clock,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
  getPartyOutstandings, getAgingSummary, getBillsByType,
  formatBillAmt
} from '@/services/billWiseService';

const BillWiseDashboard = () => {
  const [view, setView] = useState<'debtor' | 'creditor'>('debtor');
  const [expanded, setExpanded] = useState<string | null>(null);

  const parties = getPartyOutstandings(view);
  const aging = getAgingSummary(view);
  const allBills = getBillsByType(view);
  const totalOutstanding = parties.reduce((s, p) => s + p.totalOutstanding, 0);

  const agingChartData = aging.map(a => ({ name: a.label, value: a.amount, color: a.color }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Bill-wise Outstanding</h2>
          <p className="text-sm text-muted-foreground">Track invoices, aging & payment allocation</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={view === 'debtor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setView('debtor'); setExpanded(null); }}
          >
            <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Receivables
          </Button>
          <Button
            variant={view === 'creditor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setView('creditor'); setExpanded(null); }}
          >
            <ArrowDownRight className="h-3.5 w-3.5 mr-1" /> Payables
          </Button>
        </div>
      </div>

      {/* Aging Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total {view === 'debtor' ? 'Receivable' : 'Payable'}</p>
            <p className="text-xl font-bold mt-1">{formatBillAmt(totalOutstanding)}</p>
            <p className="text-xs text-muted-foreground mt-1">{allBills.length} bills</p>
          </CardContent>
        </Card>
        {aging.map(a => (
          <Card key={a.bucket}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                <p className="text-xs text-muted-foreground">{a.label}</p>
              </div>
              <p className="text-lg font-bold">{formatBillAmt(a.amount)}</p>
              <p className="text-xs text-muted-foreground">{a.count} bill{a.count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Party List */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Aging Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aging Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={agingChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  label={(props: any) => `${props.name.split(' ')[0]} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {agingChartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatBillAmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Party-wise Bar */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Outstanding by Party</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={parties.map(p => ({ name: p.partyName.length > 14 ? p.partyName.slice(0, 13) + '…' : p.partyName, value: p.totalOutstanding, fullName: p.partyName }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatBillAmt(v)} />
                <Tooltip formatter={(v: number) => formatBillAmt(v)} labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ''} />
                <Bar dataKey="value" name="Outstanding" radius={[4, 4, 0, 0]}>
                  {parties.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? 'hsl(0, 60%, 55%)' : 'hsl(210, 70%, 50%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Party-wise Expandable List */}
      <div className="space-y-2">
        {parties.map(party => {
          const isExp = expanded === party.partyName;
          return (
            <Card key={party.partyName}>
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpanded(isExp ? null : party.partyName)}
                >
                  {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {view === 'debtor' ? <Receipt className="h-4 w-4 text-muted-foreground" /> : <CreditCard className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{party.partyName}</span>
                    <p className="text-xs text-muted-foreground">
                      {party.billCount} bill{party.billCount > 1 ? 's' : ''} •
                      Oldest overdue: {party.oldestOverdue} days
                    </p>
                  </div>
                  <span className="text-sm font-bold">{formatBillAmt(party.totalOutstanding)}</span>
                </button>

                {isExp && (
                  <div className="border-t px-4 pb-4">
                    <table className="w-full text-sm mt-2">
                      <thead>
                        <tr className="text-muted-foreground text-xs">
                          <th className="text-left py-1.5 font-medium">Invoice</th>
                          <th className="text-center py-1.5 font-medium">Date</th>
                          <th className="text-center py-1.5 font-medium">Due Date</th>
                          <th className="text-right py-1.5 font-medium">Amount</th>
                          <th className="text-right py-1.5 font-medium">Paid</th>
                          <th className="text-right py-1.5 font-medium">Balance</th>
                          <th className="text-center py-1.5 font-medium">Aging</th>
                        </tr>
                      </thead>
                      <tbody>
                        {party.bills.map(b => (
                          <tr key={b.id} className="border-b last:border-0">
                            <td className="py-1.5 font-medium">{b.invoiceNumber}</td>
                            <td className="py-1.5 text-center text-xs">{b.date}</td>
                            <td className="py-1.5 text-center text-xs">{b.dueDate}</td>
                            <td className="py-1.5 text-right font-mono">{formatBillAmt(b.amount)}</td>
                            <td className="py-1.5 text-right font-mono text-green-600">
                              {b.paid > 0 ? formatBillAmt(b.paid) : '—'}
                            </td>
                            <td className="py-1.5 text-right font-mono font-semibold">{formatBillAmt(b.balance)}</td>
                            <td className="py-1.5 text-center">
                              <AgingBadge days={b.agingDays} bucket={b.agingBucket} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t font-bold">
                          <td className="py-1.5" colSpan={3}>Total</td>
                          <td className="py-1.5 text-right font-mono">{formatBillAmt(party.bills.reduce((s, b) => s + b.amount, 0))}</td>
                          <td className="py-1.5 text-right font-mono text-green-600">{formatBillAmt(party.bills.reduce((s, b) => s + b.paid, 0))}</td>
                          <td className="py-1.5 text-right font-mono">{formatBillAmt(party.totalOutstanding)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>

                    {/* Payment History */}
                    {party.bills.some(b => b.payments.length > 0) && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Payment History</p>
                        <div className="space-y-1">
                          {party.bills.flatMap(b =>
                            b.payments.map(p => (
                              <div key={`${b.id}-${p.voucherNumber}`} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{p.date}</span>
                                  <span className="text-muted-foreground">→ {b.invoiceNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px]">{p.mode}</Badge>
                                  <span className="font-mono text-green-600">{formatBillAmt(p.amount)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Allocate Payment</Button>
                      <Button size="sm" variant="outline">Send Reminder</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const AgingBadge = ({ days, bucket }: { days: number; bucket: string }) => {
  const variant = bucket === '90+' ? 'destructive' : 'outline';
  const colorClass = bucket === '0-30' ? 'text-green-600' : bucket === '30-60' ? 'text-yellow-600' : bucket === '60-90' ? 'text-orange-500' : '';
  return (
    <Badge variant={variant} className={`text-[10px] ${colorClass}`}>
      {days}d
    </Badge>
  );
};

export default BillWiseDashboard;
