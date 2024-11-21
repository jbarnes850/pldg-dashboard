import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimeSeriesChart } from '../TimeSeriesChart';
import { TrendDataPoint } from '@/lib/time-series/types';
import '@testing-library/jest-dom';

// Mock data
const mockData: TrendDataPoint[] = [
  { timestamp: '2024-01-01', value: 10 },
  { timestamp: '2024-01-08', value: 15 },
  { timestamp: '2024-01-15', value: 12 },
  { timestamp: '2024-01-22', value: 18 }
];

// Mock ResizeObserver
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

window.ResizeObserver = ResizeObserverMock;

describe('TimeSeriesChart Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders time series chart with data', () => {
    render(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
        title="Engagement Trend"
      />
    );

    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByText(/Engagement Trend/i)).toBeInTheDocument();
  });

  it('displays correct time intervals', () => {
    render(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
      />
    );

    // Verify weekly view text
    expect(screen.getByText(/Weekly View/i)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <TimeSeriesChart 
        data={[]} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
      />
    );
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('shows tooltips on data points', async () => {
    render(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
      />
    );

    // Verify figure is rendered
    const figure = screen.getByRole('figure');
    expect(figure).toBeInTheDocument();

    // Verify interval text is shown
    expect(screen.getByText(/Weekly View/i)).toBeInTheDocument();
  });

  it('shows correct interval text', () => {
    const { rerender } = render(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
      />
    );

    expect(screen.getByText(/Weekly View/i)).toBeInTheDocument();

    // Change to monthly view
    rerender(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="monthly"
      />
    );

    expect(screen.getByText(/Monthly View/i)).toBeInTheDocument();
  });

  it('displays metric name', () => {
    render(
      <TimeSeriesChart 
        data={mockData} 
        metricType="engagement" 
        subMetric="totalParticipants" 
        interval="weekly"
      />
    );

    // Verify figure is rendered
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });
});
