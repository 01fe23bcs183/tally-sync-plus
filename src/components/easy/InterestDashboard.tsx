import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Calculator, Users, FileText, Percent, CheckCircle2,
  ChevronDown, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  getInterestSummaries, getTotalInterest, getTotalOutstanding,
  getProfiles, formatAmt, InterestSummary
} from '@/services/interestService';
import { toast } from 'sonner';

const COLORS = [
  'hsl(210, 70%, 50%)', 'hsl(150, 50%, 45%)', 'hsl(45, 80%, 55%)',
  'hsl(0, 60%, 55%)', 'hsl(280, 50%, 55%)', 'hsl(180, 60%, 45%)',
];

const InterestDashboard = () => {
  const summaries = getInterestSummaries();
  const profiles = getProfiles();
  const totalInterest = getTotalInterest();
  const totalOutstanding = getTotalOutstanding();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showJournal, setShowJournal] = useState(false);
  const [journalParty, setJournalParty] = useState<InterestSummary | null>(null);
  const [journalCreated, setJournalCreated] = useState(false);

  const chartData = summaries.map(s => ({
    name: s.partyName.length > 12 ? s.partyName.slice(0, 11) + '…' : s.partyName,
    fullName: s.partyName,
    interest: s.totalInterest,
    outstanding: s.totalOutstanding,
  }));

  const handleCreateJournal = (summary: InterestSummary) => {
    setJournalParty(summary);
    setShowJournal(true);
    setJournalCreated(false);
  };

  const confirmJournal = () => {
    setJournalCreated(true);
    toast.success(`Interest journal entry created for ${journalParty?.partyName}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-xl font-bold">Interest Calculation</h2>
        <p className="text-sm text-muted-foreground">Auto-compute interest on overdue balances • As of 15-Apr-2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold mt-1">{formatAmt(totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Interest Accrued</p>
            <p className="text-xl font-bold mt-1 text-red-500">{formatAmt(totalInterest)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Parties with Interest</p>
            <p className="text-xl font-bold mt-1">{summaries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Interest Profiles</p>
            <p className="text-xl font-bold mt-1">{profiles.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Configured</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parties" className="gap-1">
            <Users className="h-3.5 w-3.5" /> By Party
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-1">
            <Percent className="h-3.5 w-3.5" /> Profiles
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-1">
            <Calculator className="h-3.5 w-3.5" /> Analysis
          </TabsTrigger>
        </TabsList>

        {/* By Party */}
        <TabsContent value="parties" className="space-y-3">
          {summaries.map(s => {
            const isExpanded = expanded === s.partyName;
            return (
              <Card key={s.partyName}>
                <CardContent className="p-0">
                  {/* Party header */}
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : s.partyName)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{s.partyName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {s.rate}% {s.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.bills.length} bill{s.bills.length > 1 ? 's' : ''} • Outstanding: {formatAmt(s.totalOutstanding)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">{formatAmt(s.totalInterest)}</p>
                      <p className="text-[10px] text-muted-foreground">interest accrued</p>
                    </div>
                  </button>

                  {/* Expanded bill details */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      <table className="w-full text-sm mt-2">
                        <thead>
                          <tr className="text-muted-foreground text-xs">
                            <th className="text-left py-1.5 font-medium">Invoice</th>
                            <th className="text-center py-1.5 font-medium">Due Date</th>
                            <th className="text-right py-1.5 font-medium">Outstanding</th>
                            <th className="text-right py-1.5 font-medium">Overdue Days</th>
                            <th className="text-right py-1.5 font-medium">Interest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.bills.map(b => (
                            <tr key={b.id} className="border-b last:border-0">
                              <td className="py-1.5 font-medium">{b.invoiceNumber}</td>
                              <td className="py-1.5 text-center text-xs">{b.dueDate}</td>
                              <td className="py-1.5 text-right font-mono">{formatAmt(b.outstanding)}</td>
                              <td className="py-1.5 text-right">
                                {b.overdueDays > 0 ? (
                                  <Badge variant={b.overdueDays > 60 ? 'destructive' : 'outline'} className="text-xs">
                                    {b.overdueDays} days
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">In grace</span>
                                )}
                              </td>
                              <td className="py-1.5 text-right font-mono font-semibold text-red-500">
                                {b.interest > 0 ? formatAmt(b.interest) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t font-bold">
                            <td className="py-1.5" colSpan={2}>Total</td>
                            <td className="py-1.5 text-right font-mono">{formatAmt(s.totalOutstanding)}</td>
                            <td />
                            <td className="py-1.5 text-right font-mono text-red-500">{formatAmt(s.totalInterest)}</td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleCreateJournal(s)}>
                          <FileText className="h-3.5 w-3.5 mr-1" /> Create Journal Entry
                        </Button>
                        <Button variant="outline" size="sm">
                          Send Statement
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Interest Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Party / Account</th>
                    <th className="text-left py-2 font-medium">Group</th>
                    <th className="text-right py-2 font-medium">Rate (% p.a.)</th>
                    <th className="text-center py-2 font-medium">Type</th>
                    <th className="text-right py-2 font-medium">Grace Period</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 font-medium">{p.partyName}</td>
                      <td className="py-2 text-muted-foreground">{p.group}</td>
                      <td className="py-2 text-right font-mono">{p.ratePercent}%</td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">
                          {p.type === 'compound' ? `Compound (${p.compoundFrequency})` : 'Simple'}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">{p.gracePeriodDays} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="chart" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Interest by Party</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatAmt(v)} />
                    <Tooltip
                      formatter={(v: number) => formatAmt(v)}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                    />
                    <Bar dataKey="interest" name="Interest" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Outstanding vs Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatAmt(v)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => formatAmt(v)} />
                    <Bar dataKey="outstanding" name="Outstanding" fill="hsl(210, 70%, 50%)" opacity={0.4} />
                    <Bar dataKey="interest" name="Interest" fill="hsl(0, 60%, 55%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Journal Entry Dialog */}
      <Dialog open={showJournal} onOpenChange={setShowJournal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Interest Journal Entry</DialogTitle>
          </DialogHeader>
          {journalCreated ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
              <p className="font-semibold">Journal Entry Created</p>
              <p className="text-sm text-muted-foreground">
                Interest of {formatAmt(journalParty?.totalInterest ?? 0)} debited to {journalParty?.partyName}
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <p><strong>Party:</strong> {journalParty?.partyName}</p>
                <p><strong>Interest Amount:</strong> {formatAmt(journalParty?.totalInterest ?? 0)}</p>
                <p><strong>Rate:</strong> {journalParty?.rate}% p.a. ({journalParty?.type})</p>
              </div>
              <div className="border rounded-lg p-3 space-y-1">
                <p className="font-medium mb-2">Journal Entry Preview:</p>
                <div className="flex justify-between">
                  <span>Dr. {journalParty?.partyName}</span>
                  <span className="font-mono">{formatAmt(journalParty?.totalInterest ?? 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cr. Interest Received A/c</span>
                  <span className="font-mono">{formatAmt(journalParty?.totalInterest ?? 0)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Narration: Interest charged @ {journalParty?.rate}% on overdue balance — Apr 2026
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {journalCreated ? (
              <Button onClick={() => setShowJournal(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowJournal(false)}>Cancel</Button>
                <Button onClick={confirmJournal}>Create Entry</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterestDashboard;
