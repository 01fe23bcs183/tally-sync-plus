import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle, Search, Download, Tag
} from 'lucide-react';
import {
  getBatchItems, getBatchSummary, STATUS_CFG,
  type ExpiryStatus
} from '@/services/batchExpiryService';
import { toast } from 'sonner';

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const BatchExpiryDashboard = () => {
  const allItems = getBatchItems();
  const summary = getBatchSummary();
  const [filter, setFilter] = useState<ExpiryStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = allItems.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search && !b.stockItem.toLowerCase().includes(search.toLowerCase()) && !b.batchNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Batch & Expiry Tracker</h2>
          <p className="text-sm text-muted-foreground">FEFO management, expiry alerts & batch analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Batch labels generated')}>
            <Tag className="h-4 w-4 mr-1" /> Print Labels
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Expiry report exported')}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['expired', 'critical', 'warning', 'safe'] as ExpiryStatus[]).map(s => {
          const cfg = STATUS_CFG[s];
          const count = summary[s];
          return (
            <Card key={s} className={`cursor-pointer transition-all ${filter === s ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setFilter(f => f === s ? 'all' : s)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{cfg.dot}</span>
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
                <p className="text-xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Expired Value</p>
            <p className="text-xl font-bold mt-1 text-red-600">{fmtINR(summary.expiredValue)}</p>
          </CardContent>
        </Card>
      </div>

      {(summary.expired > 0 || summary.critical > 0) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span><strong>{summary.expired} expired</strong> and <strong>{summary.critical} critical</strong> batches need immediate attention</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search item or batch..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilter('all')}>
          All ({allItems.length})
        </Badge>
        <span className="text-xs text-muted-foreground">{filtered.length} shown · sorted by expiry (FEFO)</span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-center p-3 font-medium w-10">Status</th>
                <th className="text-left p-3 font-medium">Stock Item</th>
                <th className="text-left p-3 font-medium">Batch</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-right p-3 font-medium">Qty</th>
                <th className="text-left p-3 font-medium">Mfg Date</th>
                <th className="text-left p-3 font-medium">Expiry</th>
                <th className="text-center p-3 font-medium">Days Left</th>
                <th className="text-right p-3 font-medium">Cost</th>
                <th className="text-right p-3 font-medium">Sell</th>
                <th className="text-left p-3 font-medium">Godown</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const cfg = STATUS_CFG[b.status];
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 text-center">{cfg.dot}</td>
                    <td className="p-3 font-medium">{b.stockItem}</td>
                    <td className="p-3 font-mono text-xs">{b.batchNo}</td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{b.category}</Badge></td>
                    <td className="p-3 text-right font-mono">{b.quantity} {b.unit}</td>
                    <td className="p-3 text-xs">{b.mfgDate}</td>
                    <td className="p-3 text-xs">{b.expiryDate}</td>
                    <td className="p-3 text-center">
                      <Badge className={`${cfg.color} text-[10px]`}>
                        {b.daysToExpiry <= 0 ? 'Expired' : `${b.daysToExpiry}d`}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-xs">{fmtINR(b.purchaseRate)}</td>
                    <td className="p-3 text-right font-mono text-xs">{fmtINR(b.sellingRate)}</td>
                    <td className="p-3 text-xs text-muted-foreground">{b.godown}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No matching batches</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchExpiryDashboard;
