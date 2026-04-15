import { useState } from 'react';
import { useLedgers } from '@/hooks/useTallyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatCurrency = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const EasyLedgers = () => {
  const { data: ledgers = [] } = useLedgers();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'closingBalance'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const groups = [...new Set(ledgers.map(l => l.parent))].sort();

  const filtered = ledgers
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    .filter(l => filterGroup === 'all' || l.parent === filterGroup)
    .sort((a, b) => {
      const val = sortField === 'name'
        ? a.name.localeCompare(b.name)
        : a.closingBalance - b.closingBalance;
      return sortDir === 'asc' ? val : -val;
    });

  const toggleSort = (field: 'name' | 'closingBalance') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ledgers</h2>
        <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Ledger</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ledgers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={filterGroup}
          onChange={e => setFilterGroup(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">All Groups</option>
          {groups.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('closingBalance')}>
                  <span className="flex items-center gap-1 justify-end">Closing Balance <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.name} className="cursor-pointer hover:bg-accent/50">
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{l.parent}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span className={l.openingBalance < 0 ? 'text-red-500' : ''}>
                      {formatCurrency(l.openingBalance)} {l.openingBalance < 0 ? 'Cr' : 'Dr'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    <span className={l.closingBalance < 0 ? 'text-red-500' : ''}>
                      {formatCurrency(l.closingBalance)} {l.closingBalance < 0 ? 'Cr' : 'Dr'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No ledgers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EasyLedgers;
