'use client';

import * as React from 'react';
import { EngagementTrend } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

interface Props {
  data: EngagementTrend[];
}

export default function EngagementChart({ data }: Props) {
  const hasData = Array.isArray(data) && data.length > 0;
  
  React.useEffect(() => {
    console.log('EngagementChart received data:', {
      hasData,
      dataLength: data?.length,
      firstItem: data?.[0]
    });
  }, [data, hasData]);

  const chartData = React.useMemo(() => {
    if (!hasData) return [];
    return data.map(week => ({
      week: week.week,
      'High Engagement': week['High Engagement'] || 0,
      'Medium Engagement': week['Medium Engagement'] || 0,
      'Low Engagement': week['Low Engagement'] || 0
    }));
  }, [data, hasData]);

  return (
    <Card className="h-[500px] border-2 border-gray-200/20 shadow-md dark:border-gray-800/20">
      <CardHeader>
        <CardTitle>Engagement Trends</CardTitle>
        <CardDescription>
          {hasData ? 'Weekly engagement levels' : 'No engagement data available'}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="High Engagement" fill="#4CAF50" />
              <Bar dataKey="Medium Engagement" fill="#FFC107" />
              <Bar dataKey="Low Engagement" fill="#FF5722" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}