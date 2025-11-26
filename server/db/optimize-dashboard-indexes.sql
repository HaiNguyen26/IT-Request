-- Tối ưu indexes cho Leadership Dashboard và các tính toán SLA
-- Các queries trong dashboard thường filter và sort theo:
-- - created_at (cho monthly/quarterly stats, volume trends)
-- - status (cho completed counts, open tickets)
-- - completed_at (cho SLA calculations)
-- - target_sla (cho SLA breach detection)

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

