export type AgingBucket = '0-30' | '30-60' | '60-90' | '90-180' | '180+';
export type ABCClass = 'A' | 'B' | 'C';
export type MovementClass = 'fast' | 'normal' | 'slow' | 'dead';

export interface StockAgingItem {
  id: string;
  itemName: string;
  group: string;
  quantity: number;
  unit: string;
  rate: number;
  value: number;
  lastMovementDate: string;
  daysSinceMovement: number;
  agingBucket: AgingBucket;
  abcClass: ABCClass;
  movementClass: MovementClass;
  monthlyMovement: number[];
  carryingCostPerMonth: number;
  recommendation: 'hold' | 'discount' | 'return' | 'write-off';
}

export interface AgingBucketSummary {
  bucket: AgingBucket;
  label: string;
  items: number;
  value: number;
  color: string;
}

const DEMO_ITEMS: StockAgingItem[] = [
  { id: 'sa-1', itemName: 'Widget A', group: 'Finished Goods', quantity: 450, unit: 'Nos', rate: 150, value: 67500, lastMovementDate: '2025-04-10', daysSinceMovement: 5, agingBucket: '0-30', abcClass: 'A', movementClass: 'fast', monthlyMovement: [120, 95, 130, 110, 140, 125], carryingCostPerMonth: 675, recommendation: 'hold' },
  { id: 'sa-2', itemName: 'Component X', group: 'Raw Materials', quantity: 800, unit: 'Nos', rate: 80, value: 64000, lastMovementDate: '2025-04-08', daysSinceMovement: 7, agingBucket: '0-30', abcClass: 'A', movementClass: 'fast', monthlyMovement: [200, 180, 220, 190, 210, 205], carryingCostPerMonth: 640, recommendation: 'hold' },
  { id: 'sa-3', itemName: 'Battery Pack', group: 'Raw Materials', quantity: 200, unit: 'Nos', rate: 250, value: 50000, lastMovementDate: '2025-04-05', daysSinceMovement: 10, agingBucket: '0-30', abcClass: 'A', movementClass: 'fast', monthlyMovement: [60, 55, 70, 65, 50, 58], carryingCostPerMonth: 500, recommendation: 'hold' },
  { id: 'sa-4', itemName: 'Circuit Board', group: 'Raw Materials', quantity: 150, unit: 'Nos', rate: 800, value: 120000, lastMovementDate: '2025-03-20', daysSinceMovement: 26, agingBucket: '0-30', abcClass: 'A', movementClass: 'fast', monthlyMovement: [40, 35, 45, 38, 42, 30], carryingCostPerMonth: 1200, recommendation: 'hold' },
  { id: 'sa-5', itemName: 'Display Unit', group: 'Components', quantity: 80, unit: 'Nos', rate: 600, value: 48000, lastMovementDate: '2025-03-10', daysSinceMovement: 36, agingBucket: '30-60', abcClass: 'A', movementClass: 'normal', monthlyMovement: [25, 20, 18, 22, 15, 12], carryingCostPerMonth: 480, recommendation: 'hold' },
  { id: 'sa-6', itemName: 'Casing', group: 'Components', quantity: 300, unit: 'Nos', rate: 400, value: 120000, lastMovementDate: '2025-03-05', daysSinceMovement: 41, agingBucket: '30-60', abcClass: 'A', movementClass: 'normal', monthlyMovement: [50, 45, 40, 35, 30, 20], carryingCostPerMonth: 1200, recommendation: 'hold' },
  { id: 'sa-7', itemName: 'MS Plate 6mm', group: 'Raw Materials', quantity: 40, unit: 'Sqm', rate: 1200, value: 48000, lastMovementDate: '2025-02-25', daysSinceMovement: 50, agingBucket: '30-60', abcClass: 'B', movementClass: 'normal', monthlyMovement: [10, 8, 12, 6, 5, 4], carryingCostPerMonth: 480, recommendation: 'hold' },
  { id: 'sa-8', itemName: 'Packaging Material', group: 'Consumables', quantity: 2000, unit: 'Nos', rate: 50, value: 100000, lastMovementDate: '2025-02-15', daysSinceMovement: 60, agingBucket: '60-90', abcClass: 'B', movementClass: 'slow', monthlyMovement: [300, 250, 200, 150, 80, 30], carryingCostPerMonth: 1000, recommendation: 'discount' },
  { id: 'sa-9', itemName: 'MS Angle 50x50', group: 'Raw Materials', quantity: 60, unit: 'Mtrs', rate: 450, value: 27000, lastMovementDate: '2025-02-01', daysSinceMovement: 74, agingBucket: '60-90', abcClass: 'B', movementClass: 'slow', monthlyMovement: [15, 12, 10, 8, 5, 2], carryingCostPerMonth: 270, recommendation: 'discount' },
  { id: 'sa-10', itemName: 'Welding Rod', group: 'Consumables', quantity: 500, unit: 'Nos', rate: 15, value: 7500, lastMovementDate: '2025-01-20', daysSinceMovement: 86, agingBucket: '60-90', abcClass: 'C', movementClass: 'slow', monthlyMovement: [80, 60, 40, 20, 10, 5], carryingCostPerMonth: 75, recommendation: 'discount' },
  { id: 'sa-11', itemName: 'Screws & Fasteners', group: 'Consumables', quantity: 5000, unit: 'Nos', rate: 5, value: 25000, lastMovementDate: '2025-01-05', daysSinceMovement: 101, agingBucket: '90-180', abcClass: 'C', movementClass: 'slow', monthlyMovement: [500, 400, 300, 200, 100, 0], carryingCostPerMonth: 250, recommendation: 'return' },
  { id: 'sa-12', itemName: 'Old Widget v1', group: 'Finished Goods', quantity: 120, unit: 'Nos', rate: 100, value: 12000, lastMovementDate: '2024-11-10', daysSinceMovement: 157, agingBucket: '90-180', abcClass: 'C', movementClass: 'dead', monthlyMovement: [10, 5, 2, 0, 0, 0], carryingCostPerMonth: 120, recommendation: 'write-off' },
  { id: 'sa-13', itemName: 'Obsolete Connector', group: 'Components', quantity: 300, unit: 'Nos', rate: 35, value: 10500, lastMovementDate: '2024-10-05', daysSinceMovement: 193, agingBucket: '180+', abcClass: 'C', movementClass: 'dead', monthlyMovement: [5, 2, 0, 0, 0, 0], carryingCostPerMonth: 105, recommendation: 'write-off' },
  { id: 'sa-14', itemName: 'Legacy PCB Board', group: 'Components', quantity: 50, unit: 'Nos', rate: 500, value: 25000, lastMovementDate: '2024-08-20', daysSinceMovement: 239, agingBucket: '180+', abcClass: 'B', movementClass: 'dead', monthlyMovement: [3, 1, 0, 0, 0, 0], carryingCostPerMonth: 250, recommendation: 'write-off' },
  { id: 'sa-15', itemName: 'Discontinued Casing', group: 'Components', quantity: 80, unit: 'Nos', rate: 200, value: 16000, lastMovementDate: '2024-07-15', daysSinceMovement: 275, agingBucket: '180+', abcClass: 'C', movementClass: 'dead', monthlyMovement: [2, 0, 0, 0, 0, 0], carryingCostPerMonth: 160, recommendation: 'write-off' },
];

export const getStockAgingItems = (): StockAgingItem[] => DEMO_ITEMS;

export const getAgingBucketSummaries = (): AgingBucketSummary[] => {
  const buckets: Record<AgingBucket, { label: string; color: string }> = {
    '0-30': { label: '0–30 days', color: 'hsl(var(--primary))' },
    '30-60': { label: '30–60 days', color: 'hsl(142 71% 45%)' },
    '60-90': { label: '60–90 days', color: 'hsl(48 96% 53%)' },
    '90-180': { label: '90–180 days', color: 'hsl(25 95% 53%)' },
    '180+': { label: '180+ days', color: 'hsl(0 84% 60%)' },
  };
  return (Object.keys(buckets) as AgingBucket[]).map(bucket => {
    const items = DEMO_ITEMS.filter(i => i.agingBucket === bucket);
    return {
      bucket,
      label: buckets[bucket].label,
      items: items.length,
      value: items.reduce((s, i) => s + i.value, 0),
      color: buckets[bucket].color,
    };
  });
};

export const MOVEMENT_CONFIG: Record<MovementClass, { label: string; color: string; icon: string }> = {
  fast: { label: 'Fast Moving', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '🟢' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔵' },
  slow: { label: 'Slow Moving', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🟡' },
  dead: { label: 'Dead Stock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '🔴' },
};

export const ABC_CONFIG: Record<ABCClass, { label: string; color: string; desc: string }> = {
  A: { label: 'Class A', color: 'bg-primary/10 text-primary', desc: 'High value (top 80%)' },
  B: { label: 'Class B', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', desc: 'Medium value (next 15%)' },
  C: { label: 'Class C', color: 'bg-muted text-muted-foreground', desc: 'Low value (bottom 5%)' },
};

export const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string }> = {
  hold: { label: 'Hold', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  discount: { label: 'Discount Sale', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  return: { label: 'Return to Vendor', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'write-off': { label: 'Write Off', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const fmtStockAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
