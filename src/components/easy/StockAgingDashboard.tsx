import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getStockAgingItems, getAgingBucketSummaries, MOVEMENT_CONFIG, ABC_CONFIG,
  RECOMMENDATION_CONFIG, fmtStockAmt, type MovementClass, type ABCClass
} from '@/services/stockAgingService';
import { AlertTriangle, TrendingDown, Package, DollarSign, BarChart3 } from 'lucide-react';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const StockAgingDashboard = () => {
  const items = getStockAgingItems();
  const bucketSummaries = getAgingBucketSummaries();
  const [filterMovement, setFilterMovement] = useState<MovementClass | 'all'>('all');
  const [filterABC, setFilterABC] = useState<ABCClass | 'all'>('all');

  const filtered = useMemo(() => {
    return items.filter(i =>
      (filterMovement === 'all' || i.movementClass === filterMovement) &&
      (filterABC === 'all' || i.abcClass === filterABC)
    );
  }, [items, filterMovement, filterABC]);

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  const deadStock = items.filter(i => i.movementClass === 'dead');
  const deadValue = deadStock.reduce((s, i) => s + i.value, 0);
  const slowStock = items.filter(i => i.movementClass === 'slow');
  const slowValue = slowStock.reduce((s, i) => s + i.value, 0);
  const totalCarrying = items.reduce((s, i) => s + i.carryingCostPerMonth, 0);

  const maxBucketValue = Math.max(...bucketSummaries.map(b => b.value));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Stock Aging Analysis</h2>
        <p className="text-sm text-muted-foreground">Identify slow-moving & dead stock, optimize inventory</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Stock Value</p>
                <p className="text-xl font-bold">{fmtStockAmt(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Dead Stock</p>
                <p className="text-xl font-bold">{fmtStockAmt(deadValue)}</p>
                <p className="text-xs text-muted-foreground">{deadStock.length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10"><TrendingDown className="h-5 w-5 text-yellow-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Slow Moving</p>
                <p className="text-xl font-bold">{fmtStockAmt(slowValue)}</p>
                <p className="text-xs text-muted-foreground">{slowStock.length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><DollarSign className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Carrying Cost</p>
                <p className="text-xl font-bold">{fmtStockAmt(totalCarrying)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aging">
        <TabsList>
          <TabsTrigger value="aging">Aging Buckets</TabsTrigger>
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="abc">ABC Analysis</TabsTrigger>
          <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
        </TabsList>

        {/* Aging Buckets */}
        <TabsContent value="aging">
          <div className="grid grid-cols-5 gap-4">
            {bucketSummaries.map(b => (
              <Card key={b.bucket}>
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="text-sm font-medium">{b.label}</div>
                  <div className="text-2xl font-bold">{fmtStockAmt(b.value)}</div>
                  <div className="text-xs text-muted-foreground">{b.items} items</div>
                  <div className="space-y-1">
                    <Progress value={(b.value / maxBucketValue) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">{Math.round((b.value / totalValue) * 100)}% of total</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visual bar chart */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Value Distribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {bucketSummaries.map(b => (
                <div key={b.bucket} className="flex items-center gap-3">
                  <span className="text-sm w-24 shrink-0">{b.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-2"
                      style={{ width: `${(b.value / totalValue) * 100}%`, backgroundColor: b.color }}
                    >
                      <span className="text-xs font-medium text-white truncate">{fmtStockAmt(b.value)}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{b.items}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Items */}
        <TabsContent value="items">
          <div className="flex gap-2 mb-4">
            <Badge
              className={`cursor-pointer ${filterMovement === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setFilterMovement('all')}
            >All</Badge>
            {(Object.keys(MOVEMENT_CONFIG) as MovementClass[]).map(mc => (
              <Badge
                key={mc}
                className={`cursor-pointer ${filterMovement === mc ? MOVEMENT_CONFIG[mc].color : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilterMovement(mc)}
              >{MOVEMENT_CONFIG[mc].icon} {MOVEMENT_CONFIG[mc].label}</Badge>
            ))}
            <div className="w-px bg-border mx-1" />
            <Badge
              className={`cursor-pointer ${filterABC === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setFilterABC('all')}
            >All Classes</Badge>
            {(Object.keys(ABC_CONFIG) as ABCClass[]).map(c => (
              <Badge
                key={c}
                className={`cursor-pointer ${filterABC === c ? ABC_CONFIG[c].color : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilterABC(c)}
              >{c}</Badge>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Days Idle</TableHead>
                    <TableHead>Movement</TableHead>
                    <TableHead>ABC</TableHead>
                    <TableHead className="text-right">Carrying/mo</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.group}</TableCell>
                      <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                      <TableCell className="text-right font-medium">{fmtStockAmt(item.value)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.daysSinceMovement > 90 ? 'text-destructive font-medium' : ''}>{item.daysSinceMovement}d</span>
                      </TableCell>
                      <TableCell><Badge className={MOVEMENT_CONFIG[item.movementClass].color}>{MOVEMENT_CONFIG[item.movementClass].label}</Badge></TableCell>
                      <TableCell><Badge className={ABC_CONFIG[item.abcClass].color}>{item.abcClass}</Badge></TableCell>
                      <TableCell className="text-right">{fmtStockAmt(item.carryingCostPerMonth)}</TableCell>
                      <TableCell><Badge className={RECOMMENDATION_CONFIG[item.recommendation].color}>{RECOMMENDATION_CONFIG[item.recommendation].label}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABC Analysis */}
        <TabsContent value="abc">
          <div className="grid grid-cols-3 gap-4">
            {(Object.keys(ABC_CONFIG) as ABCClass[]).map(cls => {
              const classItems = items.filter(i => i.abcClass === cls);
              const classValue = classItems.reduce((s, i) => s + i.value, 0);
              return (
                <Card key={cls}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{ABC_CONFIG[cls].label}</span>
                      <Badge className={ABC_CONFIG[cls].color}>{classItems.length} items</Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{ABC_CONFIG[cls].desc}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold">{fmtStockAmt(classValue)}</div>
                    <Progress value={(classValue / totalValue) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">{Math.round((classValue / totalValue) * 100)}% of total inventory value</p>
                    <div className="space-y-2 mt-3">
                      {classItems.slice(0, 4).map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate">{item.itemName}</span>
                          <span className="font-medium ml-2 shrink-0">{fmtStockAmt(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Movement trend mini-charts */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">6-Month Movement Trends</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Class</TableHead>
                    {MONTHS.map(m => <TableHead key={m} className="text-center text-xs">{m}</TableHead>)}
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => {
                    const max = Math.max(...item.monthlyMovement, 1);
                    const trend = item.monthlyMovement[5] - item.monthlyMovement[0];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{item.itemName}</TableCell>
                        <TableCell><Badge className={ABC_CONFIG[item.abcClass].color}>{item.abcClass}</Badge></TableCell>
                        {item.monthlyMovement.map((v, idx) => (
                          <TableCell key={idx} className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-6 bg-muted rounded-sm overflow-hidden" style={{ height: 24 }}>
                                <div
                                  className="w-full rounded-sm"
                                  style={{
                                    height: `${(v / max) * 100}%`,
                                    backgroundColor: v === 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                                    marginTop: `${100 - (v / max) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{v}</span>
                            </div>
                          </TableCell>
                        ))}
                        <TableCell>
                          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {trend > 0 ? `↑${trend}` : trend < 0 ? `↓${Math.abs(trend)}` : '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Actions */}
        <TabsContent value="actions">
          <div className="space-y-4">
            {(['write-off', 'return', 'discount'] as const).map(action => {
              const actionItems = items.filter(i => i.recommendation === action);
              if (actionItems.length === 0) return null;
              const actionValue = actionItems.reduce((s, i) => s + i.value, 0);
              return (
                <Card key={action}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className={RECOMMENDATION_CONFIG[action].color}>{RECOMMENDATION_CONFIG[action].label}</Badge>
                        <span className="text-muted-foreground font-normal text-sm">{actionItems.length} items · {fmtStockAmt(actionValue)}</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">Days Idle</TableHead>
                          <TableHead className="text-right">Carrying Cost/mo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {actionItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell className="text-muted-foreground">{item.group}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right font-medium">{fmtStockAmt(item.value)}</TableCell>
                            <TableCell className="text-right text-destructive font-medium">{item.daysSinceMovement}d</TableCell>
                            <TableCell className="text-right">{fmtStockAmt(item.carryingCostPerMonth)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

export default StockAgingDashboard;
