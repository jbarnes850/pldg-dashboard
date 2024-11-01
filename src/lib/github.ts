import useSWR from 'swr';
import { GitHubData } from '@/types/dashboard';
import { validateGitHubData } from './validation';

const REFRESH_INTERVAL = 60000; // 1 minute

export function useGitHubData() {
  const { data, error, mutate } = useSWR<GitHubData>(
    '/api/github',
    async () => {
      const response = await fetch('/api/github');
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub data');
      }
      const data = await response.json();
      
      console.log('GitHub Data Shape:', {
        hasStatusGroups: !!data?.statusGroups,
        hasMetrics: !!data?.metrics,
        statusGroups: data?.statusGroups,
        metrics: data?.metrics
      });

      const validatedData = validateGitHubData(data);
      if (!validatedData) {
        console.error('GitHub Data Validation Failed:', data);
        throw new Error('Invalid GitHub data format');
      }
      return validatedData;
    },
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onError: (err) => {
        console.error('GitHub Data Fetch Error:', err);
      }
    }
  );

  return {
    data: data || {
      statusGroups: {
        todo: 0,
        inProgress: 0,
        done: 0
      },
      metrics: {
        totalIssues: 0,
        openIssues: 0,
        recentActivity: 0,
        avgTimeToClose: 0,
        contributorCount: 0
      }
    },
    isLoading: !error && !data,
    isError: !!error,
    mutate
  };
} 