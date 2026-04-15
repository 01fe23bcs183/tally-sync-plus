import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getReportTemplates, getReportData, getAvailableFields, SOURCE_CONFIG,
  fmtReportAmt, type ReportTemplate, type ReportField
} from '@/services/customReportService';
import { FileText, Plus, Play, Download, Calendar, GripVertical, X, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from 'sonner';

const CustomReportDashboard = () => {
  const templates = getReportTemplates();
  const allFields = getAvailableFields();
  const [activeTemplate, setActiveTemplate] = useState<ReportTemplate | null>(null);
  const [builderColumns, setBuilderColumns] = useState<ReportField[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);

  const reportData = activeTemplate ? getReportData(activeTemplate.id) : [];

  const handleAddField = (field: ReportField) => {
    if (!builderColumns.find(c => c.id === field.id)) {
      setBuilderColumns([...builderColumns, field]);
    }
  };

  const handleRemoveField = (fieldId: string) => {
    setBuilderColumns(builderColumns.filter(c => c.id !== fieldId));
  };

  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format}`, { description: activeTemplate?.name || 'Custom Report' });
  };

  const formatCellValue = (field: ReportField, value: string | number) => {
    if (field.type === 'currency' && typeof value === 'number') return fmtReportAmt(value);
    if (field.type === 'number' && typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Custom Reports</h2>
          <p className="text-sm text-muted-foreground">Build, save & schedule custom reports</p>
        </div>
        <Button className="gap-2" onClick={() => { setShowBuilder(true); setActiveTemplate(null); setBuilderColumns([]); }}>
          <Plus className="h-4 w-4" /> New Report
        </Button>
      </div>

      {!showBuilder && !activeTemplate && (
        <>
          {/* Template grid */}
          <div className="grid grid-cols-3 gap-4">
            {templates.map(tpl => (
              <Card key={tpl.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTemplate(tpl)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    {tpl.scheduled && (
                      <Badge className="bg-primary/10 text-primary text-xs gap-1">
                        <Calendar className="h-3 w-3" /> {tpl.scheduled}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {tpl.columns.map(col => (
                      <Badge key={col.id} variant="outline" className="text-xs">{col.label}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(tpl.filters).map(([k, v]) => (
                      <Badge key={k} className="bg-muted text-muted-foreground text-xs gap-1">
                        <Filter className="h-2.5 w-2.5" /> {v}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tpl.columns.length} columns</span>
                    <span>Created {tpl.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Report viewer */}
      {activeTemplate && !showBuilder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setActiveTemplate(null)}>← Back</Button>
              <div>
                <h3 className="font-bold text-lg">{activeTemplate.name}</h3>
                <p className="text-xs text-muted-foreground">{activeTemplate.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleExport('PDF')}>
                <Download className="h-3 w-3" /> PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleExport('Excel')}>
                <Download className="h-3 w-3" /> Excel
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleExport('CSV')}>
                <Download className="h-3 w-3" /> CSV
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {Object.entries(activeTemplate.filters).map(([k, v]) => (
              <Badge key={k} className="bg-muted text-muted-foreground gap-1">
                <Filter className="h-3 w-3" /> {k}: {v}
              </Badge>
            ))}
            {activeTemplate.groupBy && (
              <Badge className="bg-primary/10 text-primary gap-1">Group: {activeTemplate.groupBy}</Badge>
            )}
            {activeTemplate.sortBy && (
              <Badge variant="outline" className="gap-1">
                <ArrowUpDown className="h-3 w-3" /> {activeTemplate.sortBy} {activeTemplate.sortDir}
              </Badge>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTemplate.columns.map(col => (
                      <TableHead key={col.id} className={col.type === 'currency' || col.type === 'number' ? 'text-right' : ''}>
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, idx) => (
                    <TableRow key={idx}>
                      {activeTemplate.columns.map(col => (
                        <TableCell key={col.id} className={`${col.type === 'currency' || col.type === 'number' ? 'text-right font-medium' : ''}`}>
                          {row[col.name] !== undefined ? formatCellValue(col, row[col.name]) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow className="bg-muted/50 font-bold">
                    {activeTemplate.columns.map((col, idx) => (
                      <TableCell key={col.id} className={col.type === 'currency' || col.type === 'number' ? 'text-right' : ''}>
                        {idx === 0 ? 'Total' : col.aggregation === 'sum' && col.type === 'currency'
                          ? fmtReportAmt(reportData.reduce((s, r) => s + (Number(r[col.name]) || 0), 0))
                          : col.aggregation === 'sum' && col.type === 'number'
                          ? reportData.reduce((s, r) => s + (Number(r[col.name]) || 0), 0).toLocaleString()
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report builder */}
      {showBuilder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)}>← Back</Button>
              <h3 className="font-bold text-lg">Report Builder</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('Template saved')}>Save Template</Button>
              <Button size="sm" className="gap-1" disabled={builderColumns.length === 0}>
                <Play className="h-3 w-3" /> Generate Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Field palette */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Available Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {(['voucher', 'ledger', 'stock'] as const).map(source => (
                  <div key={source} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">{source}</p>
                    {allFields.filter(f => f.source === source).map(field => {
                      const isAdded = builderColumns.some(c => c.id === field.id);
                      return (
                        <div
                          key={field.id}
                          className={`flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-colors ${isAdded ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                          onClick={() => !isAdded && handleAddField(field)}
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <span>{field.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={`${SOURCE_CONFIG[field.source].color} text-[10px] px-1`}>{field.type}</Badge>
                            {isAdded && <span className="text-xs">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Report canvas */}
            <div className="col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Report Columns ({builderColumns.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {builderColumns.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <p className="text-sm">Click fields from the palette to add columns</p>
                      <p className="text-xs mt-1">Drag to reorder, click × to remove</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {builderColumns.map((col, idx) => (
                        <div key={col.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{col.label}</span>
                            <Badge className={`${SOURCE_CONFIG[col.source].color} text-[10px] px-1`}>{col.source}</Badge>
                            {col.aggregation && col.aggregation !== 'none' && (
                              <Badge variant="outline" className="text-[10px] px-1">{col.aggregation}</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveField(col.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              {builderColumns.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {builderColumns.map(col => (
                            <TableHead key={col.id} className={col.type === 'currency' || col.type === 'number' ? 'text-right' : ''}>
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {builderColumns.map(col => (
                            <TableCell key={col.id} className="text-muted-foreground text-sm italic">
                              {col.type === 'currency' ? '₹...' : col.type === 'number' ? '...' : col.type === 'date' ? 'dd-mm-yyyy' : 'Sample'}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReportDashboard;
