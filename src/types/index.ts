export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  pseudo: string;
  avatar_url?: string | null;
  theme: string;
  totp_enabled: boolean;
  email_2fa_enabled: boolean;
  notifications_email: boolean;
  email_verified: boolean;
  plan?: 'free' | 'pro' | 'enterprise';
  subscription_status?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  label: string;
  role: 'owner' | 'member';
}

export interface LogSource {
  name: string;
  description: string;
  environment: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  level: string;
  source: string;
  server?: string | null;
  project: string;
  metadata?: Record<string, unknown> | null;
  tags?: string[];
}

export interface RetentionSetting {
  level: string;
  retention_days: number;
}

export interface RetentionData {
  settings: RetentionSetting[];
  max_retention_days: number;
  plan: string;
}

export type StatsWindow = '24h' | '7d' | '30d';

export interface HeartbeatStatus {
  source: string;
  status: 'UP' | 'DOWN' | null;
  last_ping_at: string | null;
  interval_seconds: number;
}

export interface ChartBucket {
  bucket_start: string;
  info: number;
  warn: number;
  error: number;
  debug: number;
  verbose: number;
  trace: number;
}

export interface ProjectStats {
  uptime_percent: number | null;
  sources_uptime: { source: string; uptime_percent: number | null }[];
  log_counts: { info: number; warn: number; error: number; debug: number; total: number };
  chart_data: ChartBucket[];
}

export type ServerStatus = 'online' | 'partial' | 'offline' | 'archived';
export type SourceStatus = 'UP' | 'DOWN';

export interface ServerSummary {
  id: number;
  hostname: string;
  name: string | null;
  ip: string | null;
  last_seen_at: string | null;
  status: ServerStatus;
  source_count: number;
}

export interface ServerSource {
  name: string;
  environment: string;
  status: 'UP' | 'DOWN' | null;
  last_ping_at: string | null;
}

export interface ServerDetail extends ServerSummary {
  sources: ServerSource[];
  uptime_percent: number | null;
}

export interface ServerCommand {
  id: number;
  type: 'restart' | 'stop';
  status: 'pending' | 'ack' | 'failed';
  created_at: string;
  source_name: string | null;
}

export interface SourceStats {
  uptime_percent: number | null;
  log_counts: {
    info: number;
    warn: number;
    error: number;
    debug: number;
    verbose: number;
    trace: number;
    total: number;
  };
  error_rate: number;
  chart_data: ChartBucket[];
  server: { hostname: string; ip: string | null; name: string | null } | null;
  environment: string | null;
  recent_errors: { id: string; message: string | null; created_at: string }[];
  performance: {
    avg_cpu: number;
    avg_memory_used: number;
    avg_memory_total: number;
    last_uptime_seconds: number;
  } | null;
  status?: SourceStatus;
  last_seen_at: string | null;
}

export interface AlertChannel {
  id?: number;
  type: 'email' | 'webhook';
  target: string;
}

export interface AlertRule {
  id: number;
  name: string;
  level: string;
  threshold: number;
  window_seconds: number;
  source_id: number | null;
  source_name: string | null;
  enabled: boolean;
  created_at: string;
  channels: AlertChannel[];
}

export interface Alert {
  id: number;
  rule_name: string | null;
  source_name: string | null;
  server_hostname: string | null;
  level: string;
  message: string | null;
  status: 'active' | 'silenced' | 'resolved';
  silenced_until: string | null;
  resolved_at: string | null;
  resolved_by_pseudo: string | null;
  created_at: string;
}

export interface ApiToken {
  id: number;
  name: string;
  token_prefix: string;
  permissions: string[];
  source_name: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ProjectMember {
  id: number | null;
  user_id: number;
  email: string;
  pseudo: string;
  role: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface ProjectSettings {
  name: string;
  label: string;
  created_at: string;
  enabled_levels: string[];
  role: 'owner' | 'member';
  effective_permissions: string[];
}

export interface ProjectSource {
  id: number;
  name: string;
  description: string;
  environment: string;
  server_hostname: string | null;
  created_at: string;
}

export interface PinnedItem {
  id: number;
  item_type: string;
  item_name: string;
  project_name: string;
  created_at: string;
}

export interface RecentItem {
  id: number;
  item_type: string;
  item_name: string;
  project_name: string;
  visited_at: string;
}