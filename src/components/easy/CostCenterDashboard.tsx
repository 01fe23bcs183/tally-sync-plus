import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  FolderTree, BarChart3, GitCompare, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  getCategorized, getPerformanceData, getMonthlyTrend, formatAmount,
  CostCenterCategory
} from '@/services/costCenterService';

const COLORS = [
  'hsl(210, 70%, 50%)', 'hsl(150, 50%, 45%)', 'hsl(45, 80%, 55%)',
  'hsl(0, 60%, 55%)', 'hsl(280, 50%, 55%)', 'hsl(180, 60%, 45%)',
];

const CostCenterDashboard = () => {
  const categories = getCategorized();
  const performance = getPerformanceData();
  const monthlyTrend = getMonthlyTrend();
  const [expandedCats, setExpandedCats] = useState<string[]>(categories.map(c => c.name));
  const [selectedCategory, setSelectedCategory] = useState('Departments');

  const toggleCat = (name: string) => {
    setExpandedCats(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const totalRevenue = performance.reduce((s, p) => s + p.revenue, 0);
  const totalExpenses = performance.reduce((s, p) => s + p.expenses, 0);
  const totalBudget = performance.reduce((s, p) => s + p.budgetTotal, 0);
  const totalUsed = performance.reduce((s, p) => s + p.budgetUsed, 0);

  const expenseByCenter = performance
    .filter(p => p.expenses > 0)
    .map(p => ({ name: p.name, value: p.expenses }));

  const filteredPerformance = performance.filter(p => {
    const cat = categories.find(c => c.centers.some(cc => cc.name === p.name));
    return cat?.name === selectedCategory;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Cost Center Management</h2>
        <p className="text-sm text-muted-foreground">
          Department, project & location-wise performance tracking
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold mt-1">{formatAmount(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">All centers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold mt-1">{formatAmount(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">All centers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={`text-xl font-bold mt-1 ${totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatAmount(totalRevenue - totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Budget Utilization</p>
            <p className="text-xl font-bold mt-1">{Math.round((totalUsed / totalBudget) * 100)}%</p>
            <Progress value={(totalUsed / totalBudget) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hierarchy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hierarchy" className="gap-1">
            <FolderTree className="h-3.5 w-3.5" /> Hierarchy
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1">
            <GitCompare className="h-3.5 w-3.5" /> Comparison
          </TabsTrigger>
        </TabsList>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cost Center Tree</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <CategoryNode
                      key={cat.name}
                      category={cat}
                      expanded={expandedCats.includes(cat.name)}
                      onToggle={() => toggleCat(cat.name)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={expenseByCenter}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={55}
                      dataKey="value"
                      label={(props: any) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {expenseByCenter.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Budget vs Actual */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Budget vs Actual</CardTitle>
                <div className="flex gap-1">
                  {categories.map(c => (
                    <Button
                      key={c.name}
                      variant={selectedCategory === c.name ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setSelectedCategory(c.name)}
                    >
                      {c.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatAmount(v)} />
                  <Tooltip formatter={(v: number) => formatAmount(v)} />
                  <Legend />
                  <Bar dataKey="budgetTotal" name="Budget" fill="hsl(210, 70%, 50%)" radius={[4, 4, 0, 0]} opacity={0.4} />
                  <Bar dataKey="budgetUsed" name="Actual" fill="hsl(210, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Per-center detail cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {filteredPerformance.map(p => (
              <Card key={p.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{p.name}</span>
                    <Badge
                      variant={p.budgetPercent > 90 ? 'destructive' : p.budgetPercent > 70 ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {p.budgetPercent}% used
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-mono">{formatAmount(p.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expenses</span>
                      <span className="font-mono">{formatAmount(p.expenses)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-muted-foreground">Profit</span>
                      <span className={`font-mono font-semibold ${p.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatAmount(p.profit)}
                      </span>
                    </div>
                    <Progress value={p.budgetPercent} className="h-1.5 mt-1" />
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(p.budgetUsed)} of {formatAmount(p.budgetTotal)} budget
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Department Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatAmount(v)} />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="Sales" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Marketing" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Operations" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Engineering" stroke={COLORS[3]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue vs Expense by Center</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performance.filter(p => p.revenue > 0 || p.expenses > 0)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => formatAmount(v)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(150, 50%, 45%)" />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(0, 60%, 55%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Tree node component
const CategoryNode = ({
  category,
  expanded,
  onToggle,
}: {
  category: CostCenterCategory;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const totalExpense = category.centers.reduce((s, c) => s + c.expenses, 0);
  const totalRevenue = category.centers.reduce((s, c) => s + c.revenue, 0);

  return (
    <div>
      <button
        className="flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-muted/50 text-left"
        onClick={onToggle}
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <FolderTree className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm flex-1">{category.name}</span>
        <span className="text-xs text-muted-foreground">
          {category.centers.length} centers • Exp: {formatAmount(totalExpense)}
        </span>
      </button>
      {expanded && (
        <div className="ml-6 border-l pl-3 space-y-0.5">
          {category.centers.map(center => {
            const profit = center.revenue - center.expenses;
            return (
              <div
                key={center.name}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>{center.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {center.revenue > 0 && (
                    <span className="text-muted-foreground">Rev: {formatAmount(center.revenue)}</span>
                  )}
                  <span className="text-muted-foreground">Exp: {formatAmount(center.expenses)}</span>
                  {center.revenue > 0 && (
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {profit >= 0 ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                      {formatAmount(profit)}
                    </span>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round((center.budgetUsed / center.budget) * 100)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CostCenterDashboard;
