// Multi-Godown Service

export interface Godown {
  id: string;
  name: string;
  location: string;
  type: 'warehouse' | 'showroom' | 'factory' | 'cold_storage';
  totalItems: number;
  totalValue: number;
  capacityUsed: number; // percentage
}

export interface GodownStock {
  id: string;
  godownId: string;
  godownName: string;
  stockItem: string;
  category: string;
  quantity: number;
  unit: string;
  value: number;
  reorderLevel: number;
  belowReorder: boolean;
}

export interface StockTransfer {
  id: string;
  date: string;
  fromGodown: string;
  toGodown: string;
  stockItem: string;
  quantity: number;
  unit: string;
  status: 'completed' | 'in_transit' | 'pending';
  transferNo: string;
}

const GODOWNS: Godown[] = [
  { id: 'g1', name: 'Main Store', location: 'Mumbai - Andheri', type: 'warehouse', totalItems: 45, totalValue: 2850000, capacityUsed: 72 },
  { id: 'g2', name: 'Warehouse-2', location: 'Mumbai - Bhiwandi', type: 'warehouse', totalItems: 32, totalValue: 1650000, capacityUsed: 55 },
  { id: 'g3', name: 'Cold Storage', location: 'Mumbai - Vasai', type: 'cold_storage', totalItems: 12, totalValue: 480000, capacityUsed: 40 },
  { id: 'g4', name: 'Showroom', location: 'Mumbai - Dadar', type: 'showroom', totalItems: 18, totalValue: 920000, capacityUsed: 85 },
  { id: 'g5', name: 'Factory Store', location: 'Pune - Chakan', type: 'factory', totalItems: 28, totalValue: 1200000, capacityUsed: 60 },
];

const STOCK: GodownStock[] = [
  { id: 's1', godownId: 'g1', godownName: 'Main Store', stockItem: 'Widget-A', category: 'Widgets', quantity: 120, unit: 'NOS', value: 60000, reorderLevel: 50, belowReorder: false },
  { id: 's2', godownId: 'g1', godownName: 'Main Store', stockItem: 'Motor-E', category: 'Motors', quantity: 15, unit: 'NOS', value: 67500, reorderLevel: 20, belowReorder: true },
  { id: 's3', godownId: 'g1', godownName: 'Main Store', stockItem: 'Sensor-F', category: 'Electronics', quantity: 200, unit: 'NOS', value: 70000, reorderLevel: 100, belowReorder: false },
  { id: 's4', godownId: 'g2', godownName: 'Warehouse-2', stockItem: 'Widget-A', category: 'Widgets', quantity: 80, unit: 'NOS', value: 40000, reorderLevel: 30, belowReorder: false },
  { id: 's5', godownId: 'g2', godownName: 'Warehouse-2', stockItem: 'Cable-D (1m)', category: 'Cables', quantity: 800, unit: 'MTR', value: 64000, reorderLevel: 500, belowReorder: false },
  { id: 's6', godownId: 'g2', godownName: 'Warehouse-2', stockItem: 'Panel-H', category: 'Panels', quantity: 5, unit: 'NOS', value: 9000, reorderLevel: 10, belowReorder: true },
  { id: 's7', godownId: 'g3', godownName: 'Cold Storage', stockItem: 'Insulin Vial', category: 'Pharma', quantity: 40, unit: 'VL', value: 6000, reorderLevel: 30, belowReorder: false },
  { id: 's8', godownId: 'g3', godownName: 'Cold Storage', stockItem: 'Amoxicillin 250mg', category: 'Pharma', quantity: 200, unit: 'CAP', value: 700, reorderLevel: 100, belowReorder: false },
  { id: 's9', godownId: 'g4', godownName: 'Showroom', stockItem: 'Gadget-B', category: 'Gadgets', quantity: 25, unit: 'NOS', value: 55000, reorderLevel: 15, belowReorder: false },
  { id: 's10', godownId: 'g4', godownName: 'Showroom', stockItem: 'Motor-E', category: 'Motors', quantity: 8, unit: 'NOS', value: 36000, reorderLevel: 10, belowReorder: true },
  { id: 's11', godownId: 'g5', godownName: 'Factory Store', stockItem: 'Bearing-G', category: 'Spare Parts', quantity: 350, unit: 'NOS', value: 77000, reorderLevel: 200, belowReorder: false },
  { id: 's12', godownId: 'g5', godownName: 'Factory Store', stockItem: 'Part-C', category: 'Spare Parts', quantity: 300, unit: 'NOS', value: 45000, reorderLevel: 150, belowReorder: false },
];

const TRANSFERS: StockTransfer[] = [
  { id: 'tr1', date: '2026-04-14', fromGodown: 'Main Store', toGodown: 'Showroom', stockItem: 'Gadget-B', quantity: 10, unit: 'NOS', status: 'completed', transferNo: 'TRF-001' },
  { id: 'tr2', date: '2026-04-14', fromGodown: 'Warehouse-2', toGodown: 'Main Store', stockItem: 'Widget-A', quantity: 50, unit: 'NOS', status: 'completed', transferNo: 'TRF-002' },
  { id: 'tr3', date: '2026-04-15', fromGodown: 'Main Store', toGodown: 'Factory Store', stockItem: 'Sensor-F', quantity: 30, unit: 'NOS', status: 'in_transit', transferNo: 'TRF-003' },
  { id: 'tr4', date: '2026-04-15', fromGodown: 'Factory Store', toGodown: 'Warehouse-2', stockItem: 'Part-C', quantity: 100, unit: 'NOS', status: 'pending', transferNo: 'TRF-004' },
  { id: 'tr5', date: '2026-04-13', fromGodown: 'Cold Storage', toGodown: 'Showroom', stockItem: 'Insulin Vial', quantity: 5, unit: 'VL', status: 'completed', transferNo: 'TRF-005' },
];

export function getGodowns(): Godown[] { return GODOWNS; }
export function getGodownStock(godownId?: string): GodownStock[] {
  return godownId ? STOCK.filter(s => s.godownId === godownId) : STOCK;
}
export function getTransfers(): StockTransfer[] { return TRANSFERS; }
export function getBelowReorder(): GodownStock[] { return STOCK.filter(s => s.belowReorder); }

export function fmtGdnAmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const TYPE_ICONS: Record<Godown['type'], string> = { warehouse: '🏭', showroom: '🏬', factory: '⚙️', cold_storage: '❄️' };
export function getGodownIcon(t: Godown['type']) { return TYPE_ICONS[t]; }
