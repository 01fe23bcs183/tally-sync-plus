import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getReorderItems, URGENCY_CONFIG, fmtReorderAmt, type ReorderUrgency
} from '@/services/reorderAlertService';
import { AlertTriangle, ShoppingCart, TrendingUp, Clock, Bell, Package } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const ReorderAlertDashboard = () => {
  const items = getReorderItems();
  const [filterUrgency, setFilterUrgency] = useState<ReorderUrgency | 'all'>('all');

  const filtered = useMemo(() => {
    return filterUrgency === 'all' ? items : items.filter(i => i.urgency === filterUrgency);
  }, [items, filterUrgency]);

  const criticalItems = items.filter(i => i.urgency === 'critical');
  const lowItems = items.filter(i => i.urgency === 'low');
  const warningItems = items.filter(i => i.urgency === 'warning');
  const needsOrder = items.filter(i => i.suggestedOrderQty > 0);
  const totalPOValue = needsOrder.reduce((s, i) => s + i.suggestedOrderQty * i.lastPrice, 0);

  const handleCreatePO = (item: typeof items[0]) => {
    toast.success(`Draft PO created for ${item.itemName}`, {
      description: `${item.suggestedOrderQty} ${item.unit} from ${item.preferredSupplier} · ${fmtReorderAmt(item.suggestedOrderQty * item.lastPrice)}`,
    });
  };

  const handleBulkPO = () => {
    toast.success(`${needsOrder.length} Draft POs created`, {
      description: `Total value: ${fmtReorderAmt(totalPOValue)}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reorder Alerts</h2>
          <p className="text-sm text-muted-foreground">Smart stock monitoring & auto-PO suggestions</p>
        </div>
        {needsOrder.length > 0 && (
          <Button onClick={handleBulkPO} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Generate {needsOrder.length} POs · {fmtReorderAmt(totalPOValue)}
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-destructive/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{criticalItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10"><Bell className="h-5 w-5 text-orange-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Warning</p>
                <p className="text-2xl font-bold">{warningItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><ShoppingCart className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Suggested PO Value</p>
                <p className="text-xl font-bold">{fmtReorderAmt(totalPOValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical alerts */}
      {criticalItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Critical — Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {criticalItems.map(item => (
                <Card key={item.id} className="border-destructive/20">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.itemName}</span>
                      <Badge className={URGENCY_CONFIG.critical.color}>Critical</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className="font-medium text-destructive">{item.currentStock} / {item.reorderLevel} {item.unit}</span>
                      </div>
                      <Progress value={(item.currentStock / item.maximumLevel) * 100} className="h-2" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>~{item.daysOfStock} days left</span>
                      <span>Lead: {item.leadTimeDays}d</span>
                    </div>
                    <Button size="sm" className="w-full gap-1" onClick={() => handleCreatePO(item)}>
                      <ShoppingCart className="h-3 w-3" />
                      Order {item.suggestedOrderQty} {item.unit} from {item.preferredSupplier}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Summary</TabsTrigger>
        </TabsList>

        {/* All items with filters */}
        <TabsContent value="all">
          <div className="flex gap-2 mb-4">
            <Badge
              className={`cursor-pointer ${filterUrgency === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setFilterUrgency('all')}
            >All ({items.length})</Badge>
            {(Object.keys(URGENCY_CONFIG) as ReorderUrgency[]).map(u => {
              const count = items.filter(i => i.urgency === u).length;
              return (
                <Badge
                  key={u}
                  className={`cursor-pointer ${filterUrgency === u ? URGENCY_CONFIG[u].color : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setFilterUrgency(u)}
                >{URGENCY_CONFIG[u].icon} {URGENCY_CONFIG[u].label} ({count})</Badge>
              );
            })}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Reorder Lvl</TableHead>
                    <TableHead className="text-right">Min / Max</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Days Left</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Order Qty</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{item.itemName}</span>
                          <p className="text-xs text-muted-foreground">{item.group}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.currentStock} {item.unit}</TableCell>
                      <TableCell className="text-right">{item.reorderLevel}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{item.minimumLevel} / {item.maximumLevel}</TableCell>
                      <TableCell>
                        <div className="min-w-[100px]">
                          <Progress value={(item.currentStock / item.maximumLevel) * 100} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.daysOfStock <= 5 ? 'text-destructive font-medium' : item.daysOfStock <= 14 ? 'text-yellow-600' : ''}>
                          {item.daysOfStock}d
                        </span>
                      </TableCell>
                      <TableCell><Badge className={URGENCY_CONFIG[item.urgency].color}>{URGENCY_CONFIG[item.urgency].label}</Badge></TableCell>
                      <TableCell className="text-sm">{item.preferredSupplier}</TableCell>
                      <TableCell className="text-right font-medium">{item.suggestedOrderQty > 0 ? item.suggestedOrderQty : '—'}</TableCell>
                      <TableCell>
                        {item.suggestedOrderQty > 0 && (
                          <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => handleCreatePO(item)}>
                            <ShoppingCart className="h-3 w-3" /> PO
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demand Forecast */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Consumption Trends & Forecast</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    {MONTHS.map(m => <TableHead key={m} className="text-center text-xs">{m}</TableHead>)}
                    <TableHead className="text-center text-xs font-bold">Forecast</TableHead>
                    <TableHead className="text-right">Daily Avg</TableHead>
                    <TableHead className="text-right">Safety Stock</TableHead>
                    <TableHead className="text-right">Smart Reorder Pt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => {
                    const max = Math.max(...item.monthlyConsumption, item.forecastNextMonth, 1);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.itemName}</TableCell>
                        {item.monthlyConsumption.map((v, idx) => (
                          <TableCell key={idx} className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-6 bg-muted rounded-sm overflow-hidden" style={{ height: 28 }}>
                                <div
                                  className="w-full rounded-sm"
                                  style={{
                                    height: `${(v / max) * 100}%`,
                                    backgroundColor: 'hsl(var(--primary))',
                                    marginTop: `${100 - (v / max) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{v}</span>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-6 bg-muted rounded-sm overflow-hidden" style={{ height: 28 }}>
                              <div
                                className="w-full rounded-sm"
                                style={{
                                  height: `${(item.forecastNextMonth / max) * 100}%`,
                                  backgroundColor: 'hsl(var(--primary) / 0.5)',
                                  marginTop: `${100 - (item.forecastNextMonth / max) * 100}%`,
                                  border: '1px dashed hsl(var(--primary))',
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold">{item.forecastNextMonth}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{item.avgDailyConsumption}/d</TableCell>
                        <TableCell className="text-right text-sm">{item.safetyStock}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{item.smartReorderPoint}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Summary */}
        <TabsContent value="suppliers">
          <div className="grid grid-cols-2 gap-4">
            {Array.from(new Set(items.map(i => i.preferredSupplier))).map(supplier => {
              const supplierItems = items.filter(i => i.preferredSupplier === supplier);
              const needsReorder = supplierItems.filter(i => i.suggestedOrderQty > 0);
              const poValue = needsReorder.reduce((s, i) => s + i.suggestedOrderQty * i.lastPrice, 0);
              return (
                <Card key={supplier}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{supplier}</span>
                      <Badge className="bg-muted text-muted-foreground">{supplierItems.length} items</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {needsReorder.length > 0 ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pending PO Value</span>
                          <span className="font-bold">{fmtReorderAmt(poValue)}</span>
                        </div>
                        <div className="space-y-2">
                          {needsReorder.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-xs">{URGENCY_CONFIG[item.urgency].icon}</span>
                                <span>{item.itemName}</span>
                              </div>
                              <span className="text-muted-foreground">{item.suggestedOrderQty} {item.unit} · {fmtReorderAmt(item.suggestedOrderQty * item.lastPrice)}</span>
                            </div>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => toast.success(`Combined PO for ${supplier}`, { description: fmtReorderAmt(poValue) })}>
                          <Package className="h-3 w-3" /> Create Combined PO
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">All items adequately stocked</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReorderAlertDashboard;
