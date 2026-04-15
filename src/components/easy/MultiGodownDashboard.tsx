import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Clock, Truck
} from 'lucide-react';
import {
  getGodowns, getGodownStock, getTransfers, getBelowReorder,
  fmtGdnAmt, getGodownIcon
} from '@/services/multiGodownService';
import { toast } from 'sonner';

const TRANSFER_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Truck className="h-3.5 w-3.5" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="h-3.5 w-3.5" /> },
};

const MultiGodownDashboard = () => {
  const godowns = getGodowns();
  const transfers = getTransfers();
  const belowReorder = getBelowReorder();
  const [selectedGodown, setSelectedGodown] = useState<string | null>(null);
  const godownStock = getGodownStock(selectedGodown || undefined);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Multi-Godown Management</h2>
          <p className="text-sm text-muted-foreground">Stock distribution, transfers & reorder tracking</p>
        </div>
        <Button size="sm" onClick={() => toast.info('Select source and destination godowns to create transfer')}>
          <ArrowRight className="h-4 w-4 mr-1" /> New Transfer
        </Button>
      </div>

      {belowReorder.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <span><strong>{belowReorder.length} items</strong> below reorder level across godowns</span>
        </div>
      )}

      <Tabs defaultValue="godowns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="godowns">Godown Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Distribution</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Alerts ({belowReorder.length})</TabsTrigger>
        </TabsList>

        {/* Godown Cards */}
        <TabsContent value="godowns">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {godowns.map(g => (
              <Card key={g.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedGodown === g.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedGodown(s => s === g.id ? null : g.id)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">{getGodownIcon(g.type)}</span>
                    {g.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{g.location}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{g.totalItems} items</span>
                    <span className="font-mono font-semibold">{fmtGdnAmt(g.totalValue)}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Capacity</span>
                      <span>{g.capacityUsed}%</span>
                    </div>
                    <Progress value={g.capacityUsed} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stock Distribution */}
        <TabsContent value="stock">
          <div className="flex gap-2 mb-4">
            <Badge variant={!selectedGodown ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setSelectedGodown(null)}>
              All Godowns
            </Badge>
            {godowns.map(g => (
              <Badge key={g.id} variant={selectedGodown === g.id ? 'default' : 'outline'} className="cursor-pointer"
                onClick={() => setSelectedGodown(s => s === g.id ? null : g.id)}>
                {getGodownIcon(g.type)} {g.name}
              </Badge>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Godown</th>
                    <th className="text-left p-3 font-medium">Stock Item</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Value</th>
                    <th className="text-right p-3 font-medium">Reorder</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {godownStock.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 text-xs">{s.godownName}</td>
                      <td className="p-3 font-medium">{s.stockItem}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{s.category}</Badge></td>
                      <td className="p-3 text-right font-mono">{s.quantity} {s.unit}</td>
                      <td className="p-3 text-right font-mono">{fmtGdnAmt(s.value)}</td>
                      <td className="p-3 text-right font-mono text-xs text-muted-foreground">{s.reorderLevel}</td>
                      <td className="p-3 text-center">
                        {s.belowReorder
                          ? <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]">Below Reorder</Badge>
                          : <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]">OK</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader><CardTitle className="text-base">Transfer History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">Transfer #</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Route</th>
                    <th className="text-left p-3 font-medium">Item</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => {
                    const cfg = TRANSFER_STATUS[t.status];
                    return (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs font-medium">{t.transferNo}</td>
                        <td className="p-3 text-xs">{t.date}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-xs">
                            <span>{t.fromGodown}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span>{t.toGodown}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium">{t.stockItem}</td>
                        <td className="p-3 text-right font-mono">{t.quantity} {t.unit}</td>
                        <td className="p-3 text-center">
                          <Badge className={`${cfg.color} text-[10px] gap-1`}>{cfg.icon}{cfg.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Alerts */}
        <TabsContent value="reorder">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Items Below Reorder Level</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {belowReorder.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{s.stockItem}</p>
                    <p className="text-[10px] text-muted-foreground">{s.godownName} · {s.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-red-600 font-semibold">{s.quantity}</span>
                      <span className="text-muted-foreground"> / {s.reorderLevel} {s.unit}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">Need {s.reorderLevel - s.quantity} more</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7"
                    onClick={() => toast.success(`Transfer request created for ${s.stockItem}`)}>
                    Transfer In
                  </Button>
                </div>
              ))}
              {belowReorder.length === 0 && (
                <p className="text-center text-muted-foreground py-6">All items above reorder levels ✓</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiGodownDashboard;
