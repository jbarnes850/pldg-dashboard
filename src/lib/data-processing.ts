import { useCallback, useEffect, useState } from 'react';
import { useAirtableData } from './airtable';
import { useGitHubData } from './github';
import { ProcessedData, GitHubMetrics, EngagementData } from '@/types/dashboard';
import { processEngagementData } from './utils';

export function useProcessedData() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { data: airtableData, isLoading: isAirtableLoading } = useAirtableData();
  const { data: githubData, isLoading: isGithubLoading } = useGitHubData();

  const processData = useCallback(async () => {
    if (!airtableData || !githubData) {
      return null;
    }
    
    try {
      if (!Array.isArray(airtableData) || airtableData.length === 0) {
        throw new Error('Invalid Airtable data structure');
      }

      const normalizedAirtableData: EngagementData[] = airtableData.map(record => ({
        ...record,
        'Tech Partner': typeof record['Tech Partner'] === 'string' ? record['Tech Partner'] : '',
        'Which Tech Partner': typeof record['Which Tech Partner'] === 'string' ? record['Which Tech Partner'] : ''
      }));

      const currentMetrics: GitHubMetrics = {
        inProgress: githubData?.statusGroups?.inProgress || 0,
        done: githubData?.statusGroups?.done || 0,
        totalIssues: githubData?.metrics?.totalIssues || 0,
        openIssues: githubData?.metrics?.openIssues || 0,
        recentActivity: githubData?.metrics?.recentActivity || 0,
        avgTimeToClose: githubData?.metrics?.avgTimeToClose || 0,
        contributorCount: githubData?.metrics?.contributorCount || 0
      };

      const processed = await processEngagementData(normalizedAirtableData, currentMetrics);
      setProcessedData(processed);
    } catch (error) {
      console.error('Error processing data:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      return null;
    }
  }, [airtableData, githubData]);

  useEffect(() => {
    if (!isAirtableLoading && !isGithubLoading) {
      processData();
    }
  }, [processData, isAirtableLoading, isGithubLoading]);

  return {
    data: processedData,
    isLoading: isAirtableLoading || isGithubLoading,
    error
  };
}
