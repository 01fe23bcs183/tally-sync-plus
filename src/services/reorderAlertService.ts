export type ReorderUrgency = 'critical' | 'low' | 'warning' | 'ok';

export interface ReorderItem {
  id: string;
  itemName: string;
  group: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  minimumLevel: number;
  maximumLevel: number;
  avgDailyConsumption: number;
  leadTimeDays: number;
  safetyStock: number;
  smartReorderPoint: number;
  daysOfStock: number;
  urgency: ReorderUrgency;
  preferredSupplier: string;
  lastPrice: number;
  monthlyConsumption: number[];
  forecastNextMonth: number;
  suggestedOrderQty: number;
}

const DEMO_ITEMS: ReorderItem[] = [
  { id: 'ri-1', itemName: 'Circuit Board', group: 'Raw Materials', currentStock: 18, unit: 'Nos', reorderLevel: 50, minimumLevel: 20, maximumLevel: 300, avgDailyConsumption: 8, leadTimeDays: 5, safetyStock: 16, smartReorderPoint: 56, daysOfStock: 2, urgency: 'critical', preferredSupplier: 'Tech Supplies Ltd', lastPrice: 800, monthlyConsumption: [220, 240, 210, 250, 230, 260], forecastNextMonth: 265, suggestedOrderQty: 250 },
  { id: 'ri-2', itemName: 'Battery Pack', group: 'Raw Materials', currentStock: 25, unit: 'Nos', reorderLevel: 40, minimumLevel: 15, maximumLevel: 200, avgDailyConsumption: 5, leadTimeDays: 7, safetyStock: 14, smartReorderPoint: 49, daysOfStock: 5, urgency: 'critical', preferredSupplier: 'Global Parts Inc', lastPrice: 250, monthlyConsumption: [140, 155, 150, 160, 145, 165], forecastNextMonth: 170, suggestedOrderQty: 175 },
  { id: 'ri-3', itemName: 'Display Unit', group: 'Components', currentStock: 30, unit: 'Nos', reorderLevel: 35, minimumLevel: 10, maximumLevel: 150, avgDailyConsumption: 3, leadTimeDays: 10, safetyStock: 12, smartReorderPoint: 42, daysOfStock: 10, urgency: 'low', preferredSupplier: 'Tech Supplies Ltd', lastPrice: 600, monthlyConsumption: [80, 85, 90, 78, 92, 88], forecastNextMonth: 93, suggestedOrderQty: 120 },
  { id: 'ri-4', itemName: 'Component X', group: 'Raw Materials', currentStock: 120, unit: 'Nos', reorderLevel: 150, minimumLevel: 50, maximumLevel: 800, avgDailyConsumption: 18, leadTimeDays: 4, safetyStock: 28, smartReorderPoint: 100, daysOfStock: 7, urgency: 'warning', preferredSupplier: 'Raj Traders', lastPrice: 80, monthlyConsumption: [500, 520, 540, 510, 560, 550], forecastNextMonth: 575, suggestedOrderQty: 500 },
  { id: 'ri-5', itemName: 'Casing', group: 'Components', currentStock: 55, unit: 'Nos', reorderLevel: 60, minimumLevel: 20, maximumLevel: 250, avgDailyConsumption: 4, leadTimeDays: 8, safetyStock: 12, smartReorderPoint: 44, daysOfStock: 14, urgency: 'warning', preferredSupplier: 'Steel Corp', lastPrice: 400, monthlyConsumption: [110, 105, 120, 115, 125, 118], forecastNextMonth: 128, suggestedOrderQty: 195 },
  { id: 'ri-6', itemName: 'Widget A', group: 'Finished Goods', currentStock: 300, unit: 'Nos', reorderLevel: 100, minimumLevel: 50, maximumLevel: 500, avgDailyConsumption: 12, leadTimeDays: 3, safetyStock: 14, smartReorderPoint: 50, daysOfStock: 25, urgency: 'ok', preferredSupplier: 'In-House', lastPrice: 150, monthlyConsumption: [340, 360, 350, 370, 380, 365], forecastNextMonth: 390, suggestedOrderQty: 0 },
  { id: 'ri-7', itemName: 'Packaging Material', group: 'Consumables', currentStock: 1200, unit: 'Nos', reorderLevel: 500, minimumLevel: 200, maximumLevel: 3000, avgDailyConsumption: 40, leadTimeDays: 3, safetyStock: 48, smartReorderPoint: 168, daysOfStock: 30, urgency: 'ok', preferredSupplier: 'Raj Traders', lastPrice: 50, monthlyConsumption: [1100, 1150, 1200, 1180, 1220, 1250], forecastNextMonth: 1280, suggestedOrderQty: 0 },
  { id: 'ri-8', itemName: 'MS Plate 6mm', group: 'Raw Materials', currentStock: 8, unit: 'Sqm', reorderLevel: 15, minimumLevel: 5, maximumLevel: 60, avgDailyConsumption: 1.5, leadTimeDays: 6, safetyStock: 4, smartReorderPoint: 13, daysOfStock: 5, urgency: 'critical', preferredSupplier: 'Steel Corp', lastPrice: 1200, monthlyConsumption: [35, 40, 38, 42, 45, 44], forecastNextMonth: 47, suggestedOrderQty: 52 },
  { id: 'ri-9', itemName: 'Screws & Fasteners', group: 'Consumables', currentStock: 3500, unit: 'Nos', reorderLevel: 1000, minimumLevel: 500, maximumLevel: 8000, avgDailyConsumption: 80, leadTimeDays: 2, safetyStock: 64, smartReorderPoint: 224, daysOfStock: 44, urgency: 'ok', preferredSupplier: 'Raj Traders', lastPrice: 5, monthlyConsumption: [2200, 2300, 2400, 2350, 2500, 2450], forecastNextMonth: 2550, suggestedOrderQty: 0 },
  { id: 'ri-10', itemName: 'Welding Rod', group: 'Consumables', currentStock: 40, unit: 'Nos', reorderLevel: 80, minimumLevel: 30, maximumLevel: 300, avgDailyConsumption: 6, leadTimeDays: 3, safetyStock: 7, smartReorderPoint: 25, daysOfStock: 7, urgency: 'low', preferredSupplier: 'Steel Corp', lastPrice: 15, monthlyConsumption: [160, 170, 180, 175, 190, 185], forecastNextMonth: 195, suggestedOrderQty: 260 },
];

export const getReorderItems = (): ReorderItem[] => DEMO_ITEMS;

export const URGENCY_CONFIG: Record<ReorderUrgency, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' },
  low: { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '🟠' },
  warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🟡' },
  ok: { label: 'Adequate', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '🟢' },
};

export const fmtReorderAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
