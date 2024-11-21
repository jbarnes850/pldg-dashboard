import { TimeSeriesData, TimeSeriesPoint } from '../types';
import { WeekData, TrendDataPoint } from '../types';
import { TechPartnerMetrics } from '@/types/dashboard';

export const generateMockTimeSeriesData = (
  startDate: Date,
  numPoints: number,
  baseValue: number = 100,
  variance: number = 20
): TimeSeriesData => {
  const data: TimeSeriesPoint[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numPoints; i++) {
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      timestamp: currentDate.toISOString(),
      value: Math.round(value * 100) / 100
    });
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add one day
  }

  return {
    points: data,
    metadata: {
      lastUpdated: new Date().toISOString(),
      metricType: 'test-metric',
      timeGranularity: 'daily'
    }
  };
};

export const generateWeeklyData = (
  startDate: Date,
  numWeeks: number,
  baseValue: number = 100,
  variance: number = 20
): TimeSeriesData => {
  const data: TimeSeriesPoint[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numWeeks; i++) {
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      timestamp: currentDate.toISOString(),
      value: Math.round(value * 100) / 100
    });
    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Add one week
  }

  return {
    points: data,
    metadata: {
      lastUpdated: new Date().toISOString(),
      metricType: 'test-metric',
      timeGranularity: 'weekly'
    }
  };
};

export const generateMonthlyData = (
  startDate: Date,
  numMonths: number,
  baseValue: number = 100,
  variance: number = 20
): TimeSeriesData => {
  const data: TimeSeriesPoint[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < numMonths; i++) {
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      timestamp: currentDate.toISOString(),
      value: Math.round(value * 100) / 100
    });
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  return {
    points: data,
    metadata: {
      lastUpdated: new Date().toISOString(),
      metricType: 'test-metric',
      timeGranularity: 'monthly'
    }
  };
};

export const mockStorageImplementation = () => {
  const store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string): string | null => store[key] || null),
    setItem: jest.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    clear: jest.fn((): void => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    removeItem: jest.fn((key: string): void => {
      delete store[key];
    }),
    getAllKeys: jest.fn((): string[] => Object.keys(store)),
  };
};

export const createMockMetricData = (
  metricName: string,
  timeGranularity: 'daily' | 'weekly' | 'monthly',
  numPoints: number,
  startDate: Date = new Date('2024-01-01')
): TimeSeriesData => {
  const generators = {
    daily: generateMockTimeSeriesData,
    weekly: generateWeeklyData,
    monthly: generateMonthlyData
  };

  const data = generators[timeGranularity](startDate, numPoints);
  data.metadata.metricType = metricName;
  return data;
};

export function generateMockTimeSeriesDataForTechPartner(startDate: Date, weeks: number): { points: TrendDataPoint[] } {
  const points: TrendDataPoint[] = [];
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < weeks; i++) {
    const timestamp = new Date(startDate.getTime() + i * msPerWeek).toISOString();
    points.push({
      timestamp,
      value: Math.floor(Math.random() * 20) + 10
    });
  }

  return { points };
}

export function generateMockTechPartnerData(weeks: number): TechPartnerMetrics[] {
  const techPartners = ['Protocol Labs', 'Filecoin', 'IPFS', 'libp2p'];
  return techPartners.map(partner => ({
    partner,
    metrics: {
      issues: Math.floor(Math.random() * 20) + 5,
      activeContributors: Math.floor(Math.random() * 10) + 2,
      completionRate: Math.floor(Math.random() * 40) + 60
    }
  }));
}

export function generateMockWeekData(weeks: number): WeekData[] {
  return Array(weeks).fill(null).map((_, weekNumber) => ({
    weekNumber: weekNumber + 1,
    metrics: {
      engagement: {
        totalParticipants: Math.floor(Math.random() * 20) + 10,
        activeParticipants: Math.floor(Math.random() * 15) + 5,
        npsScore: Math.floor(Math.random() * 3) + 7,
        engagementScore: Math.floor(Math.random() * 30) + 70
      },
      contributions: {
        total: Math.floor(Math.random() * 50) + 20,
        byTechPartner: {
          'Protocol Labs': {
            issues: Math.floor(Math.random() * 10) + 5,
            activeContributors: Math.floor(Math.random() * 5) + 2,
            completionRate: Math.floor(Math.random() * 40) + 60
          },
          'Filecoin': {
            issues: Math.floor(Math.random() * 10) + 5,
            activeContributors: Math.floor(Math.random() * 5) + 2,
            completionRate: Math.floor(Math.random() * 40) + 60
          }
        }
      }
    }
  }));
}
