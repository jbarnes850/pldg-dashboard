import * as React from 'react';
import { TopPerformer } from '@/types/dashboard';

interface Props {
  data: TopPerformer[];
}

export default function TopPerformersTable({ data }: Props) {
  React.useEffect(() => {
    console.log('TopPerformersTable received data:', {
      hasData: Array.isArray(data) && data.length > 0,
      rawData: data
    });
  }, [data]);

  const normalizedPerformers = React.useMemo(() => {
    const nameMap = new Map<string, TopPerformer>();

    data.forEach(performer => {
      if (!performer.name) return;
      
      const normalizedName = performer.name.toLowerCase().trim();
      
      if (nameMap.has(normalizedName)) {
        const existing = nameMap.get(normalizedName)!;
        nameMap.set(normalizedName, {
          name: performer.name,
          totalIssues: existing.totalIssues + performer.totalIssues,
          avgEngagement: (existing.avgEngagement + performer.avgEngagement) / 2,
          issuesCompleted: existing.issuesCompleted + (performer.issuesCompleted || 0),
          engagementScore: (existing.engagementScore + performer.engagementScore) / 2,
          techPartner: performer.techPartner || existing.techPartner
        });
      } else {
        nameMap.set(normalizedName, {
          name: performer.name,
          totalIssues: performer.totalIssues,
          avgEngagement: performer.avgEngagement,
          issuesCompleted: performer.issuesCompleted || 0,
          engagementScore: performer.engagementScore,
          techPartner: performer.techPartner || 'Unknown'
        });
      }
    });

    return Array.from(nameMap.values())
      .sort((a, b) => b.totalIssues - a.totalIssues)
      .slice(0, 10);
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Total Issues</th>
            <th className="px-4 py-2 text-left">Avg Engagement</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {normalizedPerformers.map((performer, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{performer.name}</td>
              <td className="px-4 py-2">{performer.totalIssues}</td>
              <td className="px-4 py-2">{performer.avgEngagement.toFixed(2)}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${index < 3 ? 'bg-green-100 text-green-800' : 
                    index < 6 ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {index < 3 ? 'Top Performer' : 
                   index < 6 ? 'High Performer' : 
                   'Active Contributor'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 