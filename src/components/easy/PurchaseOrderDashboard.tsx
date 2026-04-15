import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getPurchaseOrders, getVendorScores, PO_STATUS_CONFIG, PO_PIPELINE, fmtPOAmt,
  type PurchaseOrder, type POStatus,
} from '@/services/purchaseOrderService';
import { Search, FileText, TrendingUp, ShoppingCart, ArrowRight, Star } from 'lucide-react';

const PurchaseOrderDashboard = () => {
  const orders = getPurchaseOrders();
  const vendors = getVendorScores();
  const [search, setSearch] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const pipeline = useMemo(() => {
    const map: Record<POStatus, PurchaseOrder[]> = {
      draft: [], approved: [], sent: [], partial: [], received: [], invoiced: [], cancelled: [],
    };
    orders.forEach(o => map[o.status].push(o));
    return map;
  }, [orders]);

  const totalValue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const openValue = orders.filter(o => !['invoiced', 'cancelled'].includes(o.status)).reduce((s, o) => s + o.totalAmount, 0);

  const filtered = orders.filter(o =>
    o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total POs</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">{fmtPOAmt(totalValue)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Open Value</p>
          <p className="text-2xl font-bold text-yellow-600">{fmtPOAmt(openValue)}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Pending Receipt</p>
          <p className="text-2xl font-bold text-blue-600">{orders.filter(o => ['sent', 'partial'].includes(o.status)).length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline"><ShoppingCart className="h-4 w-4 mr-1" />Pipeline</TabsTrigger>
          <TabsTrigger value="list"><FileText className="h-4 w-4 mr-1" />All Orders</TabsTrigger>
          <TabsTrigger value="vendors"><TrendingUp className="h-4 w-4 mr-1" />Vendor Score</TabsTrigger>
        </TabsList>

        {/* Pipeline Kanban */}
        <TabsContent value="pipeline">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PO_PIPELINE.map(status => (
              <div key={status} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={PO_STATUS_CONFIG[status].color}>{PO_STATUS_CONFIG[status].label}</Badge>
                  <span className="text-xs text-muted-foreground">{pipeline[status].length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {pipeline[status].map(po => (
                    <Card key={po.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPO(po)}>
                      <CardContent className="p-3 space-y-1">
                        <p className="font-mono text-xs font-medium">{po.poNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{po.vendorName}</p>
                        <p className="text-sm font-semibold">{fmtPOAmt(po.totalAmount)}</p>
                        {po.status === 'partial' && (
                          <Progress value={
                            (po.items.reduce((s, i) => s + i.receivedQty, 0) /
                            po.items.reduce((s, i) => s + i.quantity, 0)) * 100
                          } className="h-1.5" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* All Orders */}
        <TabsContent value="list" className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search PO or vendor…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>PO #</TableHead><TableHead>Date</TableHead><TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Amount</TableHead>
                <TableHead>Fulfillment</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(po => {
                  const totalQty = po.items.reduce((s, i) => s + i.quantity, 0);
                  const rcvQty = po.items.reduce((s, i) => s + i.receivedQty, 0);
                  const pct = totalQty ? Math.round((rcvQty / totalQty) * 100) : 0;
                  return (
                    <TableRow key={po.id} className="cursor-pointer" onClick={() => setSelectedPO(po)}>
                      <TableCell className="font-mono text-xs">{po.poNumber}</TableCell>
                      <TableCell className="text-xs">{po.date}</TableCell>
                      <TableCell>{po.vendorName}</TableCell>
                      <TableCell><Badge className={PO_STATUS_CONFIG[po.status].color}>{PO_STATUS_CONFIG[po.status].label}</Badge></TableCell>
                      <TableCell className="text-xs">{po.dueDate}</TableCell>
                      <TableCell className="text-right font-medium">{fmtPOAmt(po.totalAmount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Vendor Scorecard */}
        <TabsContent value="vendors">
          <div className="grid md:grid-cols-2 gap-4">
            {vendors.map(v => (
              <Card key={v.vendor}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{v.vendor}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Orders</p>
                      <p className="font-semibold">{v.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Delivery</p>
                      <p className="font-semibold">{v.avgDeliveryDays} days</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>On-Time Delivery</span><span>{v.onTimeDelivery}%</span>
                    </div>
                    <Progress value={v.onTimeDelivery} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />Quality Score</span>
                      <span>{v.qualityScore}%</span>
                    </div>
                    <Progress value={v.qualityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* PO Detail modal-like panel */}
      {selectedPO && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{selectedPO.poNumber} — {selectedPO.vendorName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={PO_STATUS_CONFIG[selectedPO.status].color}>{PO_STATUS_CONFIG[selectedPO.status].label}</Badge>
              {['received', 'partial'].includes(selectedPO.status) && (
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <ArrowRight className="h-3 w-3" />Convert to Invoice
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setSelectedPO(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Item</TableHead><TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Received</TableHead><TableHead>Unit</TableHead>
                  <TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {selectedPO.items.map(item => {
                    const pct = item.quantity ? Math.round((item.receivedQty / item.quantity) * 100) : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.receivedQty}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{fmtPOAmt(item.rate)}</TableCell>
                        <TableCell className="text-right font-medium">{fmtPOAmt(item.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-xs">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-2">
              <p className="text-sm font-semibold">Total: {fmtPOAmt(selectedPO.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrderDashboard;
