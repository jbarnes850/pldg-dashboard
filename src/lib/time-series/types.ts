// Time series data structure types
export interface TimeSeriesData {
  version: number;
  lastUpdated: string;
  cohorts: {
    [cohortId: string]: CohortData;
  };
  metricPath: string;
  points: TrendDataPoint[];
}

export interface CohortData {
  id: string;  // e.g., "2023-Q4"
  startDate: string;
  endDate: string;
  weeks: WeekData[];
}

export interface WeekData {
  weekNumber: number;
  weekLabel: string;  // e.g., "Week 2 (October 7 - October 11, 2024)"
  metrics: {
    engagement: {
      totalParticipants: number;
      activeContributors: number;
      npsScore: number;
      participationRate: number;
      sessionAttendance: {
        [key: string]: number;
      };
      participationLevel: {
        high: number;     // 3 - Highly engaged
        medium: number;   // 2 - Actively listened with minimal contributions
        low: number;      // 1 - Passively listened but did not contribute
      };
    };
    contributions: {
      total: number;
      byTechPartner: {
        [key: string]: {
          issues: number;
          activeContributors: number;
          completionRate: number;
          descriptions: string[];  // Store collaboration descriptions
        };
      };
      issues: {
        total: number;
        details: Array<{
          title: string;
          link: string;
          description: string;
        }>;
      };
    };
    cumulative: {
      totalContributions: number;
      byTechPartner: {
        [key: string]: number;
      };
      totalNPS: number;
      averageParticipation: number;
    };
  };
}

export interface TrendDataPoint {
  date: string;
  value: number;
  metadata?: Record<string, any>;
}

export type MetricPath = string; // e.g., "engagement.activeContributors"

export interface TimeSeriesMetadata {
  interval: 'daily' | 'weekly' | 'monthly';
  aggregation: 'sum' | 'average' | 'count';
}
