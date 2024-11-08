# PLDG Dashboard Architecture

## System Overview

```mermaid

graph TD
    subgraph "Data Sources"
        A[Airtable API] --> P[Data Processing]
        G[GitHub GraphQL API] --> P
    end

    subgraph "Backend Processing"
        P --> V[Validation Layer]
        V --> T[Data Transformation]
        T --> C[Cache Layer]
        C --> D[Dashboard Data]
    end

    subgraph "Frontend Components"
        D --> E[Executive Summary]
        D --> M[Metrics Dashboard]
        D --> I[Technical Progress]
        D --> TP[Tech Partner Activity]
    end

    subgraph "Real-time Updates"
        S[Supabase] --> C
        S --> RT[Real-time Subscriptions]
        RT --> D
    end
```

## Data Pipeline

```mermaid
sequenceDiagram
    participant Client
    participant useDashboardData
    participant useProcessedData
    participant External APIs
    participant Supabase Cache

    Client->>useDashboardData: Request Dashboard Data
    useDashboardData->>Supabase Cache: Check Cache
    alt Cache Hit
        Supabase Cache-->>useDashboardData: Return Cached Data
    else Cache Miss
        useDashboardData->>useProcessedData: Request Fresh Data
        useProcessedData->>External APIs: Fetch Airtable Data
        useProcessedData->>External APIs: Fetch GitHub Data
        External APIs-->>useProcessedData: Raw Data
        useProcessedData->>useDashboardData: Process & Validate Data
        useDashboardData->>Supabase Cache: Update Cache
        useDashboardData-->>Client: Return Processed Data
    end
```

## Key Components

1. **Data Fetching Layer**
   - `useGitHubData`: GitHub GraphQL API integration
   - `useAirtableData`: Airtable API integration
   - Circuit breaker pattern for API resilience
   - Retry logic with configurable attempts

2. **Data Processing**
   - `useProcessedData`: Combines and processes raw data
   - `processEngagementData`: Transforms engagement metrics
   - Type-safe data transformation
   - Zod schema validation

3. **Caching Layer**
   - Supabase for data persistence
   - 5-minute cache duration
   - Automatic cache invalidation
   - Real-time subscriptions

4. **Dashboard Components**
   - Executive Summary
   - Engagement Trends
   - Technical Progress
   - Tech Partner Activity
   - Top Contributors

## Data Flow Architecture

1. **Initial Load**
   - Check Supabase cache
   - Fetch from APIs if cache miss
   - Process and validate data
   - Update cache with new data

2. **Real-time Updates**
   - Subscribe to Supabase changes
   - Trigger cache cleanup
   - Transform new data
   - Update UI components

3. **Error Handling**
   - Circuit breaker for API failures
   - Retry logic for transient errors
   - Fallback values for missing data
   - Type-safe validation

## Performance Optimizations

1. **Caching Strategy**
   - 5-minute cache TTL
   - Automatic cleanup of expired cache
   - Deduplication of requests
   - Real-time invalidation

2. **Data Processing**
   - Memoized transformations
   - Type-safe validations
   - Efficient data structures
   - Optimistic updates

3. **UI Components**
   - Lazy loading
   - Memoized calculations
   - Default fallback values
   - Loading states

## Tech Stack

- Next.js
- TypeScript
- Supabase
- Tailwind CSS
- Recharts
- SWR
- Zod
