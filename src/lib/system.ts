import { useCallback, useState, useEffect } from 'react';
import useSWR from 'swr';
import { DataProcessor } from './time-series/integration';
import { EngagementData, GitHubData } from '@/types/dashboard';
import type { ProcessedData } from '@/types/dashboard';

export function useDashboardSystemContext() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const { data: airtableData, isLoading: isAirtableLoading } = useSWR<EngagementData[]>(
    '/api/airtable',
    async () => {
      const response = await fetch('/api/airtable');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.records || [];
    }
  );

  const { data: githubData, isLoading: isGithubLoading } = useSWR<GitHubData>(
    '/api/github',
    async () => {
      const response = await fetch('/api/github');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  );

  const processData = useCallback(async (): Promise<ProcessedData | null> => {
    if (!airtableData || !githubData || isAirtableLoading || isGithubLoading) {
      return null;
    }

    try {
      const processor = DataProcessor.getInstance();
      const data = await processor.processData(airtableData, githubData);
      setData(data);
      setLastUpdated(new Date().toISOString());
      return data;
    } catch (error: unknown) {
      console.error('Error processing dashboard data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return null;
    }
  }, [airtableData, githubData, isAirtableLoading, isGithubLoading]);

  const refresh = useCallback(async () => {
    console.log('Starting Refresh');
    setIsFetching(true);
    try {
      await processData();
      console.log('Refresh Complete');
    } catch (error: unknown) {
      console.error('Error refreshing data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsFetching(false);
    }
  }, [processData]);

  useEffect(() => {
    processData();
  }, [processData]);

  return {
    data,
    isLoading: isAirtableLoading || isGithubLoading,
    isError: !!error,
    error,
    refresh,
    lastUpdated,
    isFetching
  };
}
