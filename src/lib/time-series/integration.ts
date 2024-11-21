import { TimeSeriesStore } from './storage';
import { WeekData, TrendDataPoint, MetricPath, TimeSeriesData } from './types';
import { ProcessedData, EngagementData, GitHubData, WeeklyMetrics, TechPartnerActivity, TechPartnerPerformance, ContributorGrowth } from '@/types/dashboard';
import { processData } from '../data-processing';
import _ from 'lodash';

export class DataProcessor {
  private static instance: DataProcessor;
  timeSeriesStore: TimeSeriesStore;
  private memoryCache: Map<string, any>;

  private constructor() {
    this.timeSeriesStore = new TimeSeriesStore();
    this.memoryCache = new Map();
  }

  static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  async processData(airtableData: EngagementData[], githubData: GitHubData): Promise<ProcessedData> {
    const baseProcessedData = processData(airtableData, githubData);
    
    // Process metrics
    const techPartnerActivity = this.processTechPartnerActivity(airtableData);
    const techPartnerPerformance = this.processTechPartnerPerformance(airtableData);
    const contributorGrowth = this.processContributorGrowth(airtableData);
    
    return {
      ...baseProcessedData,
      techPartnerActivity: [techPartnerActivity],
      techPartnerPerformance: [techPartnerPerformance],
      contributorGrowth: [contributorGrowth]
    };
  }

  private processTechPartnerActivity(data: EngagementData[]): TechPartnerActivity {
    const weeklyData = _.groupBy(data, 'Program Week');
    return Object.entries(weeklyData).map(([week, entries]) => {
      const partnerData = _.groupBy(entries, 'Which Tech Partner');
      return Object.entries(partnerData).map(([partner, partnerEntries]) => ({
        week: week,
        partner: partner || 'Unknown',
        issues: partnerEntries.reduce((sum, entry) => 
          sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0),
        contributions: partnerEntries.length,
        collaborations: partnerEntries.filter(entry => 
          entry['Tech Partner Collaboration?'] === 'Yes').length
      }));
    })[0][0]; // Take first week's first partner as example
  }

  private processTechPartnerPerformance(data: EngagementData[]): TechPartnerPerformance {
    const partnerData = _.groupBy(
      data.filter(d => d['Tech Partner Collaboration?'] === 'Yes'),
      'Which Tech Partner'
    );

    const entries = Object.entries(partnerData)[0]; // Take first partner
    if (!entries) {
      return {
        partner: 'Unknown',
        issues: 0,
        activeContributors: 0,
        completionRate: 0
      };
    }

    const [partner, partnerEntries] = entries;
    return {
      partner,
      issues: partnerEntries.reduce((sum, entry) => 
        sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0),
      activeContributors: new Set(partnerEntries.map(e => e.Name)).size,
      completionRate: partnerEntries.filter(e => e['Tech Partner Collaboration?'] === 'Yes').length / partnerEntries.length
    };
  }

  private processContributorGrowth(data: EngagementData[]): ContributorGrowth {
    const weeklyData = _.groupBy(data, 'Program Week');
    const entries = Object.entries(weeklyData)[0]; // Take first week
    if (!entries) {
      return {
        week: 'Week 1',
        totalContributions: 0,
        activeContributors: 0,
        contributionsPerDev: 0,
        newContributors: 0
      };
    }

    const [week, weekEntries] = entries;
    const totalContributions = weekEntries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0);
    const activeContributors = weekEntries.filter(e => 
      parseInt(e['How many issues, PRs, or projects this week?'] || '0') > 0
    ).length;

    return {
      week,
      totalContributions,
      activeContributors,
      contributionsPerDev: activeContributors > 0 ? totalContributions / activeContributors : 0,
      newContributors: weekEntries.length
    };
  }

  async analyzeTrends(metricType: string): Promise<{ weeklyTrends: TrendDataPoint[] }> {
    return this.timeSeriesStore.analyzeTrends(metricType);
  }
}
