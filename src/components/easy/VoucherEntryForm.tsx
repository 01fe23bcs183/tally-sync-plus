import { useState, useMemo, useCallback } from 'react';
import { useLedgers, useVouchers } from '@/hooks/useTallyData';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Save, X, Plus, Trash2, AlertTriangle, Copy, BookmarkPlus,
  Zap, AlertCircle
} from 'lucide-react';
import LedgerAutocomplete from './LedgerAutocomplete';
import {
  detectDuplicates, suggestLedgerPairs, suggestNarrations, validateVoucher,
  getTemplates, saveTemplate, deleteTemplate,
  VoucherTemplate
} from '@/services/voucherPatternService';
import { VoucherType, VoucherEntry } from '@/types/tally';
import { importVoucher } from '@/services/tallyXmlService';
import { toast } from 'sonner';

const voucherTypes: VoucherType[] = ['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra'];

interface VoucherEntryFormProps {
  onClose: () => void;
  onSaved?: () => void;
}

const VoucherEntryForm = ({ onClose, onSaved }: VoucherEntryFormProps) => {
  const { connection, selectedCompany } = useApp();
  const { data: ledgers = [] } = useLedgers();
  const { data: vouchers = [] } = useVouchers();

  const ledgerNames = useMemo(() => ledgers.map(l => l.name), [ledgers]);

  const today = new Date().toISOString().split('T')[0];

  const [voucherType, setVoucherType] = useState<VoucherType>('Sales');
  const [date, setDate] = useState(today);
  const [partyName, setPartyName] = useState('');
  const [narration, setNarration] = useState('');
  const [entries, setEntries] = useState<VoucherEntry[]>([
    { ledgerName: '', amount: 0, isDebit: true },
    { ledgerName: '', amount: 0, isDebit: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Computed
  const duplicates = useMemo(() => {
    const totalAmount = entries.filter(e => e.isDebit).reduce((s, e) => s + e.amount, 0);
    return detectDuplicates(vouchers, partyName || undefined, totalAmount, date, voucherType);
  }, [vouchers, partyName, entries, date, voucherType]);

  const validation = useMemo(
    () => validateVoucher(voucherType, entries, date, partyName || undefined),
    [voucherType, entries, date, partyName]
  );

  const errors = validation.filter(v => v.severity === 'error');
  const warnings = validation.filter(v => v.severity === 'warning');

  const narrationSuggestions = useMemo(
    () => suggestNarrations(vouchers, partyName || undefined, voucherType),
    [vouchers, partyName, voucherType]
  );

  const totalDebit = entries.filter(e => e.isDebit).reduce((s, e) => s + e.amount, 0);
  const totalCredit = entries.filter(e => !e.isDebit).reduce((s, e) => s + e.amount, 0);

  // Get suggested credit ledgers based on first debit entry
  const suggestedCreditLedgers = useMemo(() => {
    const firstDebit = entries.find(e => e.isDebit && e.ledgerName);
    if (!firstDebit) return [];
    return suggestLedgerPairs(vouchers, firstDebit.ledgerName, voucherType).map(s => s.creditLedger);
  }, [entries, vouchers, voucherType]);

  const updateEntry = (index: number, field: keyof VoucherEntry, value: any) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { ledgerName: '', amount: 0, isDebit: false }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 2) return;
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-balance: when debit changes, set first credit to match
  const autoBalance = useCallback(() => {
    const debitTotal = entries.filter(e => e.isDebit).reduce((s, e) => s + e.amount, 0);
    const creditEntries = entries.filter(e => !e.isDebit);
    if (creditEntries.length === 1) {
      const creditIdx = entries.findIndex(e => !e.isDebit);
      updateEntry(creditIdx, 'amount', debitTotal);
    }
  }, [entries]);

  const handleSave = async () => {
    if (errors.length > 0) {
      toast.error('Fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      if (connection.isConnected && selectedCompany) {
        const success = await importVoucher(selectedCompany, {
          voucherType,
          date: date.split('-').reverse().join('-'), // YYYY-MM-DD → DD-MM-YYYY
          narration,
          partyName: partyName || undefined,
          entries,
        });
        if (success) {
          toast.success('Voucher saved to Tally');
          onSaved?.();
          onClose();
        } else {
          toast.error('Failed to save voucher to Tally');
        }
      } else {
        // Demo mode — just close
        toast.success('Voucher saved (demo mode)');
        onSaved?.();
        onClose();
      }
    } catch {
      toast.error('Error saving voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate({
      name: templateName.trim(),
      voucherType,
      entries,
      narration,
      partyName: partyName || undefined,
    });
    toast.success(`Template "${templateName}" saved`);
    setTemplateName('');
    setShowTemplates(false);
  };

  const loadTemplate = (t: VoucherTemplate) => {
    setVoucherType(t.voucherType);
    setEntries(t.entries.map(e => ({ ...e })));
    setNarration(t.narration);
    if (t.partyName) setPartyName(t.partyName);
    setShowTemplates(false);
    toast.info(`Template "${t.name}" loaded`);
  };

  const templates = getTemplates();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">New Voucher</h2>
        <div className="flex gap-2">
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Copy className="h-3.5 w-3.5" /> Templates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voucher Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {templates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No templates saved yet</p>
                )}
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.voucherType} • {t.entries.length} entries</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => loadTemplate(t)}>Load</Button>
                      <Button size="sm" variant="ghost" onClick={() => { deleteTemplate(t.id); setShowTemplates(false); setTimeout(() => setShowTemplates(true), 50); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <Label className="text-xs">Save current as template</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Template name..."
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                      <BookmarkPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Type, Date, Party */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Voucher Type</Label>
          <Select value={voucherType} onValueChange={v => setVoucherType(v as VoucherType)}>
            <SelectTrigger className="h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voucherTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 mt-1" />
        </div>
        <div>
          <Label className="text-xs">Party Name</Label>
          <LedgerAutocomplete
            ledgers={ledgerNames}
            value={partyName}
            onChange={setPartyName}
            placeholder="Select party..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <span className="font-medium">Possible duplicate{duplicates.length > 1 ? 's' : ''}:</span>{' '}
            {duplicates.map((d, i) => (
              <span key={i}>
                {d.voucher.voucherNumber} ({d.voucher.date}) — {d.reasons.join(', ')}
                {i < duplicates.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Ledger Entries */}
      <Card>
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Ledger Entries</CardTitle>
            <div className="flex items-center gap-3 text-xs">
              <span>Dr: <strong className="text-green-600">₹{totalDebit.toLocaleString('en-IN')}</strong></span>
              <span>Cr: <strong className="text-red-500">₹{totalCredit.toLocaleString('en-IN')}</strong></span>
              {Math.abs(totalDebit - totalCredit) > 0.01 && (
                <Badge variant="destructive" className="text-[10px]">Unbalanced</Badge>
              )}
              {Math.abs(totalDebit - totalCredit) <= 0.01 && totalDebit > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">Balanced ✓</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={entry.isDebit ? 'dr' : 'cr'}
                onValueChange={v => updateEntry(i, 'isDebit', v === 'dr')}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr">Dr</SelectItem>
                  <SelectItem value="cr">Cr</SelectItem>
                </SelectContent>
              </Select>

              <LedgerAutocomplete
                ledgers={ledgerNames}
                value={entry.ledgerName}
                onChange={v => updateEntry(i, 'ledgerName', v)}
                placeholder="Ledger..."
                className="flex-1"
                suggested={!entry.isDebit ? suggestedCreditLedgers : []}
              />

              <Input
                type="number"
                value={entry.amount || ''}
                onChange={e => updateEntry(i, 'amount', parseFloat(e.target.value) || 0)}
                onBlur={autoBalance}
                placeholder="Amount"
                className="w-32 h-8 text-sm text-right font-mono"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeEntry(i)}
                disabled={entries.length <= 2}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addEntry} className="gap-1 text-xs">
            <Plus className="h-3 w-3" /> Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Narration */}
      <div>
        <Label className="text-xs">Narration</Label>
        <Textarea
          value={narration}
          onChange={e => setNarration(e.target.value)}
          placeholder="Enter narration..."
          className="mt-1 h-16 text-sm"
        />
        {narrationSuggestions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            <Zap className="h-3 w-3 text-yellow-500 mt-0.5" />
            {narrationSuggestions.map((n, i) => (
              <button
                key={i}
                onClick={() => setNarration(n)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent cursor-pointer"
              >
                {n.length > 40 ? n.slice(0, 40) + '…' : n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation Errors/Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <div key={`e${i}`} className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {e.message}
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={`w${i}`} className="flex items-center gap-1.5 text-xs text-yellow-600">
              <AlertTriangle className="h-3 w-3" /> {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={errors.length > 0 || saving} className="gap-1">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Voucher'}
        </Button>
      </div>
    </div>
  );
};

export default VoucherEntryForm;
