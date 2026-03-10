export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  pseudo: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  name: string;
  label: string;
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
  project: string;
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
}

export interface ProjectStats {
  uptime_percent: number | null;
  sources_uptime: { source: string; uptime_percent: number | null }[];
  log_counts: { info: number; warn: number; error: number; debug: number; total: number };
  chart_data: ChartBucket[];
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