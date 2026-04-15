import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  getCashFlowData, getReceivables, getPayables, getScenarios, applyScenario,
  PRIORITY_CONFIG, fmtCFAmt, type Scenario
} from '@/services/cashFlowService';
import { TrendingUp, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight, AlertTriangle, ToggleLeft } from 'lucide-react';

const CashFlowDashboard = () => {
  const baseData = getCashFlowData();
  const receivables = getReceivables();
  const payables = getPayables();
  const scenarios = getScenarios();
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);

  const cashFlowData = useMemo(() => {
    let data = [...baseData.map(m => ({ ...m }))];
    scenarios.filter(s => activeScenarios.includes(s.id)).forEach(s => {
      data = applyScenario(data, s);
    });
    return data;
  }, [baseData, scenarios, activeScenarios]);

  const currentMonth = cashFlowData.find(m => !m.isProjected && cashFlowData.indexOf(m) === cashFlowData.filter(x => !x.isProjected).length - 1);
  const projectedMonths = cashFlowData.filter(m => m.isProjected);
  const minBalance = Math.min(...cashFlowData.map(m => m.closingBalance));
  const maxBalance = Math.max(...cashFlowData.map(m => m.closingBalance));
  const totalReceivable = receivables.reduce((s, r) => s + r.amount, 0);
  const totalPayable = payables.reduce((s, p) => s + p.amount, 0);

  const toggleScenario = (id: string) => {
    setActiveScenarios(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cash Flow Forecast</h2>
        <p className="text-sm text-muted-foreground">Projected cash position with scenario analysis</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Wallet className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold">{fmtCFAmt(currentMonth?.closingBalance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><ArrowDownLeft className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Receivables Due</p>
                <p className="text-xl font-bold">{fmtCFAmt(totalReceivable)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><ArrowUpRight className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Payables Due</p>
                <p className="text-xl font-bold">{fmtCFAmt(totalPayable)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${minBalance < 200000 ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                {minBalance < 200000 ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <TrendingUp className="h-5 w-5 text-green-500" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Min Projected Balance</p>
                <p className="text-xl font-bold">{fmtCFAmt(minBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Forecast Chart + Table */}
        <TabsContent value="forecast">
          {/* Visual bar chart */}
          <Card className="mb-4">
            <CardHeader className="pb-2"><CardTitle className="text-base">Cash Position Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {cashFlowData.map(m => {
                  const pct = ((m.closingBalance - minBalance * 0.8) / (maxBalance * 1.1 - minBalance * 0.8)) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium">{fmtCFAmt(m.closingBalance)}</span>
                      <div className="w-full bg-muted rounded-t-sm relative" style={{ height: '100%' }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-sm transition-all ${m.isProjected ? 'opacity-60 border border-dashed border-primary' : ''}`}
                          style={{
                            height: `${pct}%`,
                            backgroundColor: m.netFlow >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m.month.split(' ')[0]}</span>
                      {m.isProjected && <span className="text-[8px] text-muted-foreground italic">proj</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Inflows</TableHead>
                    <TableHead className="text-right">Outflows</TableHead>
                    <TableHead className="text-right">Net Flow</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.map(m => (
                    <TableRow key={m.month} className={m.isProjected ? 'opacity-75' : ''}>
                      <TableCell className="font-medium">
                        {m.month}
                        {m.isProjected && <Badge className="ml-2 bg-muted text-muted-foreground text-[10px]">Projected</Badge>}
                      </TableCell>
                      <TableCell className="text-right">{fmtCFAmt(m.openingBalance)}</TableCell>
                      <TableCell className="text-right text-green-600">{fmtCFAmt(m.inflows)}</TableCell>
                      <TableCell className="text-right text-destructive">{fmtCFAmt(m.outflows)}</TableCell>
                      <TableCell className={`text-right font-medium ${m.netFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {m.netFlow >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                        {fmtCFAmt(m.netFlow)}
                      </TableCell>
                      <TableCell className="text-right font-bold">{fmtCFAmt(m.closingBalance)}</TableCell>
                      <TableCell>
                        {m.closingBalance < 500000 && <Badge className="bg-destructive/10 text-destructive text-[10px]">Low</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receivables */}
        <TabsContent value="receivables">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Receivable Projections</span>
                <span className="text-sm font-normal text-muted-foreground">Total: {fmtCFAmt(totalReceivable)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead className="text-right">Avg Payment Days</TableHead>
                    <TableHead>Collection Probability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.party}</TableCell>
                      <TableCell className="text-right font-medium">{fmtCFAmt(r.amount)}</TableCell>
                      <TableCell>{r.dueDate}</TableCell>
                      <TableCell>{r.expectedDate}</TableCell>
                      <TableCell className="text-right">{r.avgPaymentDays}d</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress value={r.probability} className="h-2 flex-1" />
                          <span className={`text-xs font-medium ${r.probability >= 80 ? 'text-green-600' : r.probability >= 60 ? 'text-yellow-600' : 'text-destructive'}`}>
                            {r.probability}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payables */}
        <TabsContent value="payables">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Upcoming Payables</span>
                <span className="text-sm font-normal text-muted-foreground">Total: {fmtCFAmt(totalPayable)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Party</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.party}</TableCell>
                      <TableCell className="text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-right font-medium">{fmtCFAmt(p.amount)}</TableCell>
                      <TableCell>{p.dueDate}</TableCell>
                      <TableCell><Badge className={PRIORITY_CONFIG[p.priority].color}>{PRIORITY_CONFIG[p.priority].label}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios */}
        <TabsContent value="scenarios">
          <div className="grid grid-cols-3 gap-4">
            {scenarios.map(sc => {
              const isActive = activeScenarios.includes(sc.id);
              const adjusted = applyScenario(baseData, sc);
              const worstBalance = Math.min(...adjusted.map(m => m.closingBalance));
              return (
                <Card key={sc.id} className={isActive ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{sc.name}</CardTitle>
                      <Switch checked={isActive} onCheckedChange={() => toggleScenario(sc.id)} />
                    </div>
                    <p className="text-xs text-muted-foreground">{sc.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {sc.adjustments.map((adj, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{adj.month}</span>
                          <div className="flex gap-3">
                            {adj.inflowChange !== 0 && (
                              <span className={adj.inflowChange > 0 ? 'text-green-600' : 'text-destructive'}>
                                {adj.inflowChange > 0 ? '+' : ''}{fmtCFAmt(adj.inflowChange)} in
                              </span>
                            )}
                            {adj.outflowChange !== 0 && (
                              <span className="text-destructive">+{fmtCFAmt(adj.outflowChange)} out</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-muted-foreground">Min Balance</span>
                      <span className={`font-bold ${worstBalance < 500000 ? 'text-destructive' : ''}`}>{fmtCFAmt(worstBalance)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {activeScenarios.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
              <ToggleLeft className="h-4 w-4" /> {activeScenarios.length} scenario(s) active — forecast table updated
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowDashboard;
