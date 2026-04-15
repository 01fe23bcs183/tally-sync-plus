// Barcode Scanning Service

export interface StockBarcode {
  id: string;
  barcode: string;
  stockItem: string;
  category: string;
  rate: number;
  unit: string;
  currentStock: number;
}

export interface ScannedItem {
  barcode: string;
  stockItem: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface StockTakeEntry {
  id: string;
  barcode: string;
  stockItem: string;
  bookStock: number;
  physicalCount: number;
  variance: number;
  unit: string;
}

const BARCODE_MASTER: StockBarcode[] = [
  { id: 'b1', barcode: '8901234567890', stockItem: 'Widget-A', category: 'Widgets', rate: 500, unit: 'NOS', currentStock: 120 },
  { id: 'b2', barcode: '8901234567891', stockItem: 'Gadget-B', category: 'Gadgets', rate: 2200, unit: 'NOS', currentStock: 45 },
  { id: 'b3', barcode: '8901234567892', stockItem: 'Part-C', category: 'Spare Parts', rate: 150, unit: 'NOS', currentStock: 500 },
  { id: 'b4', barcode: '8901234567893', stockItem: 'Cable-D (1m)', category: 'Cables', rate: 80, unit: 'MTR', currentStock: 1200 },
  { id: 'b5', barcode: '8901234567894', stockItem: 'Motor-E', category: 'Motors', rate: 4500, unit: 'NOS', currentStock: 25 },
  { id: 'b6', barcode: '8901234567895', stockItem: 'Sensor-F', category: 'Electronics', rate: 350, unit: 'NOS', currentStock: 200 },
  { id: 'b7', barcode: '8901234567896', stockItem: 'Bearing-G', category: 'Spare Parts', rate: 220, unit: 'NOS', currentStock: 350 },
  { id: 'b8', barcode: '8901234567897', stockItem: 'Panel-H', category: 'Panels', rate: 1800, unit: 'NOS', currentStock: 15 },
];

export function getBarcodeMaster(): StockBarcode[] { return BARCODE_MASTER; }
export function lookupBarcode(code: string): StockBarcode | undefined {
  return BARCODE_MASTER.find(b => b.barcode === code);
}
export function searchStockItems(q: string): StockBarcode[] {
  const lower = q.toLowerCase();
  return BARCODE_MASTER.filter(b => b.stockItem.toLowerCase().includes(lower) || b.barcode.includes(q));
}

export function getDemoStockTake(): StockTakeEntry[] {
  return BARCODE_MASTER.slice(0, 6).map((b, i) => {
    const physical = b.currentStock + [-5, 0, 2, -10, 0, 3][i];
    return { id: `st${i}`, barcode: b.barcode, stockItem: b.stockItem, bookStock: b.currentStock, physicalCount: physical, variance: physical - b.currentStock, unit: b.unit };
  });
}

export function fmtBarAmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}
