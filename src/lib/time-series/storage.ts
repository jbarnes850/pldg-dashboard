import { TimeSeriesData, WeekData, TrendDataPoint, MetricPath } from './types';
import _ from 'lodash';

interface StorageData {
  [key: string]: any;
  cohorts: {
    [cohortId: string]: {
      weeks: WeekData[];
      metrics: {
        [metricType: string]: TimeSeriesData;
      };
    };
  };
  lastUpdated: string;
}

interface RawDataPoint {
  date?: string;
  timestamp?: number;
  value: number;
}

export class TimeSeriesStore {
  private static STORAGE_KEY = 'pldg_metrics_v1';
  private static LOCK_TIMEOUT = 5000; // 5 seconds

  private data: StorageData;
  private memoryCache: Map<string, any>;

  constructor() {
    this.data = this.initializeData();
    this.memoryCache = new Map();
    this.loadData();
  }

  private loadData() {
    try {
      const stored = localStorage.getItem(TimeSeriesStore.STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading time series data:', error);
    }
  }

  private initializeData(): StorageData {
    return {
      cohorts: {},
      lastUpdated: new Date().toISOString()
    };
  }

  private saveData() {
    try {
      localStorage.setItem(TimeSeriesStore.STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving time series data:', error);
    }
  }

  async batchUpdateMetrics(
    cohortId: string,
    points: TrendDataPoint[],
    metricType: string = 'total-engagement'
  ): Promise<void> {
    const cohort = this.data.cohorts[cohortId] || {
      id: cohortId,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      weeks: [],
      metrics: {}
    };

    cohort.metrics[metricType] = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      metricPath: metricType,
      points,
      cohorts: {}
    };

    this.data.cohorts[cohortId] = cohort;
    await this.saveData();
  }

  private async getLatestCohort(): Promise<any> {
    const cohorts = Object.values(this.data.cohorts);
    if (cohorts.length === 0) {
      return null;
    }
    return cohorts[cohorts.length - 1];
  }

  private transformRawPoints(points: RawDataPoint[]): TrendDataPoint[] {
    return points.map(point => ({
      date: point.date || new Date(point.timestamp || Date.now()).toISOString(),
      value: point.value
    }));
  }

  private async getMetricData(metricPath: string): Promise<TimeSeriesData> {
    const cohort = await this.getLatestCohort();
    if (!cohort) {
      return {
        version: 1,
        metricPath,
        points: [],
        lastUpdated: new Date().toISOString(),
        cohorts: {}
      };
    }

    const metricTypes = Object.keys(cohort.metrics);
    if (!metricTypes.length) {
      return {
        version: 1,
        metricPath,
        points: [],
        lastUpdated: new Date().toISOString(),
        cohorts: {}
      };
    }

    const rawPoints = cohort.metrics[metricTypes[0]].points as RawDataPoint[];
    const points = this.transformRawPoints(rawPoints);

    return {
      version: 1,
      metricPath,
      points,
      lastUpdated: new Date().toISOString(),
      cohorts: {}
    };
  }

  async getTimeSeriesData(metricPath: MetricPath): Promise<TimeSeriesData> {
    const data = await this.getMetricData(metricPath);
    return {
      version: 1,
      metricPath,
      points: data.points,
      lastUpdated: new Date().toISOString(),
      cohorts: {}
    };
  }

  async getCohortData(cohortId: string): Promise<TrendDataPoint[]> {
    const cohort = this.data.cohorts[cohortId];
    if (!cohort) {
      return [];
    }

    const metricTypes = Object.keys(cohort.metrics);
    if (!metricTypes.length) {
      return [];
    }

    const rawPoints = cohort.metrics[metricTypes[0]].points as RawDataPoint[];
    return this.transformRawPoints(rawPoints);
  }

  async analyzeTrends(metricType: string): Promise<{ weeklyTrends: TrendDataPoint[] }> {
    const data = await this.getMetricData(metricType);
    return {
      weeklyTrends: data.points
    };
  }

  private async getPoints(metricPath: string): Promise<TrendDataPoint[]> {
    const data = await this.getMetricData(metricPath);
    return data.points;
  }
}
