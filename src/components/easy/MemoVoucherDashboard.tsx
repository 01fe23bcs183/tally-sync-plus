import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  RefreshCw, CheckCircle2, XCircle, Clock,
  AlertTriangle, Plus
} from 'lucide-react';
import {
  getMemoVouchers, getCategoryLabel, formatMemoAmt, MemoVoucher
} from '@/services/memoVoucherService';
import { toast } from 'sonner';

const MemoVoucherDashboard = () => {
  const [memos, setMemos] = useState(getMemoVouchers());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConvert, setShowConvert] = useState(false);
  const [convertTarget, setConvertTarget] = useState<MemoVoucher[]>([]);
  const [converted, setConverted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'converted' | 'cancelled'>('pending');

  const pending = memos.filter(m => m.status === 'pending');
  const filtered = filter === 'all' ? memos : memos.filter(m => m.status === filter);
  const totalPending = pending.reduce((s, m) => s + m.amount, 0);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAll = () => {
    const pendingFiltered = filtered.filter(m => m.status === 'pending');
    if (selected.size === pendingFiltered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingFiltered.map(m => m.id)));
    }
  };

  const handleConvert = (targets: MemoVoucher[]) => {
    setConvertTarget(targets);
    setShowConvert(true);
    setConverted(false);
  };

  const confirmConvert = () => {
    const ids = new Set(convertTarget.map(t => t.id));
    setMemos(prev => prev.map(m => ids.has(m.id) ? { ...m, status: 'converted' as const } : m));
    setSelected(new Set());
    setConverted(true);
    toast.success(`Converted ${convertTarget.length} memo voucher(s) to regular vouchers`);
  };

  const handleCancel = (id: string) => {
    setMemos(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' as const } : m));
    toast.success('Memo voucher cancelled');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'converted') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === 'cancelled') return <XCircle className="h-4 w-4 text-muted-foreground" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Memorandum Vouchers</h2>
          <p className="text-sm text-muted-foreground">Non-accounting provisional entries & conversion</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Memo</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Memos</p>
            <p className="text-xl font-bold mt-1">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Amount</p>
            <p className="text-xl font-bold mt-1">{formatMemoAmt(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Overdue (&gt;15 days)</p>
            <p className="text-xl font-bold mt-1 text-orange-500">
              {pending.filter(m => m.agingDays > 15).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Converted</p>
            <p className="text-xl font-bold mt-1 text-green-600">
              {memos.filter(m => m.status === 'converted').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Bulk Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {(['pending', 'converted', 'cancelled', 'all'] as const).map(f => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" className="text-xs h-7 capitalize" onClick={() => { setFilter(f); setSelected(new Set()); }}>
              {f}
            </Button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleConvert(pending.filter(m => selected.has(m.id)))}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Convert Selected ({selected.size})
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                {filter === 'pending' && (
                  <th className="p-3 w-8">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === filtered.filter(m => m.status === 'pending').length}
                      onCheckedChange={selectAll}
                    />
                  </th>
                )}
                <th className="text-left p-3 font-medium">Memo #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Party / Narration</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-center p-3 font-medium">Age</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                  {filter === 'pending' && (
                    <td className="p-3">
                      {m.status === 'pending' && (
                        <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
                      )}
                    </td>
                  )}
                  <td className="p-3 font-medium">{m.memoNumber}</td>
                  <td className="p-3 text-xs">{m.date}</td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{m.voucherType}</Badge></td>
                  <td className="p-3">
                    <p className="font-medium text-sm">{m.partyName || m.narration.slice(0, 30)}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.narration}</p>
                  </td>
                  <td className="p-3"><Badge variant="secondary" className="text-[10px]">{getCategoryLabel(m.category)}</Badge></td>
                  <td className="p-3 text-right font-mono font-semibold">{formatMemoAmt(m.amount)}</td>
                  <td className="p-3 text-center">
                    {m.status === 'pending' && m.agingDays > 15 ? (
                      <span className="text-orange-500 text-xs font-medium flex items-center justify-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" />{m.agingDays}d
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{m.agingDays}d</span>
                    )}
                  </td>
                  <td className="p-3 text-center"><StatusIcon status={m.status} /></td>
                  <td className="p-3 text-center">
                    {m.status === 'pending' && (
                      <div className="flex gap-1 justify-center">
                        <Button variant="outline" size="sm" className="text-xs h-6 px-2" onClick={() => handleConvert([m])}>
                          <RefreshCw className="h-3 w-3 mr-0.5" /> Convert
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-muted-foreground" onClick={() => handleCancel(m.id)}>
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {m.status === 'converted' && <span className="text-xs text-green-600">Done</span>}
                    {m.status === 'cancelled' && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No {filter} memo vouchers</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Conversion Dialog */}
      <Dialog open={showConvert} onOpenChange={setShowConvert}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Memo to Regular Voucher</DialogTitle>
          </DialogHeader>
          {converted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
              <p className="font-semibold">{convertTarget.length} voucher(s) converted</p>
              <p className="text-sm text-muted-foreground">
                Memo entries have been converted to regular accounting vouchers and synced to Tally.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The following memo vouchers will be converted to regular accounting entries:
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {convertTarget.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div>
                      <p className="font-medium">{m.memoNumber} — {m.voucherType}</p>
                      <p className="text-xs text-muted-foreground">{m.partyName || m.narration.slice(0, 40)}</p>
                    </div>
                    <span className="font-mono font-semibold">{formatMemoAmt(m.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
                <p>• Entries will appear in regular voucher registers</p>
                <p>• Ledger balances will be updated</p>
                <p>• Original memo will be marked as converted</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {converted ? (
              <Button onClick={() => setShowConvert(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowConvert(false)}>Cancel</Button>
                <Button onClick={confirmConvert}>Convert {convertTarget.length} Voucher(s)</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoVoucherDashboard;
