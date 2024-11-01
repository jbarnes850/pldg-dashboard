import { useCallback, useEffect, useState, useRef } from 'react';
import { useProcessedData } from './data-processing';
import { ProcessedData, EnhancedProcessedData, TechPartnerMetrics } from '@/types/dashboard';
import { isValidProcessedData } from './validation';

// Cache for insights data
const insightsCache = new Map<string, any>();

async function generateEnhancedInsights(data: ProcessedData): Promise<EnhancedProcessedData> {
  try {
    // Generate cache key based on data
    const cacheKey = JSON.stringify({
      engagementMetrics: data.engagementTrends,
      techPartnerMetrics: data.techPartnerMetrics,
      contributorMetrics: {
        activeContributors: data.activeContributors,
        totalContributions: data.totalContributions,
        weeklyChange: data.weeklyChange
      },
      githubMetrics: data.githubMetrics
    });

    // Check cache first
    if (insightsCache.has(cacheKey)) {
      return {
        ...data,
        insights: insightsCache.get(cacheKey)
      };
    }

    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        engagementMetrics: {
          trends: data.engagementTrends || [],
        },
        techPartnerMetrics: data.techPartnerMetrics?.map((metric: TechPartnerMetrics) => ({
          partner: metric.partner,
          totalIssues: metric.totalIssues || 0,
          activeContributors: metric.activeContributors || 0,
          avgEngagement: metric.avgEngagement || 0
        })) || [],
        contributorMetrics: {
          activeContributors: data.activeContributors || 0,
          totalContributions: data.totalContributions || 0,
          weeklyChange: data.weeklyChange || 0,
        },
        githubMetrics: data.githubMetrics || {
          totalIssues: 0,
          openIssues: 0,
          recentActivity: 0,
          avgTimeToClose: 0,
          contributorCount: 0
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate insights: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Cache the insights
    insightsCache.set(cacheKey, result.insights);

    return {
      ...data,
      insights: result.insights
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      ...data,
      insights: {
        keyTrends: [],
        areasOfConcern: [],
        recommendations: [],
        achievements: [],
        metrics: {
          engagementScore: 0,
          technicalProgress: 0,
          collaborationIndex: 0
        }
      }
    };
  }
}

export function useDashboardSystem() {
  const [data, setData] = useState<EnhancedProcessedData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { data: processedData, isLoading, error: processedDataError } = useProcessedData();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;

    async function enhanceData() {
      if (processedDataError) {
        if (mounted) setError(processedDataError);
        return;
      }

      if (!processedData) {
        if (!isLoading && mounted) {
          setError(new Error('No processed data available'));
        }
        return;
      }

      try {
        if (!isValidProcessedData(processedData)) {
          throw new Error('Invalid processed data structure');
        }

        if (isGeneratingInsights) return;
        setIsGeneratingInsights(true);

        // Clear any existing timer
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
          const enhanced = await generateEnhancedInsights(processedData);
          if (mounted) {
            setData(enhanced);
            setError(null);
            setIsGeneratingInsights(false);
          }
        }, 1000); // 1 second debounce

      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
          if (processedData) {
            setData({
              ...processedData,
              insights: {
                keyTrends: [],
                areasOfConcern: [],
                recommendations: [],
                achievements: [],
                metrics: {
                  engagementScore: 0,
                  technicalProgress: 0,
                  collaborationIndex: 0
                }
              }
            });
          }
        }
      }
    }

    enhanceData();
    
    return () => {
      mounted = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [processedData, isLoading, processedDataError, isGeneratingInsights]);

  return {
    data,
    isLoading: isLoading || isGeneratingInsights,
    isError: !!error || !!processedDataError,
    error: error?.message || processedDataError?.message || null,
    refresh: useCallback(() => window.location.reload(), [])
  };
}
