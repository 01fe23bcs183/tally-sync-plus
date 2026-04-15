import { useState } from 'react';
import { useVouchers } from '@/hooks/useTallyData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoucherType } from '@/types/tally';
import VoucherEntryForm from './VoucherEntryForm';
import { useQueryClient } from '@tanstack/react-query';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const voucherTypes: VoucherType[] = ['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra'];

const typeColors: Record<string, string> = {
  Sales: 'bg-green-100 text-green-800',
  Purchase: 'bg-red-100 text-red-800',
  Receipt: 'bg-blue-100 text-blue-800',
  Payment: 'bg-orange-100 text-orange-800',
  Journal: 'bg-gray-100 text-gray-800',
  Contra: 'bg-purple-100 text-purple-800',
};

const EasyVouchers = () => {
  const { data: vouchers = [] } = useVouchers();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const filtered = vouchers
    .filter(v => filterType === 'all' || v.voucherType === filterType)
    .filter(v =>
      v.narration.toLowerCase().includes(search.toLowerCase()) ||
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.partyName || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (showForm) {
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <VoucherEntryForm
          onClose={() => setShowForm(false)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['vouchers'] })}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vouchers</h2>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Voucher
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vouchers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>All</Button>
          {voucherTypes.map(t => (
            <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)}>{t}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Party / Narration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v.id} className="cursor-pointer hover:bg-accent/50">
                  <TableCell className="text-sm">{v.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[v.voucherType] || ''}`}>
                      {v.voucherType}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{v.voucherNumber}</TableCell>
                  <TableCell className="text-sm">{v.partyName || v.narration}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(v.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={v.syncStatus === 'synced' ? 'secondary' : v.syncStatus === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">
                      {v.syncStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No vouchers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EasyVouchers;
