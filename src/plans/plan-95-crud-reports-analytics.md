# Plan 95: CRUD — Custom Reports, Saved Views & Analytics Config

## Covers Plans
- Plan 26 (Custom Report Builder)
- Plan 27 (Cash Flow Forecasting)
- Plan 28 (Ratio Analysis Dashboard)
- Plan 29 (Comparative Statements)
- Plan 31 (Sales Analytics)
- Plan 32 (Expense Analytics)
- Plan 33 (Fund Flow Statement)
- Plan 79 (Report Scheduling)

## Database Schema

```sql
-- Saved Report Templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN (
    'BalanceSheet', 'ProfitLoss', 'TrialBalance', 'CashFlow', 'FundFlow',
    'RatioAnalysis', 'SalesAnalytics', 'ExpenseAnalytics', 'Comparative',
    'Outstanding', 'StockSummary', 'Custom'
  )) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- columns, filters, grouping, sort, date range
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Report Schedules
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE NOT NULL,
  frequency TEXT CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')) NOT NULL,
  day_of_week INTEGER, -- 0=Sun, 1=Mon... for Weekly
  day_of_month INTEGER, -- 1-28 for Monthly
  time_of_day TIME DEFAULT '09:00',
  format TEXT CHECK (format IN ('PDF', 'Excel', 'CSV', 'Email')) DEFAULT 'PDF',
  recipients TEXT[], -- email addresses
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  condition_sql TEXT, -- optional: only send if condition met
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Report History
CREATE TABLE report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES report_templates(id),
  schedule_id UUID REFERENCES report_schedules(id),
  report_type TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  file_url TEXT,
  format TEXT,
  status TEXT CHECK (status IN ('Generated', 'Sent', 'Failed')) DEFAULT 'Generated',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Saved Dashboard Widgets (Plan 77)
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  widget_type TEXT CHECK (widget_type IN ('Chart', 'KPI', 'Table', 'Alert', 'Shortcut')) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- data source, chart type, filters, size
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"w":4,"h":3}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON report_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own schedules" ON report_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own history" ON report_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own widgets" ON dashboard_widgets FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Save Report Template**: configure columns, filters, grouping, date range → save as named template
- **Create Schedule**: select template, frequency, recipients, format, optional condition
- **Add Dashboard Widget**: pick type (chart/KPI/table), configure data source, set position
- Validation: name unique, at least 1 recipient for schedule, valid cron config

### Read
- **My Reports**: list of saved templates by type
- **Run Report**: execute template with current data, show results
- **Schedule List**: all schedules with next run time, status
- **Report History**: past generated reports with download links
- **Dashboard**: render all widgets in grid layout

### Update
- **Edit Template**: modify columns, filters, date range
- **Edit Schedule**: change frequency, recipients, pause/resume
- **Edit Widget**: resize, move, change config
- **Reorder Dashboard**: drag-drop widget positions

### Delete
- **Delete Template**: cascade deletes schedules and history
- **Delete Schedule**: stop future runs
- **Delete Widget**: remove from dashboard
- **Clear History**: bulk delete old report history

## UI Components
- `ReportBuilderDialog` — column picker, filter builder, grouping selector, preview
- `ScheduleForm` — frequency picker, recipient list, format selector
- `ReportHistoryTable` — list with download and re-send actions
- `DashboardGrid` — drag-drop widget layout with resize handles
- `WidgetConfigDialog` — data source and chart type configuration
- `ReportViewer` — render report results with export options
