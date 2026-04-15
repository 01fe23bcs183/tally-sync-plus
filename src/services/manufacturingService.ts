export interface BOMComponent {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  children?: BOMComponent[];
}

export interface BOM {
  id: string;
  finishedGood: string;
  outputQty: number;
  outputUnit: string;
  sellPrice: number;
  components: BOMComponent[];
  totalCost: number;
  margin: number;
  marginPct: number;
}

export interface ProductionOrder {
  id: string;
  orderNo: string;
  bomId: string;
  finishedGood: string;
  quantity: number;
  unit: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  actualCost?: number;
  estimatedCost: number;
  wastage?: number;
  wastagePct?: number;
}

const DEMO_BOMS: BOM[] = [
  {
    id: 'bom-1', finishedGood: 'Finished Widget', outputQty: 1, outputUnit: 'Nos',
    sellPrice: 1200,
    components: [
      { id: 'c1', itemName: 'Component A', quantity: 2, unit: 'Nos', unitCost: 100, totalCost: 200 },
      { id: 'c2', itemName: 'Component B', quantity: 1, unit: 'Nos', unitCost: 300, totalCost: 300,
        children: [
          { id: 'c2a', itemName: 'Part X', quantity: 3, unit: 'Nos', unitCost: 50, totalCost: 150 },
          { id: 'c2b', itemName: 'Part Y', quantity: 1, unit: 'Nos', unitCost: 100, totalCost: 100 },
        ]
      },
      { id: 'c3', itemName: 'Sub-Assembly Z', quantity: 1, unit: 'Nos', unitCost: 250, totalCost: 250 },
      { id: 'c4', itemName: 'Packaging Material', quantity: 1, unit: 'Nos', unitCost: 50, totalCost: 50 },
    ],
    totalCost: 850, margin: 350, marginPct: 29.2,
  },
  {
    id: 'bom-2', finishedGood: 'Premium Gadget', outputQty: 1, outputUnit: 'Nos',
    sellPrice: 3500,
    components: [
      { id: 'd1', itemName: 'Circuit Board', quantity: 1, unit: 'Nos', unitCost: 800, totalCost: 800 },
      { id: 'd2', itemName: 'Casing', quantity: 1, unit: 'Nos', unitCost: 400, totalCost: 400 },
      { id: 'd3', itemName: 'Display Unit', quantity: 1, unit: 'Nos', unitCost: 600, totalCost: 600 },
      { id: 'd4', itemName: 'Battery Pack', quantity: 2, unit: 'Nos', unitCost: 250, totalCost: 500 },
      { id: 'd5', itemName: 'Screws & Fasteners', quantity: 10, unit: 'Nos', unitCost: 5, totalCost: 50 },
    ],
    totalCost: 2350, margin: 1150, marginPct: 32.9,
  },
  {
    id: 'bom-3', finishedGood: 'Steel Frame Assembly', outputQty: 1, outputUnit: 'Nos',
    sellPrice: 8500,
    components: [
      { id: 'e1', itemName: 'MS Angle 50x50', quantity: 6, unit: 'Mtrs', unitCost: 450, totalCost: 2700 },
      { id: 'e2', itemName: 'MS Plate 6mm', quantity: 2, unit: 'Sqm', unitCost: 1200, totalCost: 2400 },
      { id: 'e3', itemName: 'Welding Rod', quantity: 20, unit: 'Nos', unitCost: 15, totalCost: 300 },
      { id: 'e4', itemName: 'Paint (Primer)', quantity: 1, unit: 'Ltr', unitCost: 350, totalCost: 350 },
    ],
    totalCost: 5750, margin: 2750, marginPct: 32.4,
  },
];

const DEMO_ORDERS: ProductionOrder[] = [
  { id: 'po-1', orderNo: 'PRD-001', bomId: 'bom-1', finishedGood: 'Finished Widget', quantity: 50, unit: 'Nos', status: 'completed', startDate: '2025-04-01', endDate: '2025-04-05', estimatedCost: 42500, actualCost: 43200, wastage: 700, wastagePct: 1.6 },
  { id: 'po-2', orderNo: 'PRD-002', bomId: 'bom-2', finishedGood: 'Premium Gadget', quantity: 20, unit: 'Nos', status: 'in_progress', startDate: '2025-04-10', estimatedCost: 47000 },
  { id: 'po-3', orderNo: 'PRD-003', bomId: 'bom-1', finishedGood: 'Finished Widget', quantity: 100, unit: 'Nos', status: 'planned', startDate: '2025-04-20', estimatedCost: 85000 },
  { id: 'po-4', orderNo: 'PRD-004', bomId: 'bom-3', finishedGood: 'Steel Frame Assembly', quantity: 10, unit: 'Nos', status: 'planned', startDate: '2025-04-25', estimatedCost: 57500 },
  { id: 'po-5', orderNo: 'PRD-005', bomId: 'bom-2', finishedGood: 'Premium Gadget', quantity: 15, unit: 'Nos', status: 'completed', startDate: '2025-03-20', endDate: '2025-03-25', estimatedCost: 35250, actualCost: 36100, wastage: 850, wastagePct: 2.4 },
];

export const getBOMs = (): BOM[] => DEMO_BOMS;
export const getBOM = (id: string): BOM | undefined => DEMO_BOMS.find(b => b.id === id);
export const getProductionOrders = (): ProductionOrder[] => DEMO_ORDERS;

export const fmtMfgAmt = (v: number) =>
  '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const ORDER_STATUS_CONFIG: Record<ProductionOrder['status'], { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};
