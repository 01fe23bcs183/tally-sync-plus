import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, Zap, Truck,
  MapPin, ArrowRight, Timer
} from 'lucide-react';
import {
  getEWayBills, getEWBSummary, fmtEWBAmount, getTransportLabel,
  type EWBStatus, type EWayBill
} from '@/services/eWayBillService';
import { toast } from 'sonner';

const STATUS_CFG: Record<EWBStatus, { label: string; color: string; icon: React.ReactNode }> = {
  generated: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3.5 w-3.5" /> },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <Timer className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: <XCircle className="h-3.5 w-3.5" /> },
  updated: { label: 'Updated', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const EWayBillDashboard = () => {
  const [bills, setBills] = useState(getEWayBills());
  const summary = getEWBSummary();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<EWBStatus | 'all'>('all');
  const [detailBill, setDetailBill] = useState<EWayBill | null>(null);

  const filtered = filter === 'all' ? bills : bills.filter(e => e.status === filter);
  const pendingIds = bills.filter(e => e.status === 'pending').map(e => e.id);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const generateEWB = (ids: string[]) => {
    setBills(prev => prev.map(b => {
      if (!ids.includes(b.id) || b.status !== 'pending') return b;
      const no = `3210 ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')} ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      const validDays = Math.ceil(b.distance / 200) + 1;
      const validDate = new Date('2026-04-15');
      validDate.setDate(validDate.getDate() + validDays);
      return {
        ...b, status: 'generated' as const, ewbNo: no,
        ewbDate: '2026-04-15',
        validUpto: validDate.toISOString().split('T')[0],
        daysRemaining: validDays,
      };
    }));
    setSelected(new Set());
    toast.success(`Generated E-Way Bill for ${ids.length} invoice(s)`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">E-Way Bill Management</h2>
          <p className="text-sm text-muted-foreground">Generate, track & manage E-Way Bills</p>
        </div>
        {selected.size > 0 && (
          <Button size="sm" onClick={() => generateEWB(Array.from(selected))}>
            <Zap className="h-4 w-4 mr-1" /> Generate ({selected.size})
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold mt-1">{summary.total}</p>
          </CardContent>
        </Card>
        {(['generated', 'pending', 'expired', 'cancelled'] as EWBStatus[]).map(s => {
          const cfg = STATUS_CFG[s];
          const count = summary[s as keyof typeof summary] as number;
          return (
            <Card key={s} className={`cursor-pointer transition-all ${filter === s ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(f => f === s ? 'all' : s)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">{cfg.icon}<span className="text-xs font-medium">{cfg.label}</span></div>
                <p className="text-xl font-bold">{count}</p>
                {s === 'generated' && summary.expiringToday > 0 && (
                  <p className="text-[10px] text-orange-500 mt-0.5">⚠ {summary.expiringToday} expiring today</p>
                )}
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
                <th className="p-3 w-8"><Checkbox checked={selected.size > 0 && selected.size === pendingIds.length} onCheckedChange={() => { selected.size === pendingIds.length ? setSelected(new Set()) : setSelected(new Set(pendingIds)); }} /></th>
                <th className="text-left p-3 font-medium">Invoice</th>
                <th className="text-left p-3 font-medium">Route</th>
                <th className="text-left p-3 font-medium">Transport</th>
                <th className="text-right p-3 font-medium">Value</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">E-Way Bill</th>
                <th className="text-center p-3 font-medium">Validity</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const cfg = STATUS_CFG[b.status];
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      {b.status === 'pending' && <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleSelect(b.id)} />}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{b.invoiceNo}</p>
                      <p className="text-[10px] text-muted-foreground">{b.partyName}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{b.fromCity}, {b.fromState}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span>{b.toCity}, {b.toState}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{b.distance} km</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs">{getTransportLabel(b.transportMode)}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{b.vehicleNo}</p>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">{fmtEWBAmount(b.invoiceValue)}</td>
                    <td className="p-3 text-center">
                      <Badge className={`${cfg.color} text-[10px] gap-1`}>{cfg.icon}{cfg.label}</Badge>
                    </td>
                    <td className="p-3">
                      {b.ewbNo ? (
                        <button className="font-mono text-xs hover:text-primary" onClick={() => setDetailBill(b)}>{b.ewbNo}</button>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {b.status === 'generated' && b.daysRemaining != null && (
                        <span className={`text-xs font-medium ${b.daysRemaining <= 1 ? 'text-red-600' : b.daysRemaining <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                          {b.daysRemaining === 0 ? 'Expires today' : `${b.daysRemaining}d left`}
                        </span>
                      )}
                      {b.status === 'expired' && <span className="text-[10px] text-red-600">Expired</span>}
                    </td>
                    <td className="p-3 text-center">
                      {b.status === 'pending' && (
                        <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => generateEWB([b.id])}>
                          <Zap className="h-3 w-3 mr-0.5" /> Generate
                        </Button>
                      )}
                      {b.status === 'generated' && (
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setDetailBill(b)}>
                          <Truck className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailBill} onOpenChange={() => setDetailBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>E-Way Bill Details</DialogTitle></DialogHeader>
          {detailBill && (
            <div className="space-y-4 text-sm">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">E-Way Bill No</p>
                <p className="text-lg font-bold font-mono mt-1">{detailBill.ewbNo}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Invoice</p><p className="font-medium">{detailBill.invoiceNo}</p></div>
                <div><p className="text-xs text-muted-foreground">Party</p><p>{detailBill.partyName}</p></div>
                <div><p className="text-xs text-muted-foreground">Value</p><p className="font-mono font-semibold">{fmtINR(detailBill.invoiceValue)}</p></div>
                <div><p className="text-xs text-muted-foreground">Distance</p><p>{detailBill.distance} km</p></div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{detailBill.fromCity}, {detailBill.fromState}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{detailBill.toCity}, {detailBill.toState}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Transport</p><p>{getTransportLabel(detailBill.transportMode)}</p></div>
                <div><p className="text-xs text-muted-foreground">Vehicle</p><p className="font-mono">{detailBill.vehicleNo}</p></div>
                <div><p className="text-xs text-muted-foreground">Generated</p><p>{detailBill.ewbDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Valid Upto</p>
                  <p className={detailBill.daysRemaining != null && detailBill.daysRemaining <= 1 ? 'text-red-600 font-semibold' : ''}>
                    {detailBill.validUpto}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailBill(null)}>Close</Button>
            <Button variant="outline" onClick={() => { toast.success('Vehicle details updated'); setDetailBill(null); }}>Update Part-B</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EWayBillDashboard;
