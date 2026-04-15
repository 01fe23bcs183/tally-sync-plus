// E-Way Bill Service

export type EWBStatus = 'pending' | 'generated' | 'expired' | 'cancelled' | 'updated';
export type TransportMode = 'road' | 'rail' | 'air' | 'ship';

export interface EWayBill {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  partyName: string;
  gstin: string;
  fromCity: string;
  fromState: string;
  toCity: string;
  toState: string;
  transportMode: TransportMode;
  vehicleNo: string;
  transporterName: string;
  distance: number;
  invoiceValue: number;
  status: EWBStatus;
  ewbNo?: string;
  ewbDate?: string;
  validUpto?: string;
  daysRemaining?: number;
}

const MODE_LABELS: Record<TransportMode, string> = { road: '🚛 Road', rail: '🚂 Rail', air: '✈️ Air', ship: '🚢 Ship' };
export function getTransportLabel(m: TransportMode) { return MODE_LABELS[m]; }

function daysLeft(d: string): number { return Math.max(0, Math.ceil((new Date(d).getTime() - new Date('2026-04-15').getTime()) / 86400000)); }

const DEMO: EWayBill[] = [
  { id: 'ew1', invoiceNo: 'INV-2026-0225', invoiceDate: '2026-04-02', partyName: 'Raj Traders', gstin: '07AAACR5678F1ZQ', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Delhi', toState: 'DL', transportMode: 'road', vehicleNo: 'MH02AB1234', transporterName: 'FastTrack Logistics', distance: 1400, invoiceValue: 206500, status: 'generated', ewbNo: '3210 0012 3456', ewbDate: '2026-04-02', validUpto: '2026-04-16', daysRemaining: 1 },
  { id: 'ew2', invoiceNo: 'INV-2026-0226', invoiceDate: '2026-04-03', partyName: 'XYZ Corp', gstin: '29AABCX1234K1ZP', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Bengaluru', toState: 'KA', transportMode: 'road', vehicleNo: 'MH04CD5678', transporterName: 'SpeedWay Transport', distance: 980, invoiceValue: 271400, status: 'generated', ewbNo: '3210 0012 7890', ewbDate: '2026-04-03', validUpto: '2026-04-20', daysRemaining: 5 },
  { id: 'ew3', invoiceNo: 'INV-2026-0228', invoiceDate: '2026-04-06', partyName: 'Metro Distributors', gstin: '27AABCM9012N1ZR', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Pune', toState: 'MH', transportMode: 'road', vehicleNo: 'MH12EF9012', transporterName: 'City Express', distance: 150, invoiceValue: 354000, status: 'generated', ewbNo: '3210 0013 1234', ewbDate: '2026-04-06', validUpto: '2026-04-07', daysRemaining: 0 },
  { id: 'ew4', invoiceNo: 'INV-2026-0229', invoiceDate: '2026-04-07', partyName: 'Steel Industries', gstin: '33AABCS3456P1ZS', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Chennai', toState: 'TN', transportMode: 'rail', vehicleNo: 'RR-2026-04521', transporterName: 'Indian Railways', distance: 1340, invoiceValue: 590000, status: 'pending' },
  { id: 'ew5', invoiceNo: 'INV-2026-0230', invoiceDate: '2026-04-08', partyName: 'Global Exports', gstin: '27AABCG7890Q1ZT', fromCity: 'Mumbai', fromState: 'MH', toCity: 'JNPT Port', toState: 'MH', transportMode: 'ship', vehicleNo: 'CONT-78452', transporterName: 'Maersk Line', distance: 60, invoiceValue: 472000, status: 'pending' },
  { id: 'ew6', invoiceNo: 'INV-2026-0218', invoiceDate: '2026-03-28', partyName: 'Sunrise Traders', gstin: '27AABCS5678S1ZV', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Ahmedabad', toState: 'GJ', transportMode: 'road', vehicleNo: 'GJ01GH3456', transporterName: 'Gujarat Transport', distance: 530, invoiceValue: 165200, status: 'expired', ewbNo: '3210 0011 5678', ewbDate: '2026-03-28', validUpto: '2026-04-04', daysRemaining: 0 },
  { id: 'ew7', invoiceNo: 'INV-2026-0215', invoiceDate: '2026-03-25', partyName: 'Northern Mills', gstin: '06AABCN1234T1ZW', fromCity: 'Mumbai', fromState: 'MH', toCity: 'Jaipur', toState: 'RJ', transportMode: 'road', vehicleNo: 'RJ14IJ7890', transporterName: 'Rajasthan Freight', distance: 1150, invoiceValue: 280000, status: 'cancelled', ewbNo: '3210 0011 2345', ewbDate: '2026-03-25' },
];

export function getEWayBills(): EWayBill[] { return DEMO; }

export function getEWBSummary() {
  return {
    total: DEMO.length,
    generated: DEMO.filter(e => e.status === 'generated').length,
    pending: DEMO.filter(e => e.status === 'pending').length,
    expired: DEMO.filter(e => e.status === 'expired').length,
    cancelled: DEMO.filter(e => e.status === 'cancelled').length,
    expiringToday: DEMO.filter(e => e.status === 'generated' && (e.daysRemaining || 0) <= 1).length,
  };
}

export function fmtEWBAmount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
