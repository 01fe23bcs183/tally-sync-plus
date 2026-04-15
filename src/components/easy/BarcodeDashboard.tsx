import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera, Plus, Minus, Trash2, ShoppingCart, ClipboardCheck,
  Barcode, Search
} from 'lucide-react';
import {
  lookupBarcode, searchStockItems, getBarcodeMaster, getDemoStockTake,
  fmtBarAmt, type ScannedItem, type StockBarcode
} from '@/services/barcodeService';
import { toast } from 'sonner';

const BarcodeDashboard = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const stockTake = getDemoStockTake();
  const master = getBarcodeMaster();

  const addItem = (item: StockBarcode) => {
    setScannedItems(prev => {
      const existing = prev.find(s => s.barcode === item.barcode);
      if (existing) {
        return prev.map(s => s.barcode === item.barcode
          ? { ...s, quantity: s.quantity + 1, amount: (s.quantity + 1) * s.rate }
          : s);
      }
      return [...prev, { barcode: item.barcode, stockItem: item.stockItem, quantity: 1, rate: item.rate, amount: item.rate }];
    });
    toast.success(`Added ${item.stockItem}`);
  };

  const updateQty = (barcode: string, delta: number) => {
    setScannedItems(prev => prev.map(s => {
      if (s.barcode !== barcode) return s;
      const qty = Math.max(1, s.quantity + delta);
      return { ...s, quantity: qty, amount: qty * s.rate };
    }));
  };

  const removeItem = (barcode: string) => {
    setScannedItems(prev => prev.filter(s => s.barcode !== barcode));
  };

  const handleManualScan = () => {
    if (!manualCode.trim()) return;
    const item = lookupBarcode(manualCode.trim());
    if (item) { addItem(item); setManualCode(''); }
    else { toast.error('Barcode not found in master'); }
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const random = master[Math.floor(Math.random() * master.length)];
      addItem(random);
      setScanning(false);
    }, 1500);
  };

  const total = scannedItems.reduce((s, i) => s + i.amount, 0);
  const totalQty = scannedItems.reduce((s, i) => s + i.quantity, 0);
  const searchResults = searchQuery.length >= 2 ? searchStockItems(searchQuery) : [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Barcode / QR Scanner</h2>
          <p className="text-sm text-muted-foreground">Scan items for voucher entry or stock take</p>
        </div>
      </div>

      <Tabs defaultValue="scan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scan">Scan to Voucher</TabsTrigger>
          <TabsTrigger value="stocktake">Stock Take</TabsTrigger>
          <TabsTrigger value="master">Barcode Master</TabsTrigger>
        </TabsList>

        {/* Scan to Voucher */}
        <TabsContent value="scan">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scanner */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                    {scanning ? (
                      <>
                        <Camera className="h-12 w-12 text-primary animate-pulse" />
                        <p className="text-sm text-muted-foreground mt-2">Scanning...</p>
                      </>
                    ) : (
                      <>
                        <Camera className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Camera Preview</p>
                        <Button size="sm" className="mt-3" onClick={simulateScan}>
                          <Camera className="h-4 w-4 mr-1" /> Start Scan
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Enter barcode manually..." value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleManualScan()}
                      className="font-mono" />
                    <Button onClick={handleManualScan}><Barcode className="h-4 w-4" /></Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search stock items..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-[150px] overflow-y-auto">
                      {searchResults.map(r => (
                        <button key={r.id} className="w-full flex items-center justify-between p-2 hover:bg-muted/50 text-sm text-left"
                          onClick={() => { addItem(r); setSearchQuery(''); }}>
                          <div>
                            <p className="font-medium">{r.stockItem}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{r.barcode}</p>
                          </div>
                          <span className="font-mono text-xs">{fmtBarAmt(r.rate)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Scanned Items */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Scanned Items ({totalQty})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scannedItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Scan or search items to add</p>
                  ) : (
                    <>
                      {scannedItems.map(item => (
                        <div key={item.barcode} className="flex items-center justify-between p-2 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{item.stockItem}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{item.barcode}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">@ {fmtBarAmt(item.rate)}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.barcode, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(item.barcode, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-mono font-semibold text-sm w-20 text-right">{fmtBarAmt(item.amount)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => removeItem(item.barcode)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold font-mono">{fmtBarAmt(total)}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={() => { toast.success('Items added to voucher'); setScannedItems([]); }}>
                          Add to Voucher
                        </Button>
                        <Button variant="outline" onClick={() => setScannedItems([])}>Clear</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Stock Take */}
        <TabsContent value="stocktake">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" /> Physical Stock Take
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Barcode</th>
                    <th className="text-left p-3 font-medium">Stock Item</th>
                    <th className="text-right p-3 font-medium">Book Stock</th>
                    <th className="text-right p-3 font-medium">Physical</th>
                    <th className="text-right p-3 font-medium">Variance</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockTake.map(st => (
                    <tr key={st.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{st.barcode}</td>
                      <td className="p-3 font-medium">{st.stockItem}</td>
                      <td className="p-3 text-right font-mono">{st.bookStock} {st.unit}</td>
                      <td className="p-3 text-right font-mono">{st.physicalCount} {st.unit}</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {st.variance === 0 ? '—' : (
                          <span className={st.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                            {st.variance > 0 ? '+' : ''}{st.variance}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {st.variance === 0
                          ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]">Match</Badge>
                          : <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]">Variance</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Master */}
        <TabsContent value="master">
          <Card>
            <CardHeader><CardTitle className="text-base">Barcode Master</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Barcode</th>
                    <th className="text-left p-3 font-medium">Stock Item</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Rate</th>
                    <th className="text-center p-3 font-medium">Unit</th>
                    <th className="text-right p-3 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {master.map(b => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-mono text-xs">{b.barcode}</td>
                      <td className="p-3 font-medium">{b.stockItem}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{b.category}</Badge></td>
                      <td className="p-3 text-right font-mono">{fmtBarAmt(b.rate)}</td>
                      <td className="p-3 text-center text-xs">{b.unit}</td>
                      <td className="p-3 text-right font-mono">{b.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarcodeDashboard;
