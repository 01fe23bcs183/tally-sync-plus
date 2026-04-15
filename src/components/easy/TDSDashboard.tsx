import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2, Clock, AlertTriangle, FileText, Download
} from 'lucide-react';
import {
  getTDSEntries, getTDSSummaryBySection, getThresholdTrackers,
  fmtTDSAmount, SECTION_MASTER
} from '@/services/tdsService';
import { toast } from 'sonner';

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const TDSDashboard = () => {
  const entries = getTDSEntries();
  const sectionSummary = getTDSSummaryBySection();
  const thresholds = getThresholdTrackers();

  const totalDeducted = sectionSummary.reduce((s, r) => s + r.deducted, 0);
  const totalDeposited = sectionSummary.reduce((s, r) => s + r.deposited, 0);
  const totalPending = sectionSummary.reduce((s, r) => s + r.pending, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">TDS Management — Q1 FY 2026-27</h2>
          <p className="text-sm text-muted-foreground">Deductions, challans & compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Challan generated for pending TDS')}>
            <FileText className="h-4 w-4 mr-1" /> Generate Challan
          </Button>
          <Button size="sm" onClick={() => toast.success('Form 26Q data exported')}>
            <Download className="h-4 w-4 mr-1" /> Export 26Q
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Deducted</p>
          <p className="text-xl font-bold mt-1">{fmtTDSAmount(totalDeducted)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Deposited</p>
          <p className="text-xl font-bold mt-1 text-green-600">{fmtTDSAmount(totalDeposited)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pending Deposit</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{fmtTDSAmount(totalPending)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Due Date</p>
          <p className="text-lg font-bold mt-1 text-red-600">7-May-2026</p>
          <p className="text-[10px] text-muted-foreground">22 days remaining</p>
        </CardContent></Card>
      </div>

      {totalPending > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <span>Deposit <strong>{fmtINR(totalPending)}</strong> TDS by <strong>7-May-2026</strong> to avoid interest u/s 201(1A)</span>
        </div>
      )}

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">By Section</TabsTrigger>
          <TabsTrigger value="entries">All Entries</TabsTrigger>
          <TabsTrigger value="thresholds">Threshold Tracker</TabsTrigger>
          <TabsTrigger value="rates">Section Master</TabsTrigger>
        </TabsList>

        {/* By Section */}
        <TabsContent value="sections">
          <Card>
            <CardHeader><CardTitle className="text-base">TDS Summary by Section</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-center p-3 font-medium">Entries</th>
                    <th className="text-right p-3 font-medium">Deducted</th>
                    <th className="text-right p-3 font-medium">Deposited</th>
                    <th className="text-right p-3 font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionSummary.map(s => (
                    <tr key={s.section} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono font-semibold">{s.section}</td>
                      <td className="p-3 text-xs">{s.description}</td>
                      <td className="p-3 text-center">{s.entries}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(s.deducted)}</td>
                      <td className="p-3 text-right font-mono text-green-600">{fmtINR(s.deposited)}</td>
                      <td className="p-3 text-right font-mono">
                        {s.pending > 0 ? <span className="text-orange-600 font-semibold">{fmtINR(s.pending)}</span> : <span className="text-green-600">✓</span>}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-semibold">
                    <td className="p-3" colSpan={2}>Total</td>
                    <td className="p-3 text-center">{entries.length}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(totalDeducted)}</td>
                    <td className="p-3 text-right font-mono text-green-600">{fmtINR(totalDeposited)}</td>
                    <td className="p-3 text-right font-mono text-orange-600">{fmtINR(totalPending)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Entries */}
        <TabsContent value="entries">
          <Card>
            <CardHeader><CardTitle className="text-base">TDS Deduction Register</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Party</th>
                    <th className="text-left p-3 font-medium">PAN</th>
                    <th className="text-center p-3 font-medium">Section</th>
                    <th className="text-right p-3 font-medium">Payment</th>
                    <th className="text-right p-3 font-medium">TDS</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Challan</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 text-xs">{e.paymentDate}</td>
                      <td className="p-3 font-medium text-sm">{e.partyName}</td>
                      <td className="p-3 font-mono text-xs">{e.pan}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{e.section}</Badge></td>
                      <td className="p-3 text-right font-mono">{fmtINR(e.paymentAmount)}</td>
                      <td className="p-3 text-right font-mono font-semibold">{fmtINR(e.tdsAmount)}</td>
                      <td className="p-3 text-center">
                        {e.deposited
                          ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Deposited</Badge>
                          : <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] gap-1"><Clock className="h-3 w-3" />Pending</Badge>
                        }
                      </td>
                      <td className="p-3 text-xs font-mono">{e.challanNo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threshold Tracker */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader><CardTitle className="text-base">Threshold Tracker — Per Party Per Section</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {thresholds.map((t, i) => {
                const pct = t.threshold > 0 ? Math.min(100, (t.cumulativePayment / t.threshold) * 100) : 100;
                return (
                  <div key={i} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.partyName}</p>
                        <p className="text-[10px] text-muted-foreground">{t.pan} · Section {t.section}</p>
                      </div>
                      <Badge variant={t.status === 'exceeded' ? 'default' : t.status === 'near' ? 'secondary' : 'outline'}
                        className={`text-[10px] ${t.status === 'exceeded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : t.status === 'near' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}`}>
                        {t.status === 'exceeded' ? 'TDS Applicable' : t.status === 'near' ? 'Near Threshold' : 'Below Threshold'}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${t.status === 'exceeded' ? 'bg-green-500' : t.status === 'near' ? 'bg-orange-400' : 'bg-blue-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Paid: {fmtINR(t.cumulativePayment)}</span>
                      <span>Threshold: {fmtINR(t.threshold)}</span>
                      <span>TDS Deducted: {fmtINR(t.tdsDeducted)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Master */}
        <TabsContent value="rates">
          <Card>
            <CardHeader><CardTitle className="text-base">TDS Section Master</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Nature of Payment</th>
                    <th className="text-center p-3 font-medium">Rate</th>
                    <th className="text-right p-3 font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTION_MASTER.map(s => (
                    <tr key={s.section} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono font-semibold">{s.section}</td>
                      <td className="p-3">{s.description}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{s.rate}%</Badge></td>
                      <td className="p-3 text-right font-mono">{s.threshold > 0 ? fmtINR(s.threshold) : 'As per slab'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TDSDashboard;
