# PLDG Dashboard

A real-time analytics dashboard for tracking developer engagement, technical progress, and contribution metrics across the PLDG (Protocol Labs Developer Guild) program.

## Features

- 📊 Real-time metrics visualization
  - Engagement rates and NPS scores
  - Technical progress tracking
  - Contributor activity metrics
  - Tech partner collaboration insights

- 🔄 Efficient Data Management
  - Supabase integration for persistence
  - Smart caching with TTL
  - Automatic data revalidation
  - Error resilient operations

- 📈 Advanced Analytics
  - Week-over-week comparisons
  - Historical trend analysis
  - Performance metrics calculation
  - Tech partner engagement tracking

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Data Storage**: Supabase
- **Data Sources**:
  - Airtable (engagement surveys)
  - GitHub API (technical metrics)
- **State Management**: SWR
- **Type Validation**: Zod
- **Styling**: Tailwind CSS, shadcn/ui

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/jbarnes850/pldg-dashboard.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Run the development server

   ```bash
   npm run dev
   ```

4. Open the app in the browser

   ```bash
   http://localhost:3000
   ```

## Project Structure

```bash
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── dashboard/   # Dashboard-specific components
│   └── ui/         # Reusable UI components
├── lib/             # Utility functions
│   ├── utils.ts    # General utilities
│   ├── validation.ts # Data validation
│   └── ai.ts       # AI processing
├── types/           # TypeScript type definitions
└── public/          # Static assets
    └── data/       # CSV data files
```

## Data Flow

1. **Data Collection**
   - Airtable integration with retry logic
   - GitHub integration with rate limiting
   - Smart caching to reduce API calls
   - Error handling with fallbacks

2. **Processing Pipeline**
   - Type-safe data validation (Zod)
   - Metric calculations with error boundaries
   - Historical trend analysis
   - Real-time data updates

3. **Storage Layer**
   - Supabase tables for metrics history
   - Cached responses with TTL
   - Automatic cache invalidation
   - Error resilient operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License

## Known Limitations

1. **Historical Data**:
   - No persistent storage of historical status changes
   - GitHub status counts reset on page refresh
   - Limited trend analysis capabilities
   - Week-over-week comparisons reset on refresh

2. **Real-time Constraints**:
   - Data freshness limited by API rate limits
   - Snapshot-based metrics without historical context
   - Limited ability to track long-term patterns

## Roadmap

### Phase 1 (Current - MVP)

- ✅ Real-time dashboard with key metrics
- ✅ Airtable and GitHub integration
- ✅ Basic trend visualization
- ✅ AI-powered insights

### Phase 2 (In Progress)

1. **Historical Data Storage**
   - ✅ Implement database for metric persistence
   - Track status changes over time
   - Enable historical trend analysis
   - Add date-range filtering for all metrics

2. **Enhanced Analytics**
   - Long-term trend analysis
   - Predictive engagement metrics
   - Advanced collaboration patterns
   - Custom reporting periods

3. **Performance Optimization**
   - Implement data caching
   - Optimize API calls
   - Add pagination for large datasets
   - Improve load times

### Phase 3 (Future)

1. **Advanced Features**
   - Custom metric definitions
   - Automated reporting
   - Integration with more data sources
   - Advanced AI analysis
   - Export capabilities for all metrics

2. **User Experience**
   - Customizable dashboards
   - Role-based access control
   - Mobile optimization
   - Real-time notifications
