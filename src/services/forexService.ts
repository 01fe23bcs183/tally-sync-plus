// Forex Rate Service - live rates, caching, gain/loss calculation, revaluation

export interface CurrencyRate {
  currency: string;
  symbol: string;
  rateToINR: number;
  previousRate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface CurrencyExposure {
  currency: string;
  symbol: string;
  foreignBalance: number;
  rateToINR: number;
  inrValue: number;
  bookRate: number;
  bookValue: number;
  unrealizedGainLoss: number;
  ledgerName: string;
}

export interface RevaluationEntry {
  ledgerName: string;
  currency: string;
  foreignAmount: number;
  oldRate: number;
  newRate: number;
  oldINR: number;
  newINR: number;
  gainLoss: number;
}

export interface RateHistoryPoint {
  date: string;
  rate: number;
}

// Supported currencies with symbols
const CURRENCIES: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ',
  SGD: 'S$', AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥',
};

// Cache key
const CACHE_KEY = 'forex_rates_cache';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

// Demo rates (used when API unavailable)
const DEMO_RATES: Record<string, { rate: number; prev: number }> = {
  USD: { rate: 83.45, prev: 83.33 },
  EUR: { rate: 91.20, prev: 91.55 },
  GBP: { rate: 105.80, prev: 105.40 },
  JPY: { rate: 0.56, prev: 0.555 },
  AED: { rate: 22.72, prev: 22.69 },
  SGD: { rate: 62.30, prev: 62.10 },
  AUD: { rate: 54.80, prev: 55.10 },
  CAD: { rate: 61.50, prev: 61.30 },
  CHF: { rate: 93.40, prev: 93.20 },
  CNY: { rate: 11.50, prev: 11.48 },
};

// Demo exposure data
const DEMO_EXPOSURES: CurrencyExposure[] = [
  { currency: 'USD', symbol: '$', foreignBalance: 25000, rateToINR: 83.45, inrValue: 2086250, bookRate: 82.50, bookValue: 2062500, unrealizedGainLoss: 23750, ledgerName: 'Global Imports LLC' },
  { currency: 'EUR', symbol: '€', foreignBalance: 10000, rateToINR: 91.20, inrValue: 912000, bookRate: 90.80, bookValue: 908000, unrealizedGainLoss: 4000, ledgerName: 'EuroTech GmbH' },
  { currency: 'GBP', symbol: '£', foreignBalance: 5000, rateToINR: 105.80, inrValue: 529000, bookRate: 106.20, bookValue: 531000, unrealizedGainLoss: -2000, ledgerName: 'London Trade Co' },
  { currency: 'USD', symbol: '$', foreignBalance: -8000, rateToINR: 83.45, inrValue: -667600, bookRate: 83.10, bookValue: -664800, unrealizedGainLoss: -2800, ledgerName: 'US Supplier Inc' },
  { currency: 'AED', symbol: 'د.إ', foreignBalance: 15000, rateToINR: 22.72, inrValue: 340800, bookRate: 22.60, bookValue: 339000, unrealizedGainLoss: 1800, ledgerName: 'Dubai Exports LLC' },
];

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed: CachedRates = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCachedRates(rates: Record<string, number>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
}

// Fetch live rates from free API
export async function fetchLiveRates(): Promise<CurrencyRate[]> {
  const cached = getCachedRates();

  let liveRates: Record<string, number> | null = null;

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
    if (response.ok) {
      const data = await response.json();
      // API returns INR as base, so we need 1/rate for foreign-to-INR
      liveRates = {};
      for (const code of Object.keys(CURRENCIES)) {
        if (data.rates[code]) {
          liveRates[code] = 1 / data.rates[code];
        }
      }
      setCachedRates(liveRates);
    }
  } catch {
    // Fall through to cache or demo
  }

  if (!liveRates && cached) {
    liveRates = cached.rates;
  }

  // Build result
  return Object.entries(CURRENCIES).map(([code, symbol]) => {
    const rate = liveRates?.[code] ?? DEMO_RATES[code]?.rate ?? 1;
    const prev = DEMO_RATES[code]?.prev ?? rate;
    const change = rate - prev;
    return {
      currency: code,
      symbol,
      rateToINR: Math.round(rate * 100) / 100,
      previousRate: prev,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / prev) * 10000) / 100,
      lastUpdated: new Date(),
    };
  });
}

// Get exposure data (demo or from Tally currency ledgers)
export function getExposures(): CurrencyExposure[] {
  return DEMO_EXPOSURES;
}

// Calculate revaluation entries
export function calculateRevaluation(
  exposures: CurrencyExposure[],
  newRates: Record<string, number>
): RevaluationEntry[] {
  return exposures.map(exp => {
    const newRate = newRates[exp.currency] ?? exp.rateToINR;
    const newINR = exp.foreignBalance * newRate;
    const oldINR = exp.foreignBalance * exp.bookRate;
    return {
      ledgerName: exp.ledgerName,
      currency: exp.currency,
      foreignAmount: exp.foreignBalance,
      oldRate: exp.bookRate,
      newRate,
      oldINR,
      newINR,
      gainLoss: newINR - oldINR,
    };
  });
}

// Generate rate history (demo data with slight variations)
export function getRateHistory(currency: string, days: number = 30): RateHistoryPoint[] {
  const baseRate = DEMO_RATES[currency]?.rate ?? 1;
  const points: RateHistoryPoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Random walk around base rate
    const variance = (Math.random() - 0.5) * baseRate * 0.03;
    points.push({
      date: date.toISOString().split('T')[0],
      rate: Math.round((baseRate + variance) * 100) / 100,
    });
  }
  // Last point is current rate
  points[points.length - 1].rate = baseRate;
  return points;
}

// Format INR amount
export function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}
