import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertTriangle, CheckCircle2, XCircle, Download, Eye, FileJson,
  Info, Clock, Shield, History
} from 'lucide-react';
import {
  getGSTR1Sections, getGSTR3BSummary, getValidationIssues,
  getHSNSummary, getFilingHistory, formatGSTAmount,
  type ValidationSeverity
} from '@/services/gstReturnService';
import { toast } from 'sonner';

const sevColors: Record<ValidationSeverity, string> = {
  error: 'text-red-600', warning: 'text-orange-500', info: 'text-blue-500',
};
const sevIcons: Record<ValidationSeverity, React.ReactNode> = {
  error: <XCircle className="h-4 w-4 text-red-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
};

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const GSTReturnDashboard = () => {
  const [period] = useState('Apr 2026');
  const sections = getGSTR1Sections();
  const gstr3b = getGSTR3BSummary();
  const issues = getValidationIssues();
  const hsn = getHSNSummary();
  const history = getFilingHistory();
  const [showJson, setShowJson] = useState(false);

  const totalTaxable = sections.reduce((s, r) => s + r.taxableValue, 0);
  const totalTax = sections.reduce((s, r) => s + r.totalTax, 0);
  const totalInvoices = sections.reduce((s, r) => s + r.invoiceCount, 0);
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  const netPayableTotal = gstr3b.netPayable.igst + gstr3b.netPayable.cgst + gstr3b.netPayable.sgst + gstr3b.netPayable.cess;

  const handleDownload = () => toast.success('GST JSON downloaded — ready for portal upload');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">GST Returns — {period}</h2>
          <p className="text-sm text-muted-foreground">Auto-generated from Tally voucher data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJson(true)}>
            <Eye className="h-4 w-4 mr-1" /> Preview JSON
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Download JSON
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Invoices</p>
          <p className="text-xl font-bold mt-1">{totalInvoices}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Taxable Value</p>
          <p className="text-xl font-bold mt-1">{formatGSTAmount(totalTaxable)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Tax</p>
          <p className="text-xl font-bold mt-1">{formatGSTAmount(totalTax)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Net Payable</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{formatGSTAmount(netPayableTotal)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Validation</p>
          <div className="flex gap-2 mt-1">
            {errors > 0 && <span className="text-red-600 text-sm font-bold">{errors} errors</span>}
            {warnings > 0 && <span className="text-orange-500 text-sm font-bold">{warnings} warnings</span>}
            {errors === 0 && warnings === 0 && <span className="text-green-600 text-sm font-bold">All clear ✓</span>}
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="gstr1" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gstr1">GSTR-1</TabsTrigger>
          <TabsTrigger value="gstr3b">GSTR-3B</TabsTrigger>
          <TabsTrigger value="hsn">HSN Summary</TabsTrigger>
          <TabsTrigger value="validation">
            Validation {(errors + warnings) > 0 && <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">{errors + warnings}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history">Filing History</TabsTrigger>
        </TabsList>

        {/* GSTR-1 */}
        <TabsContent value="gstr1">
          <Card>
            <CardHeader><CardTitle className="text-base">GSTR-1 Section Summary</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-right p-3 font-medium">Invoices</th>
                    <th className="text-right p-3 font-medium">Taxable Value</th>
                    <th className="text-right p-3 font-medium">IGST</th>
                    <th className="text-right p-3 font-medium">CGST</th>
                    <th className="text-right p-3 font-medium">SGST</th>
                    <th className="text-right p-3 font-medium">Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(s => (
                    <tr key={s.code} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <span className="font-medium">{s.code}</span>
                        <span className="text-xs text-muted-foreground ml-2">{s.label}</span>
                      </td>
                      <td className="p-3 text-right font-mono">{s.invoiceCount}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(s.taxableValue)}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(s.igst)}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(s.cgst)}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(s.sgst)}</td>
                      <td className="p-3 text-right font-mono font-semibold">{fmtINR(s.totalTax)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-semibold">
                    <td className="p-3">Total</td>
                    <td className="p-3 text-right font-mono">{totalInvoices}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(totalTaxable)}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(sections.reduce((s, r) => s + r.igst, 0))}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(sections.reduce((s, r) => s + r.cgst, 0))}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(sections.reduce((s, r) => s + r.sgst, 0))}</td>
                    <td className="p-3 text-right font-mono">{fmtINR(totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GSTR-3B */}
        <TabsContent value="gstr3b">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Output Tax Liability</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {(['igst', 'cgst', 'sgst', 'cess'] as const).map(k => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground uppercase">{k}</span>
                      <span className="font-mono font-semibold">{fmtINR(gstr3b.outputTax[k])}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Output Tax</span>
                    <span className="font-mono">{fmtINR(Object.values(gstr3b.outputTax).reduce((a, b) => a + b, 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Input Tax Credit (ITC)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {(['igst', 'cgst', 'sgst', 'cess'] as const).map(k => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground uppercase">{k}</span>
                      <span className="font-mono font-semibold text-green-600">{fmtINR(gstr3b.itcAvailable[k])}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total ITC</span>
                    <span className="font-mono text-green-600">{fmtINR(Object.values(gstr3b.itcAvailable).reduce((a, b) => a + b, 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Net Tax Payable</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {(['igst', 'cgst', 'sgst', 'cess'] as const).map(k => (
                    <div key={k} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase mb-1">{k}</p>
                      <p className="text-lg font-bold font-mono">{fmtINR(gstr3b.netPayable[k])}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-muted-foreground">Total Net Payable</p>
                  <p className="text-2xl font-bold text-orange-600">{fmtINR(netPayableTotal)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HSN */}
        <TabsContent value="hsn">
          <Card>
            <CardHeader><CardTitle className="text-base">HSN-wise Summary ({hsn.length} codes)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">HSN</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-center p-3 font-medium">UQC</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Taxable</th>
                    <th className="text-center p-3 font-medium">Rate</th>
                    <th className="text-right p-3 font-medium">IGST</th>
                    <th className="text-right p-3 font-medium">CGST</th>
                    <th className="text-right p-3 font-medium">SGST</th>
                  </tr>
                </thead>
                <tbody>
                  {hsn.map(h => (
                    <tr key={h.hsn} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono font-medium">{h.hsn}</td>
                      <td className="p-3 text-xs">{h.description}</td>
                      <td className="p-3 text-center text-xs">{h.uqc}</td>
                      <td className="p-3 text-right font-mono">{h.quantity}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(h.taxableValue)}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{h.rate}%</Badge></td>
                      <td className="p-3 text-right font-mono">{fmtINR(h.igst)}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(h.cgst)}</td>
                      <td className="p-3 text-right font-mono">{fmtINR(h.sgst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation */}
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Pre-Filing Validation
                <Badge variant={errors > 0 ? 'destructive' : 'secondary'} className="ml-2">
                  {errors} errors, {warnings} warnings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.map(issue => (
                <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {sevIcons[issue.severity]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${sevColors[issue.severity]}`}>{issue.message}</span>
                      <Badge variant="outline" className="text-[10px]">{issue.field}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {issue.invoiceNo} — {issue.partyName}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      💡 {issue.suggestion}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7 shrink-0"
                    onClick={() => toast.success(`Fix applied for ${issue.invoiceNo}`)}>
                    Fix
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filing History */}
        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Filing History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Return</th>
                    <th className="text-left p-3 font-medium">Period</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Filed Date</th>
                    <th className="text-left p-3 font-medium">ARN</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{h.returnType}</td>
                      <td className="p-3">{h.period}</td>
                      <td className="p-3 text-center">
                        {h.status === 'filed' && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-0.5" />Filed</Badge>}
                        {h.status === 'draft' && <Badge variant="secondary" className="text-[10px]"><Clock className="h-3 w-3 mr-0.5" />Draft</Badge>}
                        {h.status === 'not_started' && <Badge variant="outline" className="text-[10px]">Not Started</Badge>}
                      </td>
                      <td className="p-3 text-xs">{h.filedDate || '—'}</td>
                      <td className="p-3 font-mono text-xs">{h.arn || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* JSON Preview Dialog */}
      <Dialog open={showJson} onOpenChange={setShowJson}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileJson className="h-5 w-5" /> GSTR-1 JSON Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[50vh] text-xs font-mono">
            <pre>{JSON.stringify({
              gstin: '27AAACR1234F1ZQ',
              fp: '042026',
              b2b: sections.filter(s => s.code === 'B2B').map(s => ({
                ctin: 'SAMPLE_GSTIN', inv: [{ inum: 'INV-001', idt: '15-04-2026', val: s.taxableValue, pos: '27',
                  itms: [{ num: 1, itm_det: { txval: s.taxableValue, rt: 18, iamt: s.igst, camt: s.cgst, samt: s.sgst } }]
                }]
              })),
              b2cs: sections.filter(s => s.code === 'B2CS').map(s => ({
                pos: '27', typ: 'OE', txval: s.taxableValue, rt: 18, camt: s.cgst, samt: s.sgst
              })),
              hsn: { data: hsn.map(h => ({ num: 1, hsn_sc: h.hsn, desc: h.description, uqc: h.uqc, qty: h.quantity, txval: h.taxableValue, iamt: h.igst, camt: h.cgst, samt: h.sgst, rt: h.rate })) }
            }, null, 2)}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJson(false)}>Close</Button>
            <Button onClick={() => { handleDownload(); setShowJson(false); }}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GSTReturnDashboard;
