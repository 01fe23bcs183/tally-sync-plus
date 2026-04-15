import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, XCircle, ArrowRightLeft, Upload, Zap,
  FileSpreadsheet, AlertTriangle, Building2
} from 'lucide-react';
import {
  getDemoBankTransactions, getDemoBookTransactions,
  autoMatch, applyMatches, getSummary,
  BankTransaction, BookTransaction
} from '@/services/bankReconciliationService';
import { toast } from 'sonner';

const formatAmount = (amount: number): string => {
  if (amount === 0) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const BankReconciliation = () => {
  const [bankTxns, setBankTxns] = useState<BankTransaction[]>(getDemoBankTransactions());
  const [bookTxns, setBookTxns] = useState<BookTransaction[]>(getDemoBookTransactions());
  const [isMatched, setIsMatched] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const summary = getSummary(bankTxns, bookTxns);

  const handleAutoMatch = useCallback(() => {
    const matches = autoMatch(bankTxns, bookTxns);
    const { bank, books } = applyMatches(bankTxns, bookTxns, matches);
    setBankTxns(bank);
    setBookTxns(books);
    setIsMatched(true);
    toast.success(`Auto-matched ${matches.length} transactions`);
  }, [bankTxns, bookTxns]);

  const handleManualMatch = useCallback(() => {
    if (!selectedBank || !selectedBook) {
      toast.error('Select one bank and one book transaction to match');
      return;
    }
    setBankTxns(prev => prev.map(t =>
      t.id === selectedBank ? { ...t, matchedWith: selectedBook, status: 'matched' as const } : t
    ));
    setBookTxns(prev => prev.map(t =>
      t.id === selectedBook ? { ...t, matchedWith: selectedBank, status: 'matched' as const, bankDate: bankTxns.find(b => b.id === selectedBank)?.date } : t
    ));
    setSelectedBank(null);
    setSelectedBook(null);
    toast.success('Manually matched transactions');
  }, [selectedBank, selectedBook, bankTxns]);

  const matchedBank = bankTxns.filter(t => t.status === 'matched');
  const unmatchedBank = bankTxns.filter(t => t.status === 'unmatched');
  const matchedBook = bookTxns.filter(t => t.status === 'matched');
  const unmatchedBook = bookTxns.filter(t => t.status === 'unmatched');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Bank Reconciliation</h2>
          <p className="text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 inline mr-1" />
            HDFC Bank A/c ****1234 • April 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" /> Upload Statement
          </Button>
          <Button size="sm" onClick={handleAutoMatch} disabled={isMatched}>
            <Zap className="h-4 w-4 mr-1" /> Auto-Match
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bank Balance</p>
            <p className="text-xl font-bold mt-1">{formatAmount(summary.bankBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">As per statement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Book Balance</p>
            <p className="text-xl font-bold mt-1">{formatAmount(summary.bookBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">As per Tally</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Difference</p>
            <p className={`text-xl font-bold mt-1 ${summary.difference === 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatAmount(summary.difference)}
            </p>
            <Badge variant={summary.difference === 0 ? 'secondary' : 'destructive'} className="mt-1 text-xs">
              {summary.difference === 0 ? 'Reconciled' : 'Unreconciled'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Match Rate</p>
            <p className="text-xl font-bold mt-1">{summary.matchRate}%</p>
            <Progress value={summary.matchRate} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalMatched} matched • {summary.bankOnly} bank-only • {summary.bookOnly} book-only
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sidebyside" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sidebyside" className="gap-1">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Side-by-Side
          </TabsTrigger>
          <TabsTrigger value="matched" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Matched ({summary.totalMatched})
          </TabsTrigger>
          <TabsTrigger value="unmatched" className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Unmatched ({summary.bankOnly + summary.bookOnly})
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1">
            <FileSpreadsheet className="h-3.5 w-3.5" /> BRS Report
          </TabsTrigger>
        </TabsList>

        {/* Side by Side */}
        <TabsContent value="sidebyside">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bank Statement Side */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Bank Statement
                  <Badge variant="outline" className="text-xs ml-auto">{bankTxns.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {bankTxns.map(t => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-all ${
                        t.status === 'matched' ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' :
                        selectedBank === t.id ? 'bg-primary/10 border border-primary' :
                        'hover:bg-muted/50 border border-transparent'
                      }`}
                      onClick={() => t.status === 'unmatched' && setSelectedBank(t.id)}
                    >
                      {t.status === 'matched' ?
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> :
                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{t.date} • {t.reference}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {t.credit > 0 && <p className="text-green-600 font-mono text-sm">+{formatAmount(t.credit)}</p>}
                        {t.debit > 0 && <p className="text-red-500 font-mono text-sm">-{formatAmount(t.debit)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Book Side */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Tally Books
                  <Badge variant="outline" className="text-xs ml-auto">{bookTxns.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {bookTxns.map(t => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-all ${
                        t.status === 'matched' ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' :
                        selectedBook === t.id ? 'bg-primary/10 border border-primary' :
                        'hover:bg-muted/50 border border-transparent'
                      }`}
                      onClick={() => t.status === 'unmatched' && setSelectedBook(t.id)}
                    >
                      {t.status === 'matched' ?
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> :
                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.partyName || t.narration}</p>
                        <p className="text-xs text-muted-foreground">{t.date} • {t.voucherType} {t.voucherNumber}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {t.credit > 0 && <p className="text-green-600 font-mono text-sm">+{formatAmount(t.credit)}</p>}
                        {t.debit > 0 && <p className="text-red-500 font-mono text-sm">-{formatAmount(t.debit)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manual match button */}
          {selectedBank && selectedBook && (
            <div className="flex justify-center pt-2">
              <Button onClick={handleManualMatch}>
                <ArrowRightLeft className="h-4 w-4 mr-1" /> Match Selected Transactions
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Matched Tab */}
        <TabsContent value="matched">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Matched Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {matchedBank.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No matches yet. Click "Auto-Match" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 font-medium">Bank Description</th>
                        <th className="text-left py-2 font-medium">Book Entry</th>
                        <th className="text-right py-2 font-medium">Amount</th>
                        <th className="text-center py-2 font-medium">Date (Bank)</th>
                        <th className="text-center py-2 font-medium">Date (Book)</th>
                        <th className="text-center py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedBank.map(bt => {
                        const bk = matchedBook.find(k => k.id === bt.matchedWith);
                        return (
                          <tr key={bt.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2">{bt.description}</td>
                            <td className="py-2">{bk?.partyName || bk?.narration || '—'}</td>
                            <td className="py-2 text-right font-mono">
                              {formatAmount(bt.credit > 0 ? bt.credit : bt.debit)}
                            </td>
                            <td className="py-2 text-center text-xs">{bt.date}</td>
                            <td className="py-2 text-center text-xs">{bk?.date || '—'}</td>
                            <td className="py-2 text-center">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unmatched Tab */}
        <TabsContent value="unmatched" className="space-y-4">
          {unmatchedBank.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Bank-Only Transactions
                  <Badge variant="destructive" className="text-xs">{unmatchedBank.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unmatchedBank.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{t.date} • {t.reference}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {t.credit > 0 ? `+${formatAmount(t.credit)}` : `-${formatAmount(t.debit)}`}
                        </span>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          Create Entry
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {unmatchedBook.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  Book-Only Transactions
                  <Badge variant="outline" className="text-xs">{unmatchedBook.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unmatchedBook.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{t.partyName || t.narration}</p>
                        <p className="text-xs text-muted-foreground">{t.date} • {t.voucherType} {t.voucherNumber}</p>
                      </div>
                      <span className="font-mono text-sm">
                        {t.credit > 0 ? `+${formatAmount(t.credit)}` : `-${formatAmount(t.debit)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {unmatchedBank.length === 0 && unmatchedBook.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-medium">All transactions matched!</p>
              <p className="text-sm text-muted-foreground">Bank and book records are fully reconciled.</p>
            </div>
          )}
        </TabsContent>

        {/* BRS Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bank Reconciliation Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-lg mx-auto space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b">
                    <span>Balance as per Bank Statement</span>
                    <span className="font-mono font-semibold">{formatAmount(summary.bankBalance)}</span>
                  </div>

                  <div className="pl-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium mt-2">Add: Cheques issued but not presented</p>
                    {unmatchedBook.filter(t => t.debit > 0).map(t => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t.partyName} ({t.voucherNumber})</span>
                        <span className="font-mono">{formatAmount(t.debit)}</span>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground font-medium mt-2">Less: Cheques deposited but not cleared</p>
                    {unmatchedBank.filter(t => t.credit > 0).map(t => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t.description}</span>
                        <span className="font-mono">({formatAmount(t.credit)})</span>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground font-medium mt-2">Less: Bank charges not in books</p>
                    {unmatchedBank.filter(t => t.debit > 0).map(t => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t.description}</span>
                        <span className="font-mono">({formatAmount(t.debit)})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between py-1.5 border-t-2 font-bold">
                    <span>Balance as per Books</span>
                    <span className="font-mono">{formatAmount(summary.bookBalance)}</span>
                  </div>

                  {summary.difference !== 0 && (
                    <div className="flex justify-between py-1.5 text-red-500">
                      <span>Unreconciled Difference</span>
                      <span className="font-mono font-semibold">{formatAmount(summary.difference)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankReconciliation;
