# Plan 98: CRUD — Invoice Generation, Sharing & Document Storage

## Covers Plans
- Plan 42 (WhatsApp/SMS Sharing)
- Plan 67 (Invoice PDF Generation & Templates)
- Plan 68 (Balance Confirmation)
- Plan 74 (Customer/Vendor Portal)
- Plan 75 (Document Attachment & Storage)

## Database Schema

```sql
-- Invoice Templates
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('TaxInvoice', 'Proforma', 'DeliveryChallan', 'Quotation', 'BalanceConfirmation', 'Receipt')) NOT NULL,
  template_html TEXT NOT NULL,
  header_config JSONB DEFAULT '{}', -- logo position, company details, colors
  footer_config JSONB DEFAULT '{}', -- terms, bank details, signature
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Generated Documents
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voucher_id UUID REFERENCES vouchers(id),
  template_id UUID REFERENCES invoice_templates(id),
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id),
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Share Log (WhatsApp, Email, SMS)
CREATE TABLE share_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES generated_documents(id),
  channel TEXT CHECK (channel IN ('WhatsApp', 'Email', 'SMS', 'Portal')) NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT CHECK (status IN ('Sent', 'Delivered', 'Failed', 'Read')) DEFAULT 'Sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT
);

-- Balance Confirmations
CREATE TABLE balance_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  party_ledger_id UUID REFERENCES ledgers(id) NOT NULL,
  as_of_date DATE NOT NULL,
  our_balance NUMERIC(15,2) NOT NULL,
  our_balance_type TEXT CHECK (our_balance_type IN ('Dr', 'Cr')) NOT NULL,
  confirmed_balance NUMERIC(15,2),
  confirmed_balance_type TEXT CHECK (confirmed_balance_type IN ('Dr', 'Cr')),
  status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Disputed', 'NoResponse')) DEFAULT 'Pending',
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  dispute_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document Attachments (attach files to vouchers/ledgers)
CREATE TABLE document_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL, -- 'voucher', 'ledger', 'order', etc.
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own templates" ON invoice_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own docs" ON generated_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own shares" ON share_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own confirmations" ON balance_confirmations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own attachments" ON document_attachments FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Invoice Template**: name, type, design HTML, header/footer config, logo upload
- **Generate Invoice PDF**: select voucher → apply template → render PDF → store
- **Share Document**: select document → choose channel (WhatsApp/Email/SMS) → send
- **Send Balance Confirmation**: select parties, as-of date, generate letters, email/WhatsApp
- **Upload Attachment**: attach file to any voucher/ledger/order, drag-drop or file picker
- Validation: template must have placeholders for required fields, recipient contact info required

### Read
- **Template Gallery**: all templates with preview thumbnails
- **Generated Documents**: list with type, party, date, download link
- **Share History**: sent items with delivery status
- **Confirmation Tracker**: per-party status (Pending/Confirmed/Disputed/NoResponse)
- **Attachments**: per-entity file list with preview

### Update
- **Edit Template**: modify HTML, header/footer, set as default
- **Re-generate Document**: re-render with updated data
- **Record Confirmation Response**: mark confirmed/disputed, enter confirmed balance
- **Rename Attachment**: update file name

### Delete
- **Delete Template**: only if not referenced by generated docs, or reassign
- **Delete Document**: remove generated file
- **Delete Attachment**: remove file from storage
- **Delete Confirmation**: remove pending/unresponsive entries

## UI Components
- `TemplateEditor` — rich HTML editor with placeholder variables
- `InvoicePreview` — live preview with print/download/share buttons
- `ShareDialog` — channel selector, recipient input, send button
- `BalanceConfirmationWizard` — multi-party bulk send with tracking
- `AttachmentDropzone` — drag-drop file upload with preview
- `ConfirmationTracker` — status table with filter by response status
