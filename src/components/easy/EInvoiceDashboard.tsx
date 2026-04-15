import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, QrCode,
  Zap, Copy, RotateCcw
} from 'lucide-react';
import {
  getEInvoices, getEInvoiceSummary, formatEInvAmount,
  type IRNStatus, type EInvoice
} from '@/services/eInvoiceService';
import { toast } from 'sonner';

const STATUS_CFG: Record<IRNStatus, { label: string; color: string; icon: React.ReactNode }> = {
  generated: { label: 'Generated', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3.5 w-3.5" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: <RotateCcw className="h-3.5 w-3.5" /> },
};

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const EInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState(getEInvoices());
  const summary = getEInvoiceSummary();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<IRNStatus | 'all'>('all');
  const [qrInvoice, setQrInvoice] = useState<EInvoice | null>(null);
  const [irnDetail, setIrnDetail] = useState<EInvoice | null>(null);

  const filtered = filter === 'all' ? invoices : invoices.filter(e => e.irnStatus === filter);
  const pendingIds = invoices.filter(e => e.irnStatus === 'pending').map(e => e.id);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAllPending = () => {
    if (selected.size === pendingIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingIds));
    }
  };

  const generateIRN = (ids: string[]) => {
    setInvoices(prev => prev.map(inv => {
      if (!ids.includes(inv.id) || inv.irnStatus !== 'pending') return inv;
      const irn = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      return {
        ...inv, irnStatus: 'generated' as const, irn,
        ackNo: `ACK-11${inv.invoiceDate.replace(/-/g, '')}${inv.invoiceNo.slice(-3)}`,
        ackDate: new Date().toISOString().split('T')[0],
        qrData: btoa(JSON.stringify({ irn, inv: inv.invoiceNo })),
      };
    }));
    setSelected(new Set());
    toast.success(`Generated IRN for ${ids.length} invoice(s)`);
  };

  const cancelIRN = (inv: EInvoice) => {
    setInvoices(prev => prev.map(e =>
      e.id === inv.id ? { ...e, irnStatus: 'cancelled' as const, cancelReason: 'Cancelled by user' } : e
    ));
    toast.success(`IRN cancelled for ${inv.invoiceNo}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">E-Invoice Management</h2>
          <p className="text-sm text-muted-foreground">IRN generation, QR codes & status tracking</p>
        </div>
        {selected.size > 0 && (
          <Button size="sm" onClick={() => generateIRN(Array.from(selected))}>
            <Zap className="h-4 w-4 mr-1" /> Generate IRN ({selected.size})
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Invoices</p>
            <p className="text-xl font-bold mt-1">{summary.total}</p>
          </CardContent>
        </Card>
        {(['generated', 'pending', 'error', 'cancelled'] as IRNStatus[]).map(s => {
          const cfg = STATUS_CFG[s];
          const count = summary[s === 'generated' ? 'generated' : s === 'pending' ? 'pending' : s === 'error' ? 'error' : 'cancelled'];
          return (
            <Card key={s} className={`cursor-pointer transition-all ${filter === s ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(f => f === s ? 'all' : s)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  {cfg.icon}
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
                <p className="text-xl font-bold">{count}</p>
                {s === 'pending' && <p className="text-xs text-muted-foreground mt-0.5">Value: {formatEInvAmount(summary.pendingValue)}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-3 w-8">
                  <Checkbox checked={selected.size > 0 && selected.size === pendingIds.length} onCheckedChange={selectAllPending} />
                </th>
                <th className="text-left p-3 font-medium">Invoice</th>
                <th className="text-left p-3 font-medium">Party</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">IRN / Error</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const cfg = STATUS_CFG[inv.irnStatus];
                return (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      {inv.irnStatus === 'pending' && (
                        <Checkbox checked={selected.has(inv.id)} onCheckedChange={() => toggleSelect(inv.id)} />
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{inv.invoiceNo}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.invoiceDate}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{inv.partyName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{inv.gstin || 'No GSTIN'}</p>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">{fmtINR(inv.amount)}</td>
                    <td className="p-3 text-center">
                      <Badge className={`${cfg.color} text-[10px] gap-1`}>{cfg.icon}{cfg.label}</Badge>
                    </td>
                    <td className="p-3">
                      {inv.irn && (
                        <button className="text-[10px] font-mono text-muted-foreground hover:text-foreground truncate max-w-[160px] block"
                          onClick={() => setIrnDetail(inv)}>
                          {inv.irn.slice(0, 20)}...
                        </button>
                      )}
                      {inv.errorMessage && (
                        <p className="text-[10px] text-red-600 max-w-[200px]">{inv.errorMessage}</p>
                      )}
                      {inv.cancelReason && (
                        <p className="text-[10px] text-muted-foreground max-w-[200px]">{inv.cancelReason}</p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        {inv.irnStatus === 'pending' && (
                          <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => generateIRN([inv.id])}>
                            <Zap className="h-3 w-3 mr-0.5" /> Generate
                          </Button>
                        )}
                        {inv.irnStatus === 'generated' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setQrInvoice(inv)}>
                              <QrCode className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-muted-foreground" onClick={() => cancelIRN(inv)}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {inv.irnStatus === 'error' && (
                          <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => toast.info('Fix the error and retry')}>
                            <AlertTriangle className="h-3 w-3 mr-0.5" /> Fix
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* QR Dialog */}
      <Dialog open={!!qrInvoice} onOpenChange={() => setQrInvoice(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code — {qrInvoice?.invoiceNo}</DialogTitle></DialogHeader>
          <div className="text-center space-y-4">
            <div className="mx-auto w-48 h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-2">E-Invoice QR</p>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">IRN:</span> <span className="font-mono text-[10px]">{qrInvoice?.irn?.slice(0, 32)}...</span></p>
              <p><span className="text-muted-foreground">Ack No:</span> {qrInvoice?.ackNo}</p>
              <p><span className="text-muted-foreground">Ack Date:</span> {qrInvoice?.ackDate}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrInvoice(null)}>Close</Button>
            <Button onClick={() => { toast.success('QR code copied'); setQrInvoice(null); }}>
              <Copy className="h-4 w-4 mr-1" /> Copy QR Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IRN Detail Dialog */}
      <Dialog open={!!irnDetail} onOpenChange={() => setIrnDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>IRN Details — {irnDetail?.invoiceNo}</DialogTitle></DialogHeader>
          {irnDetail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-muted-foreground">Party</p><p className="font-medium">{irnDetail.partyName}</p></div>
                <div><p className="text-xs text-muted-foreground">GSTIN</p><p className="font-mono text-xs">{irnDetail.gstin}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-mono font-semibold">{fmtINR(irnDetail.amount)}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p>{irnDetail.invoiceDate}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">IRN</p>
                <p className="font-mono text-[10px] break-all bg-muted p-2 rounded">{irnDetail.irn}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-xs text-muted-foreground">Ack No</p><p className="font-mono text-xs">{irnDetail.ackNo}</p></div>
                <div><p className="text-xs text-muted-foreground">Ack Date</p><p>{irnDetail.ackDate}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">Tax Breakdown</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-muted/50 rounded"><p className="text-[10px] text-muted-foreground">Taxable</p><p className="font-mono text-xs font-semibold">{fmtINR(irnDetail.taxableValue)}</p></div>
                  <div className="p-2 bg-muted/50 rounded"><p className="text-[10px] text-muted-foreground">IGST</p><p className="font-mono text-xs">{fmtINR(irnDetail.igst)}</p></div>
                  <div className="p-2 bg-muted/50 rounded"><p className="text-[10px] text-muted-foreground">CGST</p><p className="font-mono text-xs">{fmtINR(irnDetail.cgst)}</p></div>
                  <div className="p-2 bg-muted/50 rounded"><p className="text-[10px] text-muted-foreground">SGST</p><p className="font-mono text-xs">{fmtINR(irnDetail.sgst)}</p></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIrnDetail(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EInvoiceDashboard;
