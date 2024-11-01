import { useProcessedData } from '@/lib/data-processing';
import { processedDataSchema } from '@/lib/schemas';
import { ProcessedData, TopPerformer } from '@/types/dashboard';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

const CACHE_DURATION = 60 * 5; // 5 minutes in seconds
const MAX_RETRIES = 3;

class CircuitBreaker {
  private failures = 0;
  private lastFailure: number | null = null;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 1 minute

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (this.lastFailure && Date.now() - this.lastFailure >= this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }

  reset(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
}

const circuitBreaker = new CircuitBreaker();

async function withCircuitBreaker<T>(operation: () => Promise<T>): Promise<T> {
  if (circuitBreaker.isOpen()) {
    throw new Error('Circuit breaker is open');
  }

  try {
    const result = await operation();
    circuitBreaker.reset();
    return result;
  } catch (error) {
    circuitBreaker.recordFailure();
    throw error;
  }
}

async function cleanupCache() {
  const { error } = await supabase
    .from('cached_responses')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error cleaning up cache:', error);
  }
}

const dedupingInterval = 2000; // 2 seconds
let lastFetchTimestamp = 0;
let pendingPromise: Promise<ProcessedData | null> | null = null;

type DashboardDataResult = 
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; data: ProcessedData };

const dedupeRequests = async (fetchFn: () => Promise<ProcessedData | null>) => {
  const now = Date.now();
  if (pendingPromise && now - lastFetchTimestamp < dedupingInterval) {
    return pendingPromise;
  }
  lastFetchTimestamp = now;
  pendingPromise = fetchFn();
  return pendingPromise;
};

async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export function useDashboardData(): DashboardDataResult {
  const { data, isLoading } = useProcessedData();
  const [result, setResult] = useState<DashboardDataResult>({ status: 'loading' });

  const checkCache = useCallback(async () => {
    const { data: cachedData, error } = await supabase
      .from('cached_responses')
      .select('*')
      .eq('endpoint', 'dashboard_metrics')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return cachedData?.data as ProcessedData | null;
  }, []);

  const updateCache = useCallback(async (data: ProcessedData) => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + CACHE_DURATION);

    const { error } = await supabase
      .from('cached_responses')
      .upsert({
        endpoint: 'dashboard_metrics',
        data,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;
  }, []);

  const persistMetrics = useCallback(async (transformedData: ProcessedData) => {
    try {
      console.log('Starting metrics persistence with data:', transformedData);

      if (!supabase || process.env.NODE_ENV === 'development') {
        console.log('Skipping Supabase operations in development');
        return transformedData;
      }

      try {
        await withCircuitBreaker(async () => {
          const { error } = await supabase
            .from('metrics_history')
            .insert({
              metric_type: 'weekly_contributions',
              value: {
                weeklyChange: transformedData.weeklyChange,
                totalContributions: transformedData.totalContributions,
                activeContributors: transformedData.activeContributors
              }
            });
          if (error) {
            console.error('Error inserting metrics history:', error);
            throw error;
          }
        });

        const validatedTopPerformers: TopPerformer[] = transformedData.topPerformers.map(performer => ({
          name: performer.name || '',
          totalIssues: performer.totalIssues || 0,
          avgEngagement: performer.avgEngagement || 0,
          engagementScore: performer.engagementScore || 0,
          issuesCompleted: performer.issuesCompleted || 0,
          techPartner: performer.techPartner || 'Unknown'
        }));

        try {
          await withCircuitBreaker(async () => {
            const { error } = await supabase
              .from('contributor_metrics')
              .upsert(validatedTopPerformers.map(performer => ({
                contributor_name: performer.name,
                total_issues: performer.totalIssues,
                avg_engagement: performer.avgEngagement,
                status: 'top_performer'
              })));
            if (error) {
              console.error('Error upserting contributor metrics:', error);
              throw error;
            }
          });
        } catch (error) {
          console.error('Failed to persist contributor metrics:', error);
        }

        try {
          await withCircuitBreaker(async () => {
            const { error } = await supabase
              .from('tech_partner_metrics')
              .upsert(transformedData.techPartnerMetrics.map(partner => ({
                partner_name: partner.partner,
                issues_count: partner.totalIssues,
                contributors_count: partner.activeContributors,
                engagement_score: partner.avgEngagement
              })));
            if (error) {
              console.error('Error upserting tech partner metrics:', error);
              throw error;
            }
          });
        } catch (error) {
          console.error('Failed to persist tech partner metrics:', error);
        }

        const validatedData: ProcessedData = {
          ...transformedData,
          topPerformers: validatedTopPerformers
        };

        try {
          await updateCache(validatedData);
        } catch (error) {
          console.error('Failed to update cache:', error);
        }

        return validatedData;
      } catch (error) {
        console.error('Error in Supabase operations:', error);
        return transformedData;
      }
    } catch (error) {
      console.error('Error persisting metrics:', error);
      return transformedData;
    }
  }, [updateCache]);

  const transformData = useCallback(async () => {
    if (isLoading) {
      return { status: 'loading' as const };
    }

    if (!data) {
      return { status: 'error' as const, error: new Error('No data available') };
    }

    try {
      const cachedData = await checkCache();
      if (cachedData) {
        console.log('Using cached data');
        return { status: 'success' as const, data: cachedData };
      }

      console.log('Processing fresh data');
      const transformedData = await persistMetrics(data);
      return { status: 'success' as const, data: transformedData };
    } catch (error) {
      console.error('Error transforming data:', error);
      return { status: 'success' as const, data };
    }
  }, [data, isLoading, checkCache, persistMetrics]);

  useEffect(() => {
    const subscription = supabase
      .channel('dashboard_metrics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'metrics_history'
      }, async () => {
        await cleanupCache();
        const newResult = await transformData();
        setResult(newResult);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [transformData]);

  useEffect(() => {
    transformData().then(setResult);
  }, [transformData]);

  return result;
}
