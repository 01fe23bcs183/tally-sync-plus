# Plan 100: CRUD — Agent Config, Security Settings & Platform

## Covers Plans
- Plan 36 (Multi-Window)
- Plan 43 (Payment Gateway)
- Plan 51 (Sync Agent)
- Plan 52 (Agent Auto-Update)
- Plan 53 (Real-Time Streaming)
- Plan 54 (Multi-Instance Agent)
- Plan 55 (Agent Remote Control)
- Plan 56 (Encryption)
- Plan 57 (Two-Factor Auth)
- Plan 58 (Session Management)
- Plan 60 (API Security)
- Plan 61 (Data Masking)
- Plan 62 (Compliance & Residency)
- Plan 63 (Vulnerability Scanning)
- Plan 65 (Incident Response)
- Plan 73 (Payroll)
- Plan 76 (Mobile PWA)
- Plan 80 (Anomaly Detection)

## Database Schema

```sql
-- Agent Instances (registered desktop agents)
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  machine_name TEXT NOT NULL,
  agent_version TEXT NOT NULL,
  os_info TEXT,
  last_heartbeat TIMESTAMPTZ,
  status TEXT CHECK (status IN ('Online', 'Offline', 'Error', 'Updating')) DEFAULT 'Offline',
  config JSONB DEFAULT '{}', -- sync interval, selected companies, etc.
  tally_instances JSONB DEFAULT '[]', -- discovered Tally instances
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Sync Log
CREATE TABLE agent_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_instances(id) ON DELETE CASCADE NOT NULL,
  sync_type TEXT CHECK (sync_type IN ('Pull', 'Push', 'FullSync')) NOT NULL,
  entity_types TEXT[],
  records_synced INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('InProgress', 'Completed', 'Failed')) DEFAULT 'InProgress',
  error_message TEXT
);

-- Security Settings (per company)
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  two_factor_required BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 480,
  max_concurrent_sessions INTEGER DEFAULT 5,
  ip_whitelist TEXT[],
  password_min_length INTEGER DEFAULT 8,
  password_require_special BOOLEAN DEFAULT true,
  data_masking_enabled BOOLEAN DEFAULT false,
  masking_rules JSONB DEFAULT '{}',
  data_residency_region TEXT DEFAULT 'IN',
  encryption_at_rest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- API Keys (for agent-to-server auth)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- store hash, never raw key
  prefix TEXT NOT NULL, -- first 8 chars for identification
  scopes TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Incidents
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  type TEXT CHECK (type IN ('FailedLogin', 'BruteForce', 'UnauthorizedAccess', 'DataExfiltration', 'SuspiciousActivity', 'AnomalyDetected')) NOT NULL,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('Open', 'Investigating', 'Resolved', 'FalsePositive')) DEFAULT 'Open',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment Transactions (Plan 43)
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  gateway TEXT CHECK (gateway IN ('Razorpay', 'PayU', 'Stripe', 'UPI')) NOT NULL,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('Created', 'Authorized', 'Captured', 'Failed', 'Refunded')) DEFAULT 'Created',
  party_ledger_id UUID REFERENCES ledgers(id),
  payment_link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anomaly Detection Rules (Plan 80)
CREATE TABLE anomaly_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('Duplicate', 'UnusualAmount', 'Timing', 'RoundFigure', 'MissingGST', 'Custom')) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- thresholds, conditions
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Detected Anomalies
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES anomaly_rules(id),
  voucher_id UUID REFERENCES vouchers(id),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100) NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('Open', 'Reviewed', 'FalsePositive', 'Confirmed')) DEFAULT 'Open',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll (Plan 73 — simplified)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  employee_id TEXT,
  department TEXT,
  designation TEXT,
  pan TEXT,
  uan TEXT,
  bank_account TEXT,
  ifsc TEXT,
  salary_structure JSONB DEFAULT '{}', -- basic, HRA, DA, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  status TEXT CHECK (status IN ('Draft', 'Computed', 'Approved', 'Paid', 'Cancelled')) DEFAULT 'Draft',
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

CREATE TABLE payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  gross NUMERIC(15,2) NOT NULL,
  deductions JSONB DEFAULT '{}', -- PF, ESI, TDS, etc.
  net_pay NUMERIC(15,2) NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for all tables
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own agents" ON agent_instances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own sync_log" ON agent_sync_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM agent_instances WHERE agent_instances.id = agent_sync_log.agent_id AND agent_instances.user_id = auth.uid()));
CREATE POLICY "Users manage own security" ON security_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = security_settings.company_id AND companies.owner_id = auth.uid()));
CREATE POLICY "Users manage own api_keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own incidents" ON security_incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own payments" ON payment_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own anomaly_rules" ON anomaly_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own anomalies" ON anomalies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own employees" ON employees FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own payroll_runs" ON payroll_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own payroll_entries" ON payroll_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM payroll_runs WHERE payroll_runs.id = payroll_entries.payroll_run_id AND payroll_runs.user_id = auth.uid()));
```

## CRUD Operations

### Agent Management
- **Register Agent**: on first connect, create instance record
- **Update Heartbeat**: periodic status update from agent
- **Configure Agent**: set sync interval, select companies, set Tally ports
- **View Agent Status**: online/offline, last sync, errors
- **Delete Agent**: deregister agent instance

### Security Settings
- **Configure 2FA**: enable/disable per company, require for specific roles
- **Manage Sessions**: view active sessions, force logout, set timeout
- **API Key Management**: create/revoke keys with scopes and rate limits
- **Data Masking Rules**: configure which fields to mask for which roles
- **Incident Response**: view/investigate/resolve security incidents

### Payment Integration
- **Create Payment Link**: generate link for a voucher amount
- **Record Payment**: capture gateway callback, update transaction status
- **Process Refund**: initiate refund, track status
- **Payment History**: list all transactions with gateway status

### Anomaly Detection
- **Create Rule**: define detection rule with thresholds and conditions
- **Run Scan**: scan vouchers against all active rules
- **Review Anomaly**: mark as false positive or confirmed
- **View Dashboard**: risk score distribution, flagged transaction summary

### Payroll
- **Add Employee**: personal details, salary structure, bank info
- **Run Payroll**: compute for a month → preview → approve → generate vouchers
- **Generate Payslips**: PDF payslips per employee
- **Edit Employee**: update salary, designation, bank details
- **Cancel Payroll**: cancel an unapproved run

## UI Components
- `AgentDashboard` — agent status, sync log, remote config
- `SecuritySettingsPage` — 2FA toggle, session policy, IP whitelist
- `APIKeyManager` — create/revoke keys with copy-to-clipboard
- `IncidentDashboard` — security incidents with severity badges
- `PaymentLinkGenerator` — create shareable payment links
- `AnomalyDashboard` — risk chart, flagged transactions, rule builder
- `PayrollRunner` — month selector, compute, preview, approve workflow
- `EmployeeForm` — add/edit employee with salary structure builder
