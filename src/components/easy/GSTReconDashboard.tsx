import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, AlertTriangle, XCircle, Upload, Download,
  RefreshCw, ArrowRight
} from 'lucide-react';
import {
  getReconEntries, getReconSummary, formatReconAmount,
  type MatchStatus, type ReconEntry
} from '@/services/gstReconService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; icon: React.ReactNode }> = {
  matched: { label: 'Matched', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-4 w-4" /> },
  amount_mismatch: { label: 'Amount Mismatch', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertTriangle className="h-4 w-4" /> },
  missing_in_tally: { label: 'Missing in Tally', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-4 w-4" /> },
  missing_in_2b: { label: 'Missing in 2B', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <AlertTriangle className="h-4 w-4" /> },
};

const fmtINR = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

const GSTReconDashboard = () => {
  const entries = getReconEntries();
  const summary = getReconSummary();
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all');
  const [showMatched, setShowMatched] = useState(false);

  const filtered = filter === 'all'
    ? (showMatched ? entries : entries.filter(e => e.status !== 'matched'))
    : entries.filter(e => e.status === filter);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">GST Reconciliation — Apr 2026</h2>
          <p className="text-sm text-muted-foreground">GSTR-2B vs Tally Purchase Register</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Upload GSTR-2B JSON from the GST portal')}>
            <Upload className="h-4 w-4 mr-1" /> Upload 2B
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Reconciliation report exported')}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => toast.success('Re-reconciliation complete')}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reconcile
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { key: 'matched' as const, data: summary.matched },
          { key: 'amount_mismatch' as const, data: summary.amountMismatch },
          { key: 'missing_in_tally' as const, data: summary.missingInTally },
          { key: 'missing_in_2b' as const, data: summary.missingIn2B },
        ]).map(({ key, data }) => {
          const cfg = STATUS_CONFIG[key];
          return (
            <Card key={key} className={`cursor-pointer transition-all ${filter === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(f => f === key ? 'all' : key)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cfg.color + ' p-1 rounded'}>{cfg.icon}</span>
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
                <p className="text-2xl font-bold">{data.count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxable: {formatReconAmount(data.taxable)} · Tax: {formatReconAmount(data.tax)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ITC Impact */}
      <Card>
        <CardHeader><CardTitle className="text-base">ITC Impact Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground mb-1">Eligible ITC (Matched)</p>
              <p className="text-xl font-bold text-green-600">{fmtINR(summary.itcEligible)}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-muted-foreground mb-1">At Risk ITC (Mismatch)</p>
              <p className="text-xl font-bold text-yellow-600">{fmtINR(summary.itcAtRisk)}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-muted-foreground mb-1">Ineligible ITC (Not in 2B)</p>
              <p className="text-xl font-bold text-red-600">{fmtINR(summary.itcIneligible)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing:</span>
          <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>
            All ({entries.length})
          </Badge>
          {filter === 'all' && (
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setShowMatched(!showMatched)}>
              {showMatched ? 'Hide' : 'Show'} matched
            </Button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} entries</span>
      </div>

      {/* Entries Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Party</th>
                <th className="text-left p-3 font-medium">Invoice</th>
                <th className="text-right p-3 font-medium">Portal (2B)</th>
                <th className="text-center p-3 font-medium" />
                <th className="text-right p-3 font-medium">Tally</th>
                <th className="text-right p-3 font-medium">Diff</th>
                <th className="text-left p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const cfg = STATUS_CONFIG[e.status];
                const portalTax = (e.portalIGST || 0) + (e.portalCGST || 0) + (e.portalSGST || 0);
                const tallyTax = (e.tallyIGST || 0) + (e.tallyCGST || 0) + (e.tallySGST || 0);
                const diff = e.taxDiff || Math.abs(portalTax - tallyTax);
                return (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <Badge className={`${cfg.color} text-[10px] gap-1`}>
                        {cfg.icon}{cfg.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-sm">{e.partyName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{e.gstin}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-xs">{e.invoiceNo}</p>
                      <p className="text-[10px] text-muted-foreground">{e.invoiceDate}</p>
                    </td>
                    <td className="p-3 text-right">
                      {e.portalTaxable != null ? (
                        <div>
                          <p className="font-mono">{fmtINR(e.portalTaxable)}</p>
                          <p className="text-[10px] text-muted-foreground">Tax: {fmtINR(portalTax)}</p>
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-center"><ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" /></td>
                    <td className="p-3 text-right">
                      {e.tallyTaxable != null ? (
                        <div>
                          <p className="font-mono">{fmtINR(e.tallyTaxable)}</p>
                          <p className="text-[10px] text-muted-foreground">Tax: {fmtINR(tallyTax)}</p>
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-right">
                      {diff > 0 ? (
                        <span className="text-red-600 font-mono font-semibold">{fmtINR(diff)}</span>
                      ) : (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </td>
                    <td className="p-3">
                      {e.suggestion && (
                        <p className="text-[10px] text-muted-foreground max-w-[180px]">💡 {e.suggestion}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No entries to show</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GSTReconDashboard;
