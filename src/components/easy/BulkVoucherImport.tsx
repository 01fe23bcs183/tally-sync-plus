import { useState, useCallback, useMemo } from 'react';
import { useLedgers } from '@/hooks/useTallyData';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload, FileSpreadsheet, ArrowRight, CheckCircle, AlertTriangle,
  AlertCircle, X, Play, Save, Trash2
} from 'lucide-react';
import {
  parseFile, autoMapColumns, processRows, batchImport,
  getImportTemplates, saveImportTemplate, deleteImportTemplate,
  ParsedFile, TallyField, TALLY_FIELDS, ImportRow, ImportProgress, ImportTemplate
} from '@/services/bulkImportService';
import LedgerAutocomplete from './LedgerAutocomplete';
import { VoucherType } from '@/types/tally';
import { toast } from 'sonner';

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'done';

interface BulkVoucherImportProps {
  onClose: () => void;
  onDone?: () => void;
}

const BulkVoucherImport = ({ onClose, onDone }: BulkVoucherImportProps) => {
  const { connection, selectedCompany } = useApp();
  const { data: ledgers = [] } = useLedgers();
  const ledgerNames = useMemo(() => ledgers.map(l => l.name), [ledgers]);

  const [step, setStep] = useState<Step>('upload');
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<Record<string, TallyField>>({});
  const [processedRows, setProcessedRows] = useState<ImportRow[]>([]);
  const [defaultCounterLedger, setDefaultCounterLedger] = useState('');
  const [defaultVoucherType, setDefaultVoucherType] = useState<VoucherType>('Payment');
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Step 1: File Upload
  const handleFile = useCallback(async (file: File) => {
    try {
      const parsed = await parseFile(file);
      setParsedFile(parsed);
      const autoMap = autoMapColumns(parsed.headers);
      setMapping(autoMap);
      setStep('mapping');
      toast.success(`Parsed ${parsed.rows.length} rows from ${file.name}`);
    } catch (err) {
      toast.error(String(err));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // Step 2: Process mapping → preview
  const handleProceedToPreview = useCallback(() => {
    if (!parsedFile) return;
    const rows = processRows(parsedFile.rows, mapping, ledgerNames);
    setProcessedRows(rows);
    setStep('preview');
  }, [parsedFile, mapping, ledgerNames]);

  // Step 3: Start import
  const handleStartImport = useCallback(async () => {
    if (!selectedCompany && connection.isConnected) {
      toast.error('Select a company first');
      return;
    }

    setStep('importing');
    const company = selectedCompany || 'Demo Company';

    if (!connection.isConnected) {
      // Demo mode - simulate
      const total = processedRows.filter(r => r.errors.length === 0).length;
      for (let i = 0; i <= total; i++) {
        await new Promise(r => setTimeout(r, 50));
        setProgress({ total, completed: i, success: i, failed: 0, errors: [] });
      }
      setStep('done');
      toast.success(`Imported ${total} vouchers (demo mode)`);
      return;
    }

    const result = await batchImport(processedRows, company, defaultCounterLedger, setProgress);
    setStep('done');
    if (result.failed === 0) {
      toast.success(`Successfully imported ${result.success} vouchers`);
    } else {
      toast.warning(`Imported ${result.success}, failed ${result.failed}`);
    }
  }, [processedRows, selectedCompany, connection.isConnected, defaultCounterLedger]);

  // Load template
  const loadTemplate = (t: ImportTemplate) => {
    setMapping(t.mapping);
    setDefaultVoucherType(t.defaultVoucherType);
    setDefaultCounterLedger(t.defaultCounterLedger);
    toast.info(`Template "${t.name}" loaded`);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveImportTemplate({
      name: templateName.trim(),
      mapping,
      defaultVoucherType,
      defaultCounterLedger,
    });
    toast.success(`Template "${templateName}" saved`);
    setTemplateName('');
  };

  const templates = getImportTemplates();
  const validCount = processedRows.filter(r => r.errors.length === 0).length;
  const errorCount = processedRows.filter(r => r.errors.length > 0).length;
  const warningCount = processedRows.filter(r => r.warnings.length > 0 && r.errors.length === 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          <h2 className="text-xl font-bold">Bulk Import Vouchers</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {(['upload', 'mapping', 'preview', 'importing'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <span className={step === s ? 'font-bold text-primary' : s < step ? 'text-muted-foreground' : 'text-muted-foreground/50'}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drop CSV or Excel file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <p className="text-xs text-muted-foreground mt-3">Supports .csv, .xlsx, .xls</p>
            <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileInput} />
          </div>

          {templates.length > 0 && (
            <Card>
              <CardHeader className="py-2 px-4"><CardTitle className="text-sm">Saved Templates</CardTitle></CardHeader>
              <CardContent className="px-4 pb-3 space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-1 border-b last:border-0">
                    <span className="text-sm">{t.name}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => loadTemplate(t)}>Use</Button>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => { deleteImportTemplate(t.id); toast.info('Template deleted'); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && parsedFile && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-sm">Column Mapping — {parsedFile.fileName} ({parsedFile.rows.length} rows)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {parsedFile.headers.map(header => (
                <div key={header} className="flex items-center gap-3">
                  <span className="text-sm w-40 truncate font-mono">{header}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <Select value={mapping[header] || 'ignore'} onValueChange={v => setMapping(prev => ({ ...prev, [header]: v as TallyField }))}>
                    <SelectTrigger className="h-8 text-xs w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TALLY_FIELDS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground truncate flex-1">
                    e.g. "{parsedFile.rows[0]?.[header]}"
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Default Voucher Type</Label>
              <Select value={defaultVoucherType} onValueChange={v => setDefaultVoucherType(v as VoucherType)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Default Counter Ledger</Label>
              <LedgerAutocomplete
                ledgers={ledgerNames}
                value={defaultCounterLedger}
                onChange={setDefaultCounterLedger}
                placeholder="e.g. Bank of India"
                className="mt-1"
              />
            </div>
          </div>

          {/* Save template */}
          <div className="flex gap-2">
            <Input placeholder="Save mapping as template..." value={templateName} onChange={e => setTemplateName(e.target.value)} className="h-8 text-sm" />
            <Button size="sm" variant="outline" onClick={handleSaveTemplate} disabled={!templateName.trim()} className="gap-1">
              <Save className="h-3 w-3" /> Save
            </Button>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={handleProceedToPreview} className="gap-1">
              Preview <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> {validCount} valid
            </Badge>
            {warningCount > 0 && (
              <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
                <AlertTriangle className="h-3 w-3" /> {warningCount} warnings
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> {errorCount} errors
              </Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="max-h-[350px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Party</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Dr/Cr</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRows.slice(0, 100).map(row => (
                      <TableRow key={row.index} className={row.errors.length > 0 ? 'bg-destructive/5' : row.warnings.length > 0 ? 'bg-yellow-50' : ''}>
                        <TableCell className="text-xs text-muted-foreground">{row.index + 1}</TableCell>
                        <TableCell className="text-xs">{row.date || '—'}</TableCell>
                        <TableCell className="text-xs">{row.voucherType}</TableCell>
                        <TableCell className="text-xs">{row.partyName || '—'}</TableCell>
                        <TableCell className="text-xs text-right font-mono">₹{row.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-xs">{row.isDebit ? 'Dr' : 'Cr'}</TableCell>
                        <TableCell>
                          {row.errors.length > 0 ? (
                            <span className="text-[10px] text-destructive">{row.errors.join(', ')}</span>
                          ) : row.warnings.length > 0 ? (
                            <span className="text-[10px] text-yellow-600">{row.warnings.join(', ')}</span>
                          ) : (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {processedRows.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-2">Showing 100 of {processedRows.length} rows</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
            <Button onClick={handleStartImport} disabled={validCount === 0} className="gap-1">
              <Play className="h-3.5 w-3.5" /> Import {validCount} Vouchers
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && progress && (
        <div className="space-y-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold">Importing vouchers...</p>
            <p className="text-sm text-muted-foreground mt-1">{progress.completed} of {progress.total}</p>
          </div>
          <Progress value={(progress.completed / progress.total) * 100} className="h-3" />
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-600">✓ {progress.success} success</span>
            {progress.failed > 0 && <span className="text-destructive">✗ {progress.failed} failed</span>}
          </div>
        </div>
      )}

      {/* Step 5: Done */}
      {step === 'done' && progress && (
        <div className="space-y-4 py-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
          <p className="text-lg font-semibold">Import Complete</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-600">✓ {progress.success} imported</span>
            {progress.failed > 0 && <span className="text-destructive">✗ {progress.failed} failed</span>}
          </div>
          {progress.errors.length > 0 && (
            <Alert variant="destructive" className="text-left max-w-md mx-auto">
              <AlertDescription className="text-xs">
                {progress.errors.slice(0, 5).map((e, i) => (
                  <div key={i}>Row {e.index + 1}: {e.error}</div>
                ))}
                {progress.errors.length > 5 && <div>...and {progress.errors.length - 5} more</div>}
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={() => { onDone?.(); onClose(); }}>Done</Button>
        </div>
      )}
    </div>
  );
};

export default BulkVoucherImport;
