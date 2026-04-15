import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2, Clock, AlertTriangle, FileText, Download
} from 'lucide-react';
import {
  getTCSEntries, getTCSSummary, getTCSThresholds,
  fmtTCSAmt, TCS_SECTIONS
} from '@/services/tcsService';
import { toast } from 'sonner';

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const TCSDashboard = () => {
  const entries = getTCSEntries();
  const summary = getTCSSummary();
  const thresholds = getTCSThresholds();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">TCS Compliance — Q1 FY 2026-27</h2>
          <p className="text-sm text-muted-foreground">Tax Collected at Source tracking & returns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('TCS challan generated')}>
            <FileText className="h-4 w-4 mr-1" /> Generate Challan
          </Button>
          <Button size="sm" onClick={() => toast.success('Form 27EQ data exported')}>
            <Download className="h-4 w-4 mr-1" /> Export 27EQ
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="text-xl font-bold mt-1">{fmtTCSAmt(summary.total)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Deposited</p>
          <p className="text-xl font-bold mt-1 text-green-600">{fmtTCSAmt(summary.deposited)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pending Deposit</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{fmtTCSAmt(summary.pending)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-xl font-bold mt-1">{summary.entries}</p>
        </CardContent></Card>
      </div>

      {summary.pending > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <span>Deposit <strong>{fmtINR(summary.pending)}</strong> TCS by <strong>7-May-2026</strong></span>
        </div>
      )}

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">TCS Register</TabsTrigger>
          <TabsTrigger value="thresholds">Threshold Tracker</TabsTrigger>
          <TabsTrigger value="sections">Section Master</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader><CardTitle className="text-base">TCS Collection Register</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Party</th>
                    <th className="text-left p-3 font-medium">Invoice</th>
                    <th className="text-center p-3 font-medium">Section</th>
                    <th className="text-right p-3 font-medium">Sale Amt</th>
                    <th className="text-right p-3 font-medium">TCS</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Challan</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 text-xs">{e.invoiceDate}</td>
                      <td className="p-3">
                        <p className="font-medium text-sm">{e.partyName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{e.pan}</p>
                      </td>
                      <td className="p-3 font-mono text-xs">{e.invoiceNo}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{e.section}</Badge></td>
                      <td className="p-3 text-right font-mono">{fmtINR(e.saleAmount)}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {e.tcsAmount > 0 ? fmtINR(e.tcsAmount) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 text-center">
                        {e.tcsAmount === 0
                          ? <Badge variant="outline" className="text-[10px]">Below threshold</Badge>
                          : e.deposited
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

        <TabsContent value="thresholds">
          <Card>
            <CardHeader><CardTitle className="text-base">Buyer-wise Threshold Tracker</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {thresholds.map((t, i) => {
                const pct = t.threshold > 0 ? Math.min(100, (t.cumulativeSale / t.threshold) * 100) : 100;
                return (
                  <div key={i} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.partyName}</p>
                        <p className="text-[10px] text-muted-foreground">{t.pan} · Section {t.section}</p>
                      </div>
                      <Badge variant={t.status === 'exceeded' ? 'default' : 'outline'}
                        className={`text-[10px] ${t.status === 'exceeded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : t.status === 'near' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}`}>
                        {t.status === 'exceeded' ? 'TCS Applicable' : t.status === 'near' ? 'Near Threshold' : 'Below Threshold'}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${t.status === 'exceeded' ? 'bg-green-500' : t.status === 'near' ? 'bg-orange-400' : 'bg-blue-400'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Sales: {fmtTCSAmt(t.cumulativeSale)}</span>
                      {t.threshold > 0 && <span>Threshold: {fmtTCSAmt(t.threshold)}</span>}
                      <span>TCS: {fmtINR(t.tcsCollected)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader><CardTitle className="text-base">TCS Section Master</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Nature</th>
                    <th className="text-center p-3 font-medium">Rate</th>
                    <th className="text-right p-3 font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {TCS_SECTIONS.map(s => (
                    <tr key={s.section} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono font-semibold">{s.section}</td>
                      <td className="p-3">{s.description}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{s.rate}%</Badge></td>
                      <td className="p-3 text-right font-mono">{s.threshold > 0 ? fmtTCSAmt(s.threshold) : 'N/A'}</td>
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

export default TCSDashboard;
