CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TYPE request_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE request_status AS ENUM ('new', 'inProgress', 'waiting', 'completed');
CREATE TYPE note_visibility AS ENUM ('public', 'internal');
CREATE TYPE note_type AS ENUM ('normal', 'employee_request', 'employee_response');
CREATE TYPE management_role AS ENUM ('itManager', 'leadership');

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    priority request_priority NOT NULL,
    status request_status NOT NULL DEFAULT 'new',
    target_sla TIMESTAMPTZ NOT NULL,
    estimated_cost NUMERIC(15, 2),
    confirmed_cost NUMERIC(15, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS request_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    message TEXT NOT NULL,
    visibility note_visibility NOT NULL DEFAULT 'internal',
    note_type note_type NOT NULL DEFAULT 'normal',
    parent_note_id UUID REFERENCES request_notes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES request_notes(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_employee ON service_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_request_notes_request ON request_notes(request_id);

-- Indexes tối ưu cho Leadership Dashboard và tính toán SLA
-- Index cho created_at để tối ưu filter theo thời gian (monthly, quarterly)
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);

-- Index cho status để tối ưu filter completed/in progress
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- Composite index cho status + created_at (thường dùng cùng lúc)
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created ON service_requests(status, created_at DESC);

-- Index cho completed_at để tính toán thời gian xử lý trung bình
CREATE INDEX IF NOT EXISTS idx_service_requests_completed_at ON service_requests(completed_at) WHERE completed_at IS NOT NULL;

-- Composite index cho status + completed_at (cho SLA met calculations)
CREATE INDEX IF NOT EXISTS idx_service_requests_status_completed ON service_requests(status, completed_at) WHERE status = 'completed';

-- Index cho type để tối ưu problem areas grouping
CREATE INDEX IF NOT EXISTS idx_service_requests_type ON service_requests(type);

-- Index cho target_sla để tối ưu SLA breach detection
CREATE INDEX IF NOT EXISTS idx_service_requests_target_sla ON service_requests(target_sla);

-- Index cho priority để tối ưu priority filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);

-- Composite index cho open requests với created_at (cho backlog > 48h)
CREATE INDEX IF NOT EXISTS idx_service_requests_open_created ON service_requests(created_at) 
WHERE status IN ('new', 'inProgress', 'waiting');

CREATE TABLE IF NOT EXISTS management_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role management_role NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_management_accounts_role ON management_accounts(role);

INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'nguyễn trung hải', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyễn Trung Hải', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'lê thanh tùng', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Lê Thanh Tùng', 'le.thanh.tung@rmg123.com', 'Điều hành')
ON CONFLICT (username) DO UPDATE
SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    updated_at = NOW();
