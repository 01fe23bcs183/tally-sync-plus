# Plan 97: CRUD — Company Settings, Users & Preferences

## Covers Plans
- Plan 34 (Keyboard Shortcuts)
- Plan 35 (Themes)
- Plan 37 (Search Everything)
- Plan 38 (Favorites & Quick Access)
- Plan 41 (Notifications)
- Plan 45 (Multi-Company Consolidation)
- Plan 48 (User Roles & Access Control)
- Plan 70 (Multi-Branch)
- Plan 77 (Dashboard Widgets — user prefs)

## Database Schema

```sql
-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  pan TEXT,
  financial_year_start DATE NOT NULL,
  financial_year_end DATE NOT NULL,
  base_currency TEXT DEFAULT 'INR',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  gstin TEXT,
  is_head_office BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, name)
);

-- User Roles (separate table per security guidelines)
CREATE TYPE app_role AS ENUM ('owner', 'admin', 'accountant', 'viewer', 'data_entry');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id, role)
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  default_company_id UUID REFERENCES companies(id),
  keyboard_shortcuts JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  favorites JSONB DEFAULT '[]', -- array of {type, id, name}
  language TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  number_format TEXT DEFAULT 'Indian', -- Indian (1,23,456) or Western (123,456)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('Info', 'Warning', 'Error', 'Success', 'Reminder')) DEFAULT 'Info',
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  )
$$;

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own companies" ON companies FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_roles.company_id = companies.id AND user_roles.user_id = auth.uid()));
CREATE POLICY "Owners manage companies" ON companies FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Users see own branches" ON branches FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.company_id = branches.company_id AND user_roles.user_id = auth.uid()));
CREATE POLICY "Users manage own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own roles" ON user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage roles" ON user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
```

## CRUD Operations

### Create
- **Add Company**: name, legal name, address, GSTIN, PAN, FY dates, logo upload
- **Add Branch**: name, address, GSTIN, link to company
- **Invite User**: email, role, branch (sends invite email)
- **Set Preferences**: theme, date format, number format, language, notification settings
- **Add Favorite**: bookmark any page/report/ledger for quick access
- **Create Notification**: system-generated on events (low stock, overdue, etc.)

### Read
- **Company Profile**: full company details
- **Branch List**: all branches under company
- **Team Members**: list of users with roles and branch assignments
- **My Preferences**: current user settings
- **Favorites**: quick access list
- **Notifications**: unread/all with type icons

### Update
- **Edit Company**: update details, logo, FY dates
- **Edit Branch**: rename, update address
- **Change Role**: promote/demote user (owner/admin only)
- **Update Preferences**: toggle theme, change shortcuts, notification settings
- **Mark Notification Read**: individual or bulk mark-as-read
- **Reorder Favorites**: drag-drop ordering

### Delete
- **Delete Company**: cascade deletes everything (heavy confirmation)
- **Delete Branch**: only if no transactions assigned to it
- **Remove User**: revoke access (deactivate role)
- **Remove Favorite**: unbookmark
- **Clear Notifications**: delete read notifications

## UI Components
- `CompanySettingsForm` — company profile editor with logo upload
- `BranchManager` — branch CRUD list
- `TeamMemberTable` — user list with role badges and invite button
- `RoleAssignDialog` — role selector with branch assignment
- `PreferencesPage` — theme toggle, format selectors, shortcut editor
- `FavoritesBar` — horizontal quick access strip
- `NotificationDropdown` — bell icon with unread count and list
