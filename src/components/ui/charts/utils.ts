export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  background: 'hsl(var(--background))',
  border: 'hsl(var(--border))',
  success: '#059669',    // emerald-600
  warning: '#ea580c',    // orange-600
  error: '#dc2626',      // red-600
  info: '#2563eb',       // blue-600
  purple: '#7c3aed',     // violet-600
  pink: '#db2777',       // pink-600
  teal: '#0d9488',       // teal-600
  indigo: '#4f46e5',     // indigo-600
};

export const generateGradientId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatTooltipValue = (value: number): string => {
  if (typeof value !== 'number') return '0';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

export const calculateDomain = (data: number[]): [number, number] => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
};

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export const defaultTooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '0.5rem',
  padding: '0.75rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

export const defaultChartStyle = {
  fontSize: '12px',
  fontFamily: 'inherit',
  gridStroke: '#e2e8f0',
  gridStrokeOpacity: 0.4,
  tickStroke: '#64748b',
  lineStrokeWidth: 2,
  dotRadius: 4,
  activeDotRadius: 6,
  gridOpacity: 0.4,
  strokeWidth: 2
} as const;

export const formatAxisTick = (value: string | number): string => {
  if (typeof value === 'number') {
    return formatTooltipValue(value);
  }
  return String(value);
};

export const getResponsiveWidth = (containerWidth: number): number => {
  if (containerWidth < 400) return containerWidth;
  if (containerWidth < 600) return containerWidth * 0.9;
  return containerWidth * 0.85;
};
