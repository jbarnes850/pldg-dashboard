'use client';

import { useDashboardSystem } from '@/lib/system';
import DeveloperEngagementDashboard from '@/components/dashboard/DeveloperEngagementDashboard';
import { LoadingCard } from '@/components/ui/loading-card';

export default function Home() {
  const { data, isLoading, isError, refresh } = useDashboardSystem();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <LoadingCard />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error loading dashboard data</h2>
            <button 
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DeveloperEngagementDashboard data={data} onExport={refresh} />
      </div>
    </main>
  );
} 