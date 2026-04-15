import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus, ChevronRight, ChevronDown, Package, Layers, Factory, TrendingUp
} from 'lucide-react';
import {
  getBOMs, getProductionOrders, fmtMfgAmt, ORDER_STATUS_CONFIG,
  type BOM, type BOMComponent
} from '@/services/manufacturingService';
import { toast } from 'sonner';

/* ── BOM Tree Node ── */
const BOMNode = ({ node, depth = 0 }: { node: BOMComponent; depth?: number }) => {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 text-sm cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : <span className="w-3.5" />}
        <Package className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium flex-1">{node.itemName}</span>
        <span className="text-muted-foreground text-xs">x{node.quantity} {node.unit}</span>
        <span className="font-mono text-xs w-20 text-right">{fmtMfgAmt(node.unitCost)}</span>
        <span className="font-mono text-xs w-24 text-right font-semibold">{fmtMfgAmt(node.totalCost)}</span>
      </div>
      {hasChildren && open && node.children!.map(c => <BOMNode key={c.id} node={c} depth={depth + 1} />)}
    </div>
  );
};

/* ── BOM Card ── */
const BOMCard = ({ bom, selected, onSelect }: { bom: BOM; selected: boolean; onSelect: () => void }) => (
  <Card className={`cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`} onClick={onSelect}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        {bom.finishedGood}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Cost</span>
        <span className="font-mono font-semibold">{fmtMfgAmt(bom.totalCost)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Sell Price</span>
        <span className="font-mono">{fmtMfgAmt(bom.sellPrice)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Margin</span>
        <Badge variant="outline" className="text-green-600 dark:text-green-400 text-[10px]">
          {fmtMfgAmt(bom.margin)} ({bom.marginPct}%)
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{bom.components.length} components</p>
    </CardContent>
  </Card>
);

const ManufacturingDashboard = () => {
  const boms = getBOMs();
  const orders = getProductionOrders();
  const [selectedBom, setSelectedBom] = useState<string>(boms[0]?.id || '');
  const activeBom = boms.find(b => b.id === selectedBom);

  const totalPlanned = orders.filter(o => o.status === 'planned').length;
  const totalInProgress = orders.filter(o => o.status === 'in_progress').length;
  const totalCompleted = orders.filter(o => o.status === 'completed').length;
  const avgWastage = orders.filter(o => o.wastagePct).reduce((s, o) => s + (o.wastagePct || 0), 0) / (orders.filter(o => o.wastagePct).length || 1);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Manufacturing & BOM</h2>
          <p className="text-sm text-muted-foreground">Bill of Materials, production orders & cost analysis</p>
        </div>
        <Button size="sm" onClick={() => toast.info('BOM builder coming soon')}>
          <Plus className="h-4 w-4 mr-1" /> New BOM
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{boms.length}</p>
          <p className="text-xs text-muted-foreground">BOMs Defined</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalInProgress}</p>
          <p className="text-xs text-muted-foreground">In Production</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{avgWastage.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Avg Wastage</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="bom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="orders">Production Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        </TabsList>

        {/* BOM Tab */}
        <TabsContent value="bom">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-3">
              {boms.map(b => (
                <BOMCard key={b.id} bom={b} selected={selectedBom === b.id} onSelect={() => setSelectedBom(b.id)} />
              ))}
            </div>
            <div className="md:col-span-2">
              {activeBom ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4" /> {activeBom.finishedGood} — Component Tree
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2 px-2">
                      <span className="flex-1">Component</span>
                      <span className="w-16 text-right">Qty</span>
                      <span className="w-20 text-right">Unit Cost</span>
                      <span className="w-24 text-right">Total</span>
                    </div>
                    {activeBom.components.map(c => <BOMNode key={c.id} node={c} />)}
                    <div className="border-t mt-3 pt-3 flex justify-between text-sm font-semibold px-2">
                      <span>Production Cost</span>
                      <span className="font-mono">{fmtMfgAmt(activeBom.totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm px-2 mt-1">
                      <span className="text-muted-foreground">Sell Price</span>
                      <span className="font-mono">{fmtMfgAmt(activeBom.sellPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm px-2 mt-1">
                      <span className="text-green-600 dark:text-green-400">Margin</span>
                      <span className="font-mono text-green-600 dark:text-green-400">{fmtMfgAmt(activeBom.margin)} ({activeBom.marginPct}%)</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => toast.success(`Production started for ${activeBom.finishedGood}`)}>
                        <Factory className="h-3.5 w-3.5 mr-1" /> Start Production
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info('Edit BOM coming soon')}>Edit BOM</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card><CardContent className="py-12 text-center text-muted-foreground">Select a BOM to view details</CardContent></Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Production Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Factory className="h-4 w-4" /> Production Orders</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Order #</th>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-left p-3 font-medium">Start</th>
                    <th className="text-left p-3 font-medium">End</th>
                    <th className="text-right p-3 font-medium">Est. Cost</th>
                    <th className="text-right p-3 font-medium">Actual</th>
                    <th className="text-right p-3 font-medium">Wastage</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const cfg = ORDER_STATUS_CONFIG[o.status];
                    return (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs font-medium">{o.orderNo}</td>
                        <td className="p-3 font-medium">{o.finishedGood}</td>
                        <td className="p-3 text-right font-mono">{o.quantity} {o.unit}</td>
                        <td className="p-3 text-xs">{o.startDate}</td>
                        <td className="p-3 text-xs">{o.endDate || '—'}</td>
                        <td className="p-3 text-right font-mono">{fmtMfgAmt(o.estimatedCost)}</td>
                        <td className="p-3 text-right font-mono">{o.actualCost ? fmtMfgAmt(o.actualCost) : '—'}</td>
                        <td className="p-3 text-right font-mono text-xs">{o.wastagePct ? `${o.wastagePct}%` : '—'}</td>
                        <td className="p-3 text-center"><Badge className={`${cfg.color} text-[10px]`}>{cfg.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis */}
        <TabsContent value="cost">
          <div className="grid md:grid-cols-2 gap-4">
            {boms.map(b => (
              <Card key={b.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> {b.finishedGood}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {b.components.map(c => {
                      const pct = (c.totalCost / b.totalCost) * 100;
                      return (
                        <div key={c.id}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span>{c.itemName}</span>
                            <span className="font-mono">{fmtMfgAmt(c.totalCost)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm">
                    <span className="font-semibold">Total Cost</span>
                    <span className="font-mono font-semibold">{fmtMfgAmt(b.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Margin</span>
                    <span className="font-mono">{fmtMfgAmt(b.margin)} ({b.marginPct}%)</span>
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

export default ManufacturingDashboard;
