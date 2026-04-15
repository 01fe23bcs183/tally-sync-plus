import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getSalesOrders, getCustomerMetrics, SO_STATUS_CONFIG, SO_PIPELINE,
  fmtSOAmt, type SalesOrder, type SOStatus
} from '@/services/salesOrderService';
import { Package, FileText, Users, TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';

const SalesOrderDashboard = () => {
  const orders = getSalesOrders();
  const customers = getCustomerMetrics();
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const pipelineCounts = useMemo(() => {
    const counts: Record<SOStatus, SalesOrder[]> = {} as any;
    SO_PIPELINE.forEach(s => counts[s] = []);
    orders.forEach(o => { if (counts[o.status]) counts[o.status].push(o); });
    return counts;
  }, [orders]);

  const totalValue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => !['invoiced', 'cancelled'].includes(o.status));
  const pendingValue = pendingOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Orders</h2>
          <p className="text-sm text-muted-foreground">Pipeline tracking & fulfillment</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{fmtSOAmt(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10"><FileText className="h-5 w-5 text-yellow-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Orders</p>
                <p className="text-xl font-bold">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Users className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Value</p>
                <p className="text-xl font-bold">{fmtSOAmt(pendingValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="customers">Customer Metrics</TabsTrigger>
        </TabsList>

        {/* Pipeline Kanban */}
        <TabsContent value="pipeline">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {SO_PIPELINE.map(status => (
              <div key={status} className="min-w-[200px] flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={SO_STATUS_CONFIG[status].color}>{SO_STATUS_CONFIG[status].label}</Badge>
                  <span className="text-xs text-muted-foreground">({pipelineCounts[status].length})</span>
                </div>
                <div className="space-y-2">
                  {pipelineCounts[status].map(order => {
                    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
                    const delQty = order.items.reduce((s, i) => s + i.deliveredQty, 0);
                    const pct = totalQty > 0 ? Math.round((delQty / totalQty) * 100) : 0;
                    return (
                      <Card
                        key={order.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-medium">{order.soNumber}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium truncate">{order.customerName}</p>
                          <p className="text-sm font-bold">{fmtSOAmt(order.totalAmount)}</p>
                          {pct > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Delivered</span><span>{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">Due: {order.deliveryDate}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {pipelineCounts[status].length === 0 && (
                    <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                      No orders
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedOrder && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedOrder.soNumber} — {selectedOrder.customerName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={SO_STATUS_CONFIG[selectedOrder.status].color}>
                      {SO_STATUS_CONFIG[selectedOrder.status].label}
                    </Badge>
                    {selectedOrder.status === 'delivered' && (
                      <Button size="sm" className="gap-1">
                        <ArrowRight className="h-3 w-3" /> Convert to Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Pending</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Fulfillment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map(item => {
                      const pct = Math.round((item.deliveredQty / item.quantity) * 100);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">{item.deliveredQty}</TableCell>
                          <TableCell className="text-right">{item.quantity - item.deliveredQty}</TableCell>
                          <TableCell className="text-right">{fmtSOAmt(item.rate)}</TableCell>
                          <TableCell className="text-right font-medium">{fmtSOAmt(item.amount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Order Date: {selectedOrder.date} · Delivery: {selectedOrder.deliveryDate}
                    {selectedOrder.confirmedBy && ` · Confirmed by ${selectedOrder.confirmedBy}`}
                  </div>
                  <p className="text-lg font-bold">{fmtSOAmt(selectedOrder.totalAmount)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Orders table */}
        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fulfillment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => {
                    const totalQty = o.items.reduce((s, i) => s + i.quantity, 0);
                    const delQty = o.items.reduce((s, i) => s + i.deliveredQty, 0);
                    const pct = totalQty > 0 ? Math.round((delQty / totalQty) * 100) : 0;
                    return (
                      <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelectedOrder(o)}>
                        <TableCell className="font-mono text-xs">{o.soNumber}</TableCell>
                        <TableCell>{o.date}</TableCell>
                        <TableCell className="font-medium">{o.customerName}</TableCell>
                        <TableCell>{o.items.length} items</TableCell>
                        <TableCell className="text-right font-medium">{fmtSOAmt(o.totalAmount)}</TableCell>
                        <TableCell>{o.deliveryDate}</TableCell>
                        <TableCell><Badge className={SO_STATUS_CONFIG[o.status].color}>{SO_STATUS_CONFIG[o.status].label}</Badge></TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Metrics */}
        <TabsContent value="customers">
          <div className="grid grid-cols-2 gap-4">
            {customers.map(c => (
              <Card key={c.customer}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c.customer}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Orders</p>
                      <p className="font-bold">{c.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Revenue</p>
                      <p className="font-bold">{fmtSOAmt(c.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Fulfillment</p>
                      <p className="font-bold">{c.avgFulfillmentDays} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Fulfillment Rate</p>
                      <p className="font-bold">{c.fulfillmentRate}%</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fulfillment Rate</span>
                      <span>{c.fulfillmentRate}%</span>
                    </div>
                    <Progress value={c.fulfillmentRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesOrderDashboard;
