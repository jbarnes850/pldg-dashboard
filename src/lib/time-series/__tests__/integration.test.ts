import { describe, beforeEach, it, expect } from '@jest/globals';
import { DataProcessor } from '../integration';
import { TimeSeriesStore } from '../storage';
import { WeekData, TrendDataPoint } from '../types';
import { EngagementData, GitHubData } from '@/types/dashboard';
import { mockEngagementMetrics, mockTechPartnerMetrics, mockContributionMetrics } from './mocks/mockMetrics';
import { generateMockTimeSeriesData, mockStorageImplementation } from './test-utils';

// Mock localStorage
const mockStorage = mockStorageImplementation();
Object.defineProperty(global, 'localStorage', { value: mockStorage });

// Mock data
const mockGithubData: GitHubData = {
  issues: [
    {
      id: '1',
      title: 'Test Issue',
      state: 'open',
      created_at: new Date().toISOString(),
      closed_at: null,
      status: 'open'
    }
  ],
  statusGroups: {
    todo: 1,
    inProgress: 0,
    done: 0
  }
};

const mockEngagementData: EngagementData[] = [
  {
    Name: 'Test User',
    'Program Week': 'Week 1',
    'Engagement Participation ': '3 - High Engagement',
    'Tech Partner Collaboration?': 'Yes',
    'Which Tech Partner': 'Partner A',
    'How likely are you to recommend the PLDG to others?': '9',
    'How many issues, PRs, or projects this week?': '3',
    'Issue Title 1': 'Test Issue',
    'Issue Link 1': 'https://github.com/org/repo/issues/1',
    'Issue Description 1': 'Test description',
    'Engagement Tracking': 'Weekly Cohort Call, Molly Q&A'
  }
];

describe('Time Series Data Pipeline Integration', () => {
  let processor: DataProcessor;
  let store: TimeSeriesStore;
  
  beforeEach(() => {
    mockStorage.clear();
    processor = DataProcessor.getInstance();
    store = processor.timeSeriesStore;
  });

  describe('Data Processing', () => {
    it('processes and stores program data correctly', async () => {
      const result = await processor.processData(mockEngagementData, mockGithubData);
      expect(result).toBeDefined();
      expect(result.participationRate).toBe(100);
      expect(result.activeContributors).toBe(1);
    });

    it('processes tech partner metrics correctly', async () => {
      const result = await processor.processData(mockEngagementData, mockGithubData);
      expect(result.techPartnerActivity).toBeDefined();
      expect(result.techPartnerPerformance).toBeDefined();
      expect(result.techPartnerActivity.partners).toContain('Partner A');
    });

    it('handles empty data gracefully', async () => {
      const result = await processor.processData([], mockGithubData);
      expect(result).toBeDefined();
      expect(result.participationRate).toBe(0);
      expect(result.activeContributors).toBe(0);
    });
  });

  describe('Time Series Storage', () => {
    it('handles batch updates with locking', async () => {
      const mockData = generateMockTimeSeriesData(new Date('2024-01-01'), 4);
      await store.batchUpdateMetrics('2024-Q1', mockData.points);
      
      const storedData = await store.getCohortData('2024-Q1');
      expect(storedData).toHaveLength(4);
      
      storedData.forEach((point, i) => {
        expect(new Date(point.timestamp)).toBeInstanceOf(Date);
        expect(typeof point.value).toBe('number');
      });
    });

    it('maintains data consistency through updates', async () => {
      // Initial data
      await store.batchUpdateMetrics('2024-Q1', mockEngagementMetrics.points, 'total-engagement');
      await store.batchUpdateMetrics('2024-Q1', mockTechPartnerMetrics.points, 'tech-partner-engagement');
      
      const engagementData = await store.getMetricData('total-engagement');
      const techPartnerData = await store.getMetricData('tech-partner-engagement');
      
      expect(engagementData.points).toHaveLength(4);
      expect(techPartnerData.points).toHaveLength(4);
    });

    it('handles concurrent updates safely', async () => {
      const updates = [
        store.batchUpdateMetrics('2024-Q1', mockEngagementMetrics.points, 'total-engagement'),
        store.batchUpdateMetrics('2024-Q1', mockTechPartnerMetrics.points, 'tech-partner-engagement'),
        store.batchUpdateMetrics('2024-Q1', mockContributionMetrics.points, 'contribution-count')
      ];
      
      await Promise.all(updates);
      
      const allData = await Promise.all([
        store.getMetricData('total-engagement'),
        store.getMetricData('tech-partner-engagement'),
        store.getMetricData('contribution-count')
      ]);
      
      allData.forEach(data => {
        expect(data.points).toBeDefined();
        expect(data.metadata).toBeDefined();
      });
    });
  });

  describe('Trend Analysis', () => {
    beforeEach(async () => {
      await store.batchUpdateMetrics('2024-Q1', mockEngagementMetrics.points, 'total-engagement');
    });

    it('calculates trends accurately', async () => {
      const trends = await processor.analyzeTrends('total-engagement');
      expect(trends).toBeDefined();
      expect(trends.weeklyTrends).toHaveLength(4);
      
      trends.weeklyTrends.forEach(trend => {
        expect(trend.timestamp).toBeDefined();
        expect(typeof trend.value).toBe('number');
        expect(trend.value).toBeGreaterThanOrEqual(0);
      });
    });

    it('detects significant trend changes', async () => {
      const trends = await processor.analyzeTrends('total-engagement');
      const changes = trends.weeklyTrends.map((trend, i, arr) => {
        if (i === 0) return 0;
        return ((trend.value - arr[i-1].value) / arr[i-1].value) * 100;
      }).slice(1);
      
      expect(changes.some(change => Math.abs(change) > 5)).toBe(true);
    });

    it('handles missing data points in trend analysis', async () => {
      const sparseData = {
        points: mockEngagementMetrics.points.filter((_, i) => i % 2 === 0),
        metadata: mockEngagementMetrics.metadata
      };
      
      await store.batchUpdateMetrics('2024-Q1', sparseData.points, 'total-engagement');
      const trends = await processor.analyzeTrends('total-engagement');
      
      expect(trends.weeklyTrends).toBeDefined();
      expect(trends.weeklyTrends.length).toBeLessThanOrEqual(sparseData.points.length);
    });
  });

  describe('Cache Management', () => {
    it('handles cache invalidation correctly', async () => {
      // Initial data
      await store.batchUpdateMetrics('2024-Q1', mockEngagementMetrics.points, 'total-engagement');
      
      // Get initial trends
      const initialTrends = await processor.analyzeTrends('total-engagement');
      
      // Update with new data
      const updatedPoints = mockEngagementMetrics.points.map(point => ({
        ...point,
        value: point.value * 1.5
      }));
      
      await store.batchUpdateMetrics('2024-Q1', updatedPoints, 'total-engagement');
      
      // Get new trends
      const newTrends = await processor.analyzeTrends('total-engagement');
      expect(newTrends.weeklyTrends[0].value).not.toBe(initialTrends.weeklyTrends[0].value);
    });

    it('maintains cache consistency across multiple updates', async () => {
      const metrics = ['total-engagement', 'tech-partner-engagement', 'contribution-count'];
      
      // Perform multiple updates
      await Promise.all(metrics.map((metric, i) => 
        store.batchUpdateMetrics('2024-Q1', mockEngagementMetrics.points, metric)
      ));
      
      // Verify cache consistency
      const allTrends = await Promise.all(metrics.map(m => processor.analyzeTrends(m)));
      allTrends.forEach(trends => {
        expect(trends.weeklyTrends).toBeDefined();
        expect(trends.weeklyTrends).toHaveLength(4);
      });
    });
  });
});
