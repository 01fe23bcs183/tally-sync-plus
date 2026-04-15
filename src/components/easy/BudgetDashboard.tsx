import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle, AlertCircle, CheckCircle2,
  BarChart3, Bell, Table2, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, AreaChart, Area
} from 'recharts';
import {
  getBudgetSummary, getMonthlyComparison, getMonths,
  formatBudgetAmount
} from '@/services/budgetService';

const BudgetDashboard = () => {
  const summary = getBudgetSummary();
  const monthlyData = getMonthlyComparison();
  const months = getMonths();
  const [selectedGroup, setSelectedGroup] = useState<string>('All');

  const groups = ['All', ...new Set(summary.items.map(i => i.group))];
  const filtered = selectedGroup === 'All'
    ? summary.items
    : summary.items.filter(i => i.group === selectedGroup);

  const overallPct = Math.round((summary.totalActual / summary.totalBudget) * 100);

  // Variance data for bar chart
  const varianceData = filtered.map(item => ({
    name: item.ledgerName.length > 15 ? item.ledgerName.slice(0, 14) + '…' : item.ledgerName,
    fullName: item.ledgerName,
    budget: item.annualBudget,
    actual: item.actualSpent,
    variance: item.actualSpent - item.annualBudget,
    pct: Math.round((item.actualSpent / item.annualBudget) * 100),
  }));

  const AlertIcon = ({ level }: { level: string }) => {
    if (level === 'exceeded') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (level === 'danger') return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Budget Management</h2>
        <p className="text-sm text-muted-foreground">FY 2025-26 • Budget tracking & variance analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-xl font-bold mt-1">{formatBudgetAmount(summary.totalBudget)}</p>
            <p className="text-xs text-muted-foreground mt-1">Annual allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Actual Spent</p>
            <p className="text-xl font-bold mt-1">{formatBudgetAmount(summary.totalActual)}</p>
            <Progress value={overallPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className={`text-xl font-bold mt-1 ${summary.variance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {summary.variance >= 0 ? '' : '+'}{formatBudgetAmount(Math.abs(summary.variance))}
            </p>
            <Badge variant={summary.variance >= 0 ? 'secondary' : 'destructive'} className="mt-1 text-xs">
              {summary.variance >= 0 ? 'Under Budget' : 'Over Budget'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Alerts</p>
            <p className="text-xl font-bold mt-1">{summary.alerts.length}</p>
            <div className="flex gap-1 mt-1">
              {summary.alerts.filter(a => a.level === 'exceeded').length > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {summary.alerts.filter(a => a.level === 'exceeded').length} exceeded
                </Badge>
              )}
              {summary.alerts.filter(a => a.level === 'danger').length > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {summary.alerts.filter(a => a.level === 'danger').length} critical
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1">
            <Table2 className="h-3.5 w-3.5" /> Details
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1">
            <Calendar className="h-3.5 w-3.5" /> Monthly
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1">
            <Bell className="h-3.5 w-3.5" /> Alerts ({summary.alerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-1 flex-wrap">
            {groups.map(g => (
              <Button
                key={g}
                variant={selectedGroup === g ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedGroup(g)}
              >
                {g}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatBudgetAmount(v)} />
                  <Tooltip
                    formatter={(v: number) => formatBudgetAmount(v)}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="hsl(210, 70%, 50%)" opacity={0.4} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
                    {varianceData.map((entry, i) => (
                      <Cell key={i} fill={entry.pct > 100 ? 'hsl(0, 60%, 55%)' : 'hsl(210, 70%, 50%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Utilization cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(item => {
              const pct = Math.round((item.actualSpent / item.annualBudget) * 100);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.ledgerName}</span>
                      <Badge
                        variant={pct > 100 ? 'destructive' : pct > 90 ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {pct}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(pct, 100)} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatBudgetAmount(item.actualSpent)} spent</span>
                      <span>{formatBudgetAmount(item.annualBudget)} budget</span>
                    </div>
                    {pct > 100 && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Over by {formatBudgetAmount(item.actualSpent - item.annualBudget)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Variance Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Particulars</th>
                      <th className="text-left py-2 font-medium">Group</th>
                      <th className="text-right py-2 font-medium">Budget</th>
                      <th className="text-right py-2 font-medium">Actual</th>
                      <th className="text-right py-2 font-medium">Variance</th>
                      <th className="text-right py-2 font-medium">Var %</th>
                      <th className="text-center py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.items.map(item => {
                      const variance = item.annualBudget - item.actualSpent;
                      const varPct = Math.round(((item.actualSpent - item.annualBudget) / item.annualBudget) * 100);
                      const pct = Math.round((item.actualSpent / item.annualBudget) * 100);
                      return (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 font-medium">{item.ledgerName}</td>
                          <td className="py-2 text-muted-foreground">{item.group}</td>
                          <td className="py-2 text-right font-mono">{formatBudgetAmount(item.annualBudget)}</td>
                          <td className="py-2 text-right font-mono">{formatBudgetAmount(item.actualSpent)}</td>
                          <td className={`py-2 text-right font-mono ${variance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {variance >= 0 ? '' : '-'}{formatBudgetAmount(Math.abs(variance))}
                          </td>
                          <td className={`py-2 text-right font-mono ${varPct <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {varPct > 0 ? '+' : ''}{varPct}%
                          </td>
                          <td className="py-2 text-center">
                            {pct > 100 ? <AlertCircle className="h-4 w-4 text-red-500 mx-auto" /> :
                             pct > 90 ? <AlertTriangle className="h-4 w-4 text-orange-500 mx-auto" /> :
                             <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="py-2" colSpan={2}>Total</td>
                      <td className="py-2 text-right font-mono">{formatBudgetAmount(summary.totalBudget)}</td>
                      <td className="py-2 text-right font-mono">{formatBudgetAmount(summary.totalActual)}</td>
                      <td className={`py-2 text-right font-mono ${summary.variance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.variance >= 0 ? '' : '-'}{formatBudgetAmount(Math.abs(summary.variance))}
                      </td>
                      <td className={`py-2 text-right font-mono ${summary.variancePercent <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {summary.variancePercent > 0 ? '+' : ''}{summary.variancePercent}%
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Budget vs Actual Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatBudgetAmount(v)} />
                  <Tooltip formatter={(v: number) => formatBudgetAmount(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="budget" name="Budget" stroke="hsl(210, 70%, 50%)" fill="hsl(210, 70%, 50%)" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="hsl(150, 50%, 45%)" fill="hsl(150, 50%, 45%)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly breakdown table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium sticky left-0 bg-card">Ledger</th>
                      {months.map(m => (
                        <th key={m} className="text-right py-2 font-medium px-2">{m}</th>
                      ))}
                      <th className="text-right py-2 font-medium px-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.items.slice(0, 6).map(item => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-1.5 font-medium sticky left-0 bg-card text-sm">{item.ledgerName}</td>
                        {item.monthlyActual.map((val, i) => {
                          const budget = item.monthlyBreakdown[i];
                          const over = val > budget * 1.1;
                          return (
                            <td key={i} className={`py-1.5 text-right px-2 font-mono ${over ? 'text-red-500' : ''}`}>
                              {formatBudgetAmount(val)}
                            </td>
                          );
                        })}
                        <td className="py-1.5 text-right px-2 font-mono font-semibold">
                          {formatBudgetAmount(item.actualSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All budgets are within limits</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.level === 'exceeded' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' :
                        alert.level === 'danger' ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950' :
                        'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
                      }`}
                    >
                      <AlertIcon level={alert.level} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{alert.ledgerName}</span>
                          <Badge
                            variant={alert.level === 'exceeded' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {alert.percent}% utilized
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetDashboard;
