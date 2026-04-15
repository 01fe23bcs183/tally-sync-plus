// Tally XML API Service - handles communication with Tally Prime on localhost

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 9000;

let tallyHost = DEFAULT_HOST;
let tallyPort = DEFAULT_PORT;

export const setTallyConfig = (host: string, port: number) => {
  tallyHost = host;
  tallyPort = port;
};

export const getTallyUrl = () => `http://${tallyHost}:${tallyPort}`;

// Send XML request to Tally
const sendRequest = async (xmlPayload: string): Promise<string> => {
  const response = await fetch(getTallyUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml' },
    body: xmlPayload,
  });
  if (!response.ok) {
    throw new Error(`Tally responded with status ${response.status}`);
  }
  return response.text();
};

// Parse simple XML value
const getXmlValue = (xml: string, tag: string): string => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'si');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
};

// Parse multiple XML values
const getXmlValues = (xml: string, tag: string): string[] => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'gsi');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};

// Parse XML blocks
const getXmlBlocks = (xml: string, tag: string): string[] => {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// Get attribute value
const getXmlAttr = (xml: string, tag: string, attr: string): string => {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const xml = `<ENVELOPE>
      <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
      <BODY><EXPORTDATA><REQUESTDESC>
        <REPORTNAME>List of Companies</REPORTNAME>
      </REQUESTDESC></EXPORTDATA></BODY>
    </ENVELOPE>`;
    await sendRequest(xml);
    return true;
  } catch {
    return false;
  }
};

// Fetch company list
export const fetchCompanies = async (): Promise<{ name: string; formalName: string }[]> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <REPORTNAME>List of Companies</REPORTNAME>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  const names = getXmlValues(response, 'NAME');
  return names.map(name => ({ name, formalName: name }));
};

// Fetch ledgers
export const fetchLedgers = async (companyName: string): Promise<any[]> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      <REPORTNAME>List of Ledgers</REPORTNAME>
      <STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  const ledgerBlocks = getXmlBlocks(response, 'LEDGER');
  return ledgerBlocks.map(block => ({
    name: getXmlValue(block, 'NAME') || getXmlAttr(block, 'LEDGER', 'NAME'),
    parent: getXmlValue(block, 'PARENT'),
    openingBalance: parseFloat(getXmlValue(block, 'OPENINGBALANCE') || '0'),
    closingBalance: parseFloat(getXmlValue(block, 'CLOSINGBALANCE') || '0'),
  }));
};

// Fetch stock items
export const fetchStockItems = async (companyName: string): Promise<any[]> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      <REPORTNAME>List of Stock Items</REPORTNAME>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  const items = getXmlBlocks(response, 'STOCKITEM');
  return items.map(block => ({
    name: getXmlValue(block, 'NAME') || getXmlAttr(block, 'STOCKITEM', 'NAME'),
    parent: getXmlValue(block, 'PARENT'),
    unit: getXmlValue(block, 'BASEUNITS'),
    openingBalance: parseFloat(getXmlValue(block, 'OPENINGBALANCE') || '0'),
    openingRate: parseFloat(getXmlValue(block, 'OPENINGRATE') || '0'),
    openingValue: parseFloat(getXmlValue(block, 'OPENINGVALUE') || '0'),
    closingBalance: parseFloat(getXmlValue(block, 'CLOSINGBALANCE') || '0'),
    closingRate: parseFloat(getXmlValue(block, 'CLOSINGRATE') || '0'),
    closingValue: parseFloat(getXmlValue(block, 'CLOSINGVALUE') || '0'),
  }));
};

// Fetch vouchers (Day Book)
export const fetchVouchers = async (companyName: string, fromDate?: string, toDate?: string): Promise<any[]> => {
  const dateFilter = fromDate && toDate ? `
    <SVFROMDATE>${fromDate}</SVFROMDATE>
    <SVTODATE>${toDate}</SVTODATE>
  ` : '';
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <STATICVARIABLES>
        <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        ${dateFilter}
      </STATICVARIABLES>
      <REPORTNAME>Day Book</REPORTNAME>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  const vouchers = getXmlBlocks(response, 'VOUCHER');
  return vouchers.map(block => ({
    id: getXmlAttr(block, 'VOUCHER', 'REMOTEID') || Math.random().toString(36).substr(2, 9),
    date: getXmlValue(block, 'DATE'),
    voucherType: getXmlValue(block, 'VOUCHERTYPENAME'),
    voucherNumber: getXmlValue(block, 'VOUCHERNUMBER'),
    narration: getXmlValue(block, 'NARRATION'),
    partyName: getXmlValue(block, 'PARTYLEDGERNAME'),
    totalAmount: Math.abs(parseFloat(getXmlValue(block, 'AMOUNT') || '0')),
    isSynced: true,
    syncStatus: 'synced' as const,
    entries: [],
  }));
};

// Fetch Balance Sheet
export const fetchBalanceSheet = async (companyName: string): Promise<any> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      <REPORTNAME>Balance Sheet</REPORTNAME>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  return response;
};

// Fetch Profit & Loss
export const fetchProfitLoss = async (companyName: string): Promise<any> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
    <BODY><EXPORTDATA><REQUESTDESC>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
      <REPORTNAME>Profit and Loss</REPORTNAME>
    </REQUESTDESC></EXPORTDATA></BODY>
  </ENVELOPE>`;
  const response = await sendRequest(xml);
  return response;
};

// Import voucher to Tally (two-way sync)
export const importVoucher = async (companyName: string, voucher: any): Promise<boolean> => {
  const entries = voucher.entries.map((e: any) => `
    <ALLLEDGERENTRIES.LIST>
      <LEDGERNAME>${e.ledgerName}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>${e.isDebit ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
      <AMOUNT>${e.isDebit ? -Math.abs(e.amount) : Math.abs(e.amount)}</AMOUNT>
    </ALLLEDGERENTRIES.LIST>
  `).join('');

  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
    <BODY><IMPORTDATA><REQUESTDESC>
      <REPORTNAME>Vouchers</REPORTNAME>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
    </REQUESTDESC>
    <REQUESTDATA>
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="${voucher.voucherType}" ACTION="Create">
          <DATE>${voucher.date}</DATE>
          <VOUCHERTYPENAME>${voucher.voucherType}</VOUCHERTYPENAME>
          <NARRATION>${voucher.narration || ''}</NARRATION>
          ${voucher.partyName ? `<PARTYLEDGERNAME>${voucher.partyName}</PARTYLEDGERNAME>` : ''}
          ${entries}
        </VOUCHER>
      </TALLYMESSAGE>
    </REQUESTDATA></IMPORTDATA></BODY>
  </ENVELOPE>`;

  try {
    const response = await sendRequest(xml);
    return !response.includes('LINEERROR');
  } catch {
    return false;
  }
};

// Import ledger to Tally
export const importLedger = async (companyName: string, ledger: any): Promise<boolean> => {
  const xml = `<ENVELOPE>
    <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
    <BODY><IMPORTDATA><REQUESTDESC>
      <REPORTNAME>All Masters</REPORTNAME>
      <STATICVARIABLES><SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY></STATICVARIABLES>
    </REQUESTDESC>
    <REQUESTDATA>
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <LEDGER NAME="${ledger.name}" ACTION="Create">
          <NAME>${ledger.name}</NAME>
          <PARENT>${ledger.parent}</PARENT>
          ${ledger.openingBalance ? `<OPENINGBALANCE>${ledger.openingBalance}</OPENINGBALANCE>` : ''}
          ${ledger.address ? `<ADDRESS>${ledger.address}</ADDRESS>` : ''}
        </LEDGER>
      </TALLYMESSAGE>
    </REQUESTDATA></IMPORTDATA></BODY>
  </ENVELOPE>`;

  try {
    const response = await sendRequest(xml);
    return !response.includes('LINEERROR');
  } catch {
    return false;
  }
};
