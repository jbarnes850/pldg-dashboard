'use client';

import * as React from 'react';
import { TechPartnerPerformance } from '@/types/dashboard';
import { GitPullRequest, Users, ExternalLink, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../ui/button';

interface Props {
  data: TechPartnerPerformance[];
}

const GITHUB_LINKS = {
  board: "https://github.com/users/kt-wawro/projects/7/views/1",
  partners: "https://github.com/users/kt-wawro/projects/7/views/1?filterQuery=label%3A%22tech+partner%22"
};

export default function TechPartnerChart({ data }: Props) {
  const hasData = Array.isArray(data) && data.length > 0;
  const validPartners = ['IPFS', 'Libp2p', 'Fil-B', 'Fil-Oz', 'Coordination Network', 'Storacha', 'Helia'];
  
  React.useEffect(() => {
    console.log('TechPartnerChart data:', {
      hasData,
      validPartners,
      rawData: data,
      processedData: validPartners.map(partner => {
        const contributions = data
          ?.filter(item => item.partner === partner)
          .reduce((sum, curr) => sum + curr.issues, 0) || 0;
        return { partner, contributions };
      })
    });
  }, [data, validPartners]);

  const chartData = React.useMemo(() => {
    if (!hasData) return [];
    
    return validPartners
      .map(partner => {
        const contributions = data
          .filter(item => item.partner === partner)
          .reduce((sum, curr) => sum + curr.issues, 0);
        
        return {
          partner,
          contributions
        };
      })
      .filter(item => item.contributions > 0)
      .sort((a, b) => b.contributions - a.contributions);
  }, [data, hasData]);

  return (
    <Card className="relative overflow-hidden border-2 border-purple-200/20 bg-gradient-to-br from-purple-50/50 via-white to-white dark:from-purple-950/5 dark:via-purple-900/5 dark:to-gray-900/50 h-[500px] shadow-md">
      <CardHeader className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">Tech Partner Activity</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {hasData ? 'Contribution distribution across partners' : 'No partner data available'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.board, '_blank')}
              className="flex items-center gap-1 bg-white/80 hover:bg-white/90 border-purple-100"
            >
              <ExternalLink className="w-4 h-4" />
              Project Board
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.partners, '_blank')}
              className="flex items-center gap-1 bg-white/80 hover:bg-white/90 border-purple-100"
            >
              <BarChart3 className="w-4 h-4" />
              Partner View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 h-[400px]">
        {!hasData || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground bg-white/50 rounded-lg">
            No partner data to display
          </div>
        ) : (
          <div className="bg-white/50 p-4 rounded-lg h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="partner" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="contributions"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  label={{ 
                    position: 'top',
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 