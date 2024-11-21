import { render, screen } from '@testing-library/react';
import { TechPartnerChart } from '../TechPartnerChart';
import { generateMockTechPartnerData } from '@/lib/time-series/__tests__/test-utils';
import '@testing-library/jest-dom';

const mockData = generateMockTechPartnerData(4);

// Mock ResizeObserver
const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

window.ResizeObserver = ResizeObserverMock;

describe('TechPartnerChart Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders tech partner distribution chart', () => {
    render(
      <TechPartnerChart 
        data={mockData}
        title="Tech Partner Distribution"
      />
    );

    expect(screen.getByText('Tech Partner Distribution')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <TechPartnerChart 
        data={[]}
        title="Tech Partner Distribution"
      />
    );

    expect(screen.getByText('No tech partner data available')).toBeInTheDocument();
  });

  it('displays correct title and description', () => {
    const description = 'Shows distribution of tech partner metrics';
    render(
      <TechPartnerChart 
        data={mockData}
        title="Tech Partner Distribution"
        description={description}
      />
    );

    expect(screen.getByText('Tech Partner Distribution')).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });
});
