# EazySlot - Automated Form Submission

EazySlot is a specialized Apify Actor designed to automate form submissions on `yupsis.com` using data from a Supabase PostgreSQL database. It uses Playwright for browser automation and manages task statuses directly in the database.

## Features

- **Database Integration**: Fetches pending tasks (`files` table) from a Supabase PostgreSQL database.
- **Parallel Processing**: capable of processing multiple form submissions simultaneously (`maxConcurrency: 50`).
- **Status Tracking**: Updates task status in the database (`processing`, `success`, `failed`) in real-time.
- **Auto-Scaling**: Uses Apify's `PlaywrightCrawler` to auto-scale based on available system resources.
- **Error Handling**: Captures errors and updates the database with failure reasons.

## Configuration

### Database Connection

The Actor connects to a Supabase PostgreSQL database. The connection string is currently configured in `src/db.ts`.

**Table Schema (`files`):**

```sql
create table files (
  id uuid primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  message text,
  status text check (status in ('created', 'processing', 'success', 'failed')),
  attempts int default 0,
  reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);
```

### Input

The actor accepts input via the Apify Console or API, primarily for tuning performance:

```json
{
    "maxRequestsPerCrawl": 100
}
```

- `maxRequestsPerCrawl`: Maximum number of tasks to process in a single run (default: 100).

## Local Development

1. **Install Dependencies**:

    ```bash
    npm install
    ```

2. **Run Locally**:
    ```bash
    npm start
    ```

## Deploy to Apify

You can deploy this Actor to Apify using either the Apify CLI or by connecting a GitHub repository.

### Option 1: Via GitHub (Recommended)

1. Push this code to a GitHub repository:
    ```bash
    git remote add origin git@github.com:developer-sujon/eazyslot-apify.git
    git push -u origin main
    ```
2. Go to [Apify Console](https://console.apify.com/actors) -> Create New -> **Git Repository**.
3. Connect your GitHub account and select this repository.

### Option 2: Via Apify CLI

1. Login to Apify:
    ```bash
    apify login
    ```
2. Push the actor:
    ```bash
    apify push
    ```

## Tech Stack

- **Apify SDK**: For actor management.
- **Crawlee + Playwright**: For browser automation.
- **PostgreSQL (`pg`)**: For database connectivity.
- **TypeScript**: For type-safe code.
