import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, ArrowRightLeft,
  BarChart3, History, Calculator, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  CurrencyRate, CurrencyExposure, RevaluationEntry,
  fetchLiveRates, getExposures, calculateRevaluation,
  getRateHistory, formatINR
} from '@/services/forexService';
import { toast } from 'sonner';

const MultiCurrencyDashboard = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [exposures] = useState<CurrencyExposure[]>(getExposures());
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [historyDays, setHistoryDays] = useState(30);
  const [showRevaluation, setShowRevaluation] = useState(false);
  const [revalEntries, setRevalEntries] = useState<RevaluationEntry[]>([]);
  const [revalDone, setRevalDone] = useState(false);

  const loadRates = async () => {
    setLoading(true);
    try {
      const fetched = await fetchLiveRates();
      setRates(fetched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRates(); }, []);

  const history = getRateHistory(selectedCurrency, historyDays);

  const totalExposureINR = exposures.reduce((s, e) => s + e.inrValue, 0);
  const totalUnrealizedGL = exposures.reduce((s, e) => s + e.unrealizedGainLoss, 0);

  // Group exposure by currency for pie chart
  const exposureByCurrency = Object.entries(
    exposures.reduce((acc, e) => {
      acc[e.currency] = (acc[e.currency] || 0) + Math.abs(e.inrValue);
      return acc;
    }, {} as Record<string, number>)
  ).map(([currency, value]) => ({ currency, value }));

  const COLORS = [
    'hsl(210, 70%, 50%)', 'hsl(150, 50%, 45%)', 'hsl(45, 80%, 55%)',
    'hsl(0, 60%, 55%)', 'hsl(280, 50%, 55%)',
  ];

  const handleRevaluation = () => {
    const rateMap: Record<string, number> = {};
    rates.forEach(r => { rateMap[r.currency] = r.rateToINR; });
    const entries = calculateRevaluation(exposures, rateMap);
    setRevalEntries(entries);
    setShowRevaluation(true);
    setRevalDone(false);
  };

  const confirmRevaluation = () => {
    setRevalDone(true);
    toast.success('Revaluation journal entry created successfully');
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Multi-Currency Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Live forex rates & currency exposure • Last updated: {rates[0]?.lastUpdated?.toLocaleTimeString() || '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadRates} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          <Button size="sm" onClick={handleRevaluation}>
            <Calculator className="h-4 w-4 mr-1" />
            Run Revaluation
          </Button>
        </div>
      </div>

      {/* Live Rates Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {rates.slice(0, 5).map(r => (
          <Card
            key={r.currency}
            className={`cursor-pointer transition-all ${selectedCurrency === r.currency ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedCurrency(r.currency)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{r.currency}/INR</span>
                <TrendIcon change={r.change} />
              </div>
              <p className="text-lg font-bold">₹{r.rateToINR.toFixed(2)}</p>
              <p className={`text-xs ${r.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {r.change >= 0 ? '+' : ''}{r.change.toFixed(2)} ({r.changePercent.toFixed(2)}%)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* More rates (collapsed row) */}
      {rates.length > 5 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {rates.slice(5).map(r => (
            <Card
              key={r.currency}
              className={`cursor-pointer transition-all ${selectedCurrency === r.currency ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCurrency(r.currency)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{r.currency}/INR</span>
                  <TrendIcon change={r.change} />
                </div>
                <p className="text-lg font-bold">₹{r.rateToINR.toFixed(2)}</p>
                <p className={`text-xs ${r.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {r.change >= 0 ? '+' : ''}{r.change.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="exposure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exposure" className="gap-1">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Exposure
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <History className="h-3.5 w-3.5" /> Rate History
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> Analysis
          </TabsTrigger>
        </TabsList>

        {/* Exposure Tab */}
        <TabsContent value="exposure" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Foreign Exposure</p>
                <p className="text-xl font-bold mt-1">{formatINR(totalExposureINR)}</p>
                <p className="text-xs text-muted-foreground mt-1">{exposures.length} positions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Unrealized Gain/Loss</p>
                <p className={`text-xl font-bold mt-1 ${totalUnrealizedGL >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {totalUnrealizedGL >= 0 ? '+' : ''}{formatINR(totalUnrealizedGL)}
                </p>
                <Badge variant={totalUnrealizedGL >= 0 ? 'secondary' : 'destructive'} className="mt-1 text-xs">
                  {totalUnrealizedGL >= 0 ? 'Net Gain' : 'Net Loss'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Currencies Active</p>
                <p className="text-xl font-bold mt-1">{new Set(exposures.map(e => e.currency)).size}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {[...new Set(exposures.map(e => e.currency))].join(', ')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Exposure Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Currency Exposure Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Party / Ledger</th>
                      <th className="text-center py-2 font-medium">Currency</th>
                      <th className="text-right py-2 font-medium">Foreign Bal</th>
                      <th className="text-right py-2 font-medium">Book Rate</th>
                      <th className="text-right py-2 font-medium">Current Rate</th>
                      <th className="text-right py-2 font-medium">INR Value</th>
                      <th className="text-right py-2 font-medium">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exposures.map((exp, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 font-medium">{exp.ledgerName}</td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className="text-xs">{exp.symbol} {exp.currency}</Badge>
                        </td>
                        <td className="py-2 text-right font-mono">
                          {exp.symbol}{Math.abs(exp.foreignBalance).toLocaleString()}
                          {exp.foreignBalance < 0 && <span className="text-muted-foreground"> (Cr)</span>}
                        </td>
                        <td className="py-2 text-right font-mono">₹{exp.bookRate.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono">₹{exp.rateToINR.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono">{formatINR(exp.inrValue)}</td>
                        <td className={`py-2 text-right font-mono font-semibold ${exp.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {exp.unrealizedGainLoss >= 0 ? '+' : ''}{formatINR(exp.unrealizedGainLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="py-2" colSpan={5}>Total</td>
                      <td className="py-2 text-right font-mono">{formatINR(totalExposureINR)}</td>
                      <td className={`py-2 text-right font-mono ${totalUnrealizedGL >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {totalUnrealizedGL >= 0 ? '+' : ''}{formatINR(totalUnrealizedGL)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedCurrency}/INR Rate History
                </CardTitle>
                <Select value={String(historyDays)} onValueChange={v => setHistoryDays(Number(v))}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    domain={['auto', 'auto']}
                    tickFormatter={v => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toFixed(2)}`, `${selectedCurrency}/INR`]}
                    labelFormatter={l => new Date(l).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(210, 70%, 50%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Exposure by Currency</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={exposureByCurrency}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      dataKey="value"
                      label={(props: any) => `${props.currency} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {exposureByCurrency.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatINR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gain/Loss by Position</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={exposures} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatINR(v)} />
                    <YAxis type="category" dataKey="ledgerName" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => formatINR(v)} />
                    <Bar dataKey="unrealizedGainLoss" name="Gain/Loss">
                      {exposures.map((e, i) => (
                        <Cell key={i} fill={e.unrealizedGainLoss >= 0 ? 'hsl(150, 50%, 45%)' : 'hsl(0, 60%, 55%)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Revaluation Dialog */}
      <Dialog open={showRevaluation} onOpenChange={setShowRevaluation}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Currency Revaluation Preview
            </DialogTitle>
          </DialogHeader>

          {revalDone ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">Revaluation Complete</h3>
              <p className="text-sm text-muted-foreground">
                Journal entry has been created for forex revaluation as of {new Date().toLocaleDateString('en-IN')}.
              </p>
              <p className="text-sm font-medium">
                Net Gain/Loss: <span className={`${revalEntries.reduce((s, e) => s + e.gainLoss, 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatINR(revalEntries.reduce((s, e) => s + e.gainLoss, 0))}
                </span>
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Ledger</th>
                      <th className="text-center py-2 font-medium">Curr</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">Old Rate</th>
                      <th className="text-right py-2 font-medium">New Rate</th>
                      <th className="text-right py-2 font-medium">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revalEntries.map((e, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{e.ledgerName}</td>
                        <td className="py-2 text-center">{e.currency}</td>
                        <td className="py-2 text-right font-mono">{e.foreignAmount.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono">₹{e.oldRate.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono">₹{e.newRate.toFixed(2)}</td>
                        <td className={`py-2 text-right font-mono font-semibold ${e.gainLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {e.gainLoss >= 0 ? '+' : ''}{formatINR(e.gainLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold">
                      <td className="py-2" colSpan={5}>Net Revaluation</td>
                      <td className={`py-2 text-right font-mono ${revalEntries.reduce((s, e) => s + e.gainLoss, 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatINR(revalEntries.reduce((s, e) => s + e.gainLoss, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Journal Entry to be Created:</p>
                <p className="text-muted-foreground">
                  Dr/Cr Forex Gain/Loss A/c — {formatINR(Math.abs(revalEntries.reduce((s, e) => s + e.gainLoss, 0)))}
                </p>
                <p className="text-muted-foreground">
                  Narration: Forex Revaluation — {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </>
          )}

          <DialogFooter>
            {revalDone ? (
              <Button onClick={() => setShowRevaluation(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowRevaluation(false)}>Cancel</Button>
                <Button onClick={confirmRevaluation}>Create Journal Entry</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiCurrencyDashboard;
