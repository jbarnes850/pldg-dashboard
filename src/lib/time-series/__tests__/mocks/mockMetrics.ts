import { TimeSeriesData } from '../../types';

export const mockTechPartnerMetrics: TimeSeriesData = {
  points: [
    { timestamp: '2024-01-01T00:00:00.000Z', value: 15 },
    { timestamp: '2024-01-08T00:00:00.000Z', value: 18 },
    { timestamp: '2024-01-15T00:00:00.000Z', value: 22 },
    { timestamp: '2024-01-22T00:00:00.000Z', value: 25 },
  ],
  metadata: {
    lastUpdated: '2024-01-29T00:00:00.000Z',
    metricType: 'tech-partner-engagement',
    timeGranularity: 'weekly'
  }
};

export const mockEngagementMetrics: TimeSeriesData = {
  points: [
    { timestamp: '2024-01-01T00:00:00.000Z', value: 150 },
    { timestamp: '2024-01-08T00:00:00.000Z', value: 180 },
    { timestamp: '2024-01-15T00:00:00.000Z', value: 220 },
    { timestamp: '2024-01-22T00:00:00.000Z', value: 250 },
  ],
  metadata: {
    lastUpdated: '2024-01-29T00:00:00.000Z',
    metricType: 'total-engagement',
    timeGranularity: 'weekly'
  }
};

export const mockContributionMetrics: TimeSeriesData = {
  points: [
    { timestamp: '2024-01-01T00:00:00.000Z', value: 45 },
    { timestamp: '2024-01-08T00:00:00.000Z', value: 52 },
    { timestamp: '2024-01-15T00:00:00.000Z', value: 58 },
    { timestamp: '2024-01-22T00:00:00.000Z', value: 65 },
  ],
  metadata: {
    lastUpdated: '2024-01-29T00:00:00.000Z',
    metricType: 'contribution-count',
    timeGranularity: 'weekly'
  }
};

export const mockEmptyMetrics: TimeSeriesData = {
  points: [],
  metadata: {
    lastUpdated: '2024-01-29T00:00:00.000Z',
    metricType: 'empty-metric',
    timeGranularity: 'weekly'
  }
};
