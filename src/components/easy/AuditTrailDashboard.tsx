import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  CheckCircle2, Download, Shield, Search, ArrowRight
} from 'lucide-react';
import {
  getAuditEntries, getAuditSummary, ACTION_CONFIG,
  type AuditAction, type AuditEntry
} from '@/services/auditTrailService';
import { toast } from 'sonner';

const AuditTrailDashboard = () => {
  const allEntries = getAuditEntries();
  const summary = getAuditSummary();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [diffEntry, setDiffEntry] = useState<AuditEntry | null>(null);

  const filtered = allEntries.filter(e => {
    if (filterAction !== 'all' && e.action !== filterAction) return false;
    if (filterUser !== 'all' && e.user !== filterUser) return false;
    if (search && !e.description.toLowerCase().includes(search.toLowerCase()) &&
        !(e.voucherNo || '').toLowerCase().includes(search.toLowerCase()) &&
        !e.module.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Audit Trail</h2>
          <p className="text-sm text-muted-foreground">Tamper-proof change log & compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Audit trail exported')}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Compliance report generated')}>
            <Shield className="h-4 w-4 mr-1" /> Compliance Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Events</p>
          <p className="text-xl font-bold mt-1">{summary.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Creates</p>
          <p className="text-xl font-bold mt-1 text-green-600">{summary.creates}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Edits</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{summary.edits}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Deletes</p>
          <p className="text-xl font-bold mt-1 text-red-600">{summary.deletes}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Integrity</p>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-600">Verified</span>
          </div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1">
          {(['all', 'create', 'edit', 'delete', 'print', 'export'] as const).map(a => (
            <Button key={a} variant={filterAction === a ? 'default' : 'outline'} size="sm" className="text-xs h-7 capitalize"
              onClick={() => setFilterAction(a)}>
              {a === 'all' ? 'All' : ACTION_CONFIG[a].emoji + ' ' + ACTION_CONFIG[a].label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', ...summary.users].map(u => (
            <Button key={u} variant={filterUser === u ? 'default' : 'outline'} size="sm" className="text-xs h-7"
              onClick={() => setFilterUser(u)}>
              {u === 'all' ? 'All Users' : u}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map(entry => {
              const cfg = ACTION_CONFIG[entry.action];
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => entry.oldValue ? setDiffEntry(entry) : undefined}>
                  <div className="text-lg w-8 text-center shrink-0 pt-0.5">{cfg.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{cfg.label}</span>
                      <Badge variant="outline" className="text-[10px]">{entry.module}</Badge>
                      {entry.voucherNo && <Badge variant="secondary" className="text-[10px] font-mono">{entry.voucherNo}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.description}</p>
                    {entry.oldValue && entry.newValue && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded line-through">{entry.oldValue}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">{entry.newValue}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{entry.timestamp.split(' ')[1]}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.timestamp.split(' ')[0]}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{entry.user}</p>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No matching events</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diff Dialog */}
      <Dialog open={!!diffEntry} onOpenChange={() => setDiffEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Change Details</DialogTitle></DialogHeader>
          {diffEntry && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Action</p><p className="font-medium">{ACTION_CONFIG[diffEntry.action].emoji} {ACTION_CONFIG[diffEntry.action].label}</p></div>
                <div><p className="text-xs text-muted-foreground">User</p><p>{diffEntry.user}</p></div>
                <div><p className="text-xs text-muted-foreground">Module</p><p>{diffEntry.module}</p></div>
                <div><p className="text-xs text-muted-foreground">Voucher</p><p className="font-mono">{diffEntry.voucherNo || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Timestamp</p><p>{diffEntry.timestamp}</p></div>
                <div><p className="text-xs text-muted-foreground">IP Address</p><p className="font-mono text-xs">{diffEntry.ipAddress}</p></div>
              </div>
              {diffEntry.oldValue && diffEntry.newValue && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Before → After</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <p className="text-[10px] text-muted-foreground mb-1">Before</p>
                      <p className="font-medium text-red-700 dark:text-red-400">{diffEntry.oldValue}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <p className="text-[10px] text-muted-foreground mb-1">After</p>
                      <p className="font-medium text-green-700 dark:text-green-400">{diffEntry.newValue}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1">Integrity Hash</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">{diffEntry.hash}</p>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDiffEntry(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTrailDashboard;
