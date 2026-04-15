import { useStockItems } from '@/hooks/useTallyData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const EasyInventory = () => {
  const { data: items = [] } = useStockItems();
  const [search, setSearch] = useState('');

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.parent.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = items.reduce((s, i) => s + i.closingValue, 0);

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Stock Value</p>
          <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search stock items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Opening Qty</TableHead>
                <TableHead className="text-right">Closing Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {item.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.parent}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right font-mono">{item.openingBalance}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{item.closingBalance}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(item.closingRate)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatCurrency(item.closingValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EasyInventory;
