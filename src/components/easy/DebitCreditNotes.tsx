import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  FileText, Plus, ArrowUpRight, ArrowDownRight, Link2,
  CheckCircle2, Send
} from 'lucide-react';
import {
  getNotes, getInvoices, getInvoiceByNumber, getAllReasons,
  calculateGST, formatNoteAmt, STATUS_CONFIG,
  NoteType, NoteReason, NoteEntry
} from '@/services/debitCreditNoteService';
import { toast } from 'sonner';

const DebitCreditNotes = () => {
  const [view, setView] = useState<NoteType>('credit');
  const [showCreate, setShowCreate] = useState(false);
  const notes = getNotes().filter(n => n.noteType === view);
  const allNotes = getNotes();

  const totalCreditNotes = allNotes.filter(n => n.noteType === 'credit').reduce((s, n) => s + n.total, 0);
  const totalDebitNotes = allNotes.filter(n => n.noteType === 'debit').reduce((s, n) => s + n.total, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Debit / Credit Notes</h2>
          <p className="text-sm text-muted-foreground">Manage returns, adjustments & GST reversals</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> New {view === 'credit' ? 'Credit' : 'Debit'} Note
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Credit Notes</p>
            <p className="text-xl font-bold mt-1">{formatNoteAmt(totalCreditNotes)}</p>
            <p className="text-xs text-muted-foreground mt-1">{allNotes.filter(n => n.noteType === 'credit').length} notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Debit Notes</p>
            <p className="text-xl font-bold mt-1">{formatNoteAmt(totalDebitNotes)}</p>
            <p className="text-xs text-muted-foreground mt-1">{allNotes.filter(n => n.noteType === 'debit').length} notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Approval</p>
            <p className="text-xl font-bold mt-1">{allNotes.filter(n => n.status === 'draft' || n.status === 'review').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Synced to Tally</p>
            <p className="text-xl font-bold mt-1">{allNotes.filter(n => n.status === 'synced').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toggle + List */}
      <div className="flex gap-1 mb-2">
        <Button variant={view === 'credit' ? 'default' : 'outline'} size="sm" onClick={() => setView('credit')}>
          <ArrowDownRight className="h-3.5 w-3.5 mr-1" /> Credit Notes
        </Button>
        <Button variant={view === 'debit' ? 'default' : 'outline'} size="sm" onClick={() => setView('debit')}>
          <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Debit Notes
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-3 font-medium">Note #</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Party</th>
                <th className="text-left p-3 font-medium">Linked Invoice</th>
                <th className="text-left p-3 font-medium">Reason</th>
                <th className="text-right p-3 font-medium">Subtotal</th>
                <th className="text-right p-3 font-medium">GST</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(n => {
                const sc = STATUS_CONFIG[n.status];
                return (
                  <tr key={n.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">{n.noteNumber}</td>
                    <td className="p-3 text-xs">{n.date}</td>
                    <td className="p-3">{n.partyName}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-xs">
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                        {n.linkedInvoice}
                      </span>
                    </td>
                    <td className="p-3 text-xs">{n.reasonText}</td>
                    <td className="p-3 text-right font-mono">{formatNoteAmt(n.subtotal)}</td>
                    <td className="p-3 text-right font-mono text-xs">{formatNoteAmt(n.cgst + n.sgst)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{formatNoteAmt(n.total)}</td>
                    <td className="p-3 text-center">
                      <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                    </td>
                  </tr>
                );
              })}
              {notes.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No {view} notes found</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Items detail for each note */}
      {notes.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {notes.map(n => (
            <Card key={n.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {n.noteNumber} — {n.partyName}
                  </CardTitle>
                  <Badge variant={STATUS_CONFIG[n.status].variant} className="text-xs">
                    {STATUS_CONFIG[n.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs mb-3">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left py-1 font-medium">Item</th>
                      <th className="text-right py-1 font-medium">Qty</th>
                      <th className="text-right py-1 font-medium">Rate</th>
                      <th className="text-right py-1 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {n.entries.map((e, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1">{e.itemName}</td>
                        <td className="py-1 text-right font-mono">{e.qty}</td>
                        <td className="py-1 text-right font-mono">{formatNoteAmt(e.rate)}</td>
                        <td className="py-1 text-right font-mono">{formatNoteAmt(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="space-y-0.5 text-xs border-t pt-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatNoteAmt(n.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span className="font-mono">{formatNoteAmt(n.cgst)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span className="font-mono">{formatNoteAmt(n.sgst)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span className="font-mono">{formatNoteAmt(n.total)}</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  {n.status === 'draft' && <Button size="sm" variant="outline" className="text-xs h-7"><Send className="h-3 w-3 mr-1" />Submit for Review</Button>}
                  {n.status === 'review' && <Button size="sm" className="text-xs h-7"><CheckCircle2 className="h-3 w-3 mr-1" />Approve</Button>}
                  {n.status === 'approved' && <Button size="sm" className="text-xs h-7">Sync to Tally</Button>}
                  {n.status === 'synced' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Synced</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateNoteDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        noteType={view}
      />
    </div>
  );
};

// Create Note Dialog
const CreateNoteDialog = ({ open, onClose, noteType }: { open: boolean; onClose: () => void; noteType: NoteType }) => {
  const invoices = getInvoices();
  const reasons = getAllReasons();
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [reason, setReason] = useState<NoteReason>('return');
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [created, setCreated] = useState(false);

  const invoice = getInvoiceByNumber(selectedInvoice);

  const handleInvoiceSelect = (num: string) => {
    setSelectedInvoice(num);
    const inv = getInvoiceByNumber(num);
    if (inv) {
      setEntries(inv.items.map(i => ({ itemName: i.name, qty: 0, rate: i.rate, amount: 0 })));
    }
  };

  const updateEntry = (idx: number, field: 'qty' | 'rate', value: number) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const updated = { ...e, [field]: value };
      updated.amount = updated.qty * updated.rate;
      return updated;
    }));
  };

  const subtotal = entries.reduce((s, e) => s + e.amount, 0);
  const gst = invoice ? calculateGST(subtotal, invoice.gstRate) : { cgst: 0, sgst: 0, total: subtotal };

  const handleCreate = () => {
    if (!selectedInvoice || subtotal === 0) {
      toast.error('Select an invoice and add at least one item');
      return;
    }
    setCreated(true);
    toast.success(`${noteType === 'credit' ? 'Credit' : 'Debit'} Note created as draft`);
  };

  const handleClose = () => {
    setSelectedInvoice('');
    setEntries([]);
    setCreated(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New {noteType === 'credit' ? 'Credit' : 'Debit'} Note</DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
            <p className="font-semibold">Note Created (Draft)</p>
            <p className="text-sm text-muted-foreground">
              {noteType === 'credit' ? 'Credit' : 'Debit'} Note for {formatNoteAmt(gst.total)} against {selectedInvoice}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invoice Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs">Linked Invoice</Label>
              <Select value={selectedInvoice} onValueChange={handleInvoiceSelect}>
                <SelectTrigger><SelectValue placeholder="Select invoice..." /></SelectTrigger>
                <SelectContent>
                  {invoices.map(inv => (
                    <SelectItem key={inv.invoiceNumber} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} — {inv.partyName} — {formatNoteAmt(inv.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {invoice && (
              <>
                <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-0.5">
                  <p><strong>Party:</strong> {invoice.partyName}</p>
                  <p><strong>Date:</strong> {invoice.date}</p>
                  <p><strong>Amount:</strong> {formatNoteAmt(invoice.amount)} (GST {invoice.gstRate}%)</p>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Reason</Label>
                  <Select value={reason} onValueChange={v => setReason(v as NoteReason)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {reasons.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Items (enter qty to include)</Label>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs">
                        <th className="text-left py-1 font-medium">Item</th>
                        <th className="text-right py-1 font-medium w-20">Qty</th>
                        <th className="text-right py-1 font-medium w-20">Rate</th>
                        <th className="text-right py-1 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-1.5 text-xs">{e.itemName}</td>
                          <td className="py-1.5">
                            <Input
                              type="number"
                              min={0}
                              max={invoice.items[i]?.qty ?? 999}
                              value={e.qty || ''}
                              onChange={ev => updateEntry(i, 'qty', Number(ev.target.value))}
                              className="h-7 text-xs text-right w-20"
                            />
                          </td>
                          <td className="py-1.5 text-right font-mono text-xs">{formatNoteAmt(e.rate)}</td>
                          <td className="py-1.5 text-right font-mono text-xs">{e.amount > 0 ? formatNoteAmt(e.amount) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                {subtotal > 0 && (
                  <div className="border rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatNoteAmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">CGST ({invoice.gstRate / 2}%)</span><span className="font-mono">{formatNoteAmt(gst.cgst)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SGST ({invoice.gstRate / 2}%)</span><span className="font-mono">{formatNoteAmt(gst.sgst)}</span></div>
                    <div className="flex justify-between font-bold border-t pt-1"><span>Total</span><span className="font-mono">{formatNoteAmt(gst.total)}</span></div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {created ? (
            <Button onClick={handleClose}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!selectedInvoice || subtotal === 0}>
                Save as Draft
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebitCreditNotes;
