import { supabase } from './supabase';
import { z } from 'zod';
import { MetricType, MetricValue } from '@/types/metrics';

// Add validation schemas
const MetricValueSchema = z.object({
  timestamp: z.string().datetime(),
  value: z.union([z.number(), z.record(z.any())]),
  metadata: z.record(z.any()).optional()
});

const MetricTypeSchema = z.enum([
  'engagement',
  'contributions',
  'activeContributors',
  'programHealth',
  'techPartnerMetrics',
  'weeklyTrends'
]);

export async function storeMetrics(
  metricType: MetricType,
  data: MetricValue
) {
  // Validate inputs
  try {
    MetricTypeSchema.parse(metricType);
    MetricValueSchema.parse(data);
  } catch (error) {
    console.error('Invalid metric data:', error);
    return;
  }

  try {
    const { error } = await supabase
      .from('metrics_history')
      .insert({
        metric_type: metricType,
        value: data,
        timestamp: new Date().toISOString(),
        week: getCurrentWeek()
      });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Failed to store metrics:', error);
    throw new Error(`Failed to store ${metricType} metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getHistoricalMetrics(metricType: string, days = 30) {
  const { data } = await supabase
    .from('metrics_history')
    .select('*')
    .eq('metric_type', metricType)
    .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false });
  
  return data;
}

function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + 
    startOfYear.getDay() + 1) / 7
  );
  return `Week ${weekNumber}`;
}

export async function getWeeklyTrends(metricType: string, weeks = 12) {
  const { data, error } = await supabase
    .from('metrics_history')
    .select('*')
    .eq('metric_type', metricType)
    .order('timestamp', { ascending: false })
    .limit(weeks);

  return error ? [] : data;
} 