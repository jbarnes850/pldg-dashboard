export type MetricType = 
  | 'engagement'
  | 'contributions'
  | 'activeContributors'
  | 'programHealth'
  | 'techPartnerMetrics'
  | 'weeklyTrends';

export interface MetricValue {
  timestamp: string;
  value: number | object;
  metadata?: Record<string, any>;
}

export interface MetricsHistory {
  id: number;
  timestamp: string;
  metric_type: MetricType;
  value: MetricValue;
  week: string;
}

export interface WeeklyChanges {
  engagement: number;
  contributions: number;
  activeContributors: number;
}

export interface HistoricalTrends {
  data: MetricsHistory[];
  changes: WeeklyChanges;
} 