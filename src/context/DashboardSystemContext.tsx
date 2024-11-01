"use client";

import * as React from 'react';
import { ProcessedData, EnhancedProcessedData } from '@/types/dashboard';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardSystemContextType {
  data: EnhancedProcessedData | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardSystemContext = React.createContext<DashboardSystemContextType | undefined>(undefined);

export function DashboardSystemProvider({ children }: { children: React.ReactNode }) {
  const result = useDashboardData();
  
  const value = React.useMemo(() => ({
    data: result.status === 'success' ? {
      ...result.data,
      engagementTrends: result.data.engagementTrends || [],
      technicalProgress: result.data.technicalProgress || [],
      techPartnerPerformance: result.data.techPartnerPerformance || [],
      topPerformers: result.data.topPerformers || []
    } as EnhancedProcessedData : null,
    isLoading: result.status === 'loading',
    isError: result.status === 'error',
    error: result.status === 'error' ? String(result.error) : null,
    refresh: async () => {
      window.location.reload();
    }
  }), [result]);

  return (
    <DashboardSystemContext.Provider value={value}>
      {children}
    </DashboardSystemContext.Provider>
  );
}

export function useDashboardSystem() {
  const context = React.useContext(DashboardSystemContext);
  if (context === undefined) {
    throw new Error('useDashboardSystem must be used within a DashboardSystemProvider');
  }
  return context;
} 