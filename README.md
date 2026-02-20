# VC Intelligence Interface

A modern VC discovery interface with live data enrichment capabilities. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Company Discovery**: Search, filter, and sort through a database of companies
- **Company Profiles**: Detailed company information with enrichment capabilities
- **Lists Management**: Create lists, add/remove companies, and export to CSV/JSON
- **Saved Searches**: Save and re-run search queries with filters
- **Live Enrichment**: AI-powered website scraping and data extraction
- **Notes**: Add and save notes for each company
- **Signals Timeline**: Track derived signals from enriched data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage (client-side persistence)
- **AI Enrichment**: OpenAI API (optional, falls back to simple extraction)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API key (optional, for enhanced enrichment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vc-intelligence-interface
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The enrichment feature works without an API key, but will use a simpler extraction method. For best results, provide an OpenAI API key.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for enhanced enrichment | No (optional) |

## Project Structure

```
├── app/
│   ├── api/
│   │   └── enrich/          # Server-side enrichment endpoint
│   ├── companies/
│   │   ├── [id]/            # Company profile page
│   │   └── page.tsx         # Companies listing page
│   ├── lists/               # Lists management page
│   ├── saved/               # Saved searches page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects to /companies)
├── components/
│   ├── GlobalSearch.tsx     # Global search component
│   └── Sidebar.tsx          # Navigation sidebar
├── lib/
│   ├── mockData.ts          # Mock company data
│   └── storage.ts           # localStorage utilities
├── types/
│   └── index.ts             # TypeScript type definitions
└── README.md
```

## Usage

### Companies Page

- Search companies by name, description, or tags
- Filter by stage, industry, or location
- Sort by any column (click column headers)
- Navigate through paginated results
- Click on any company to view its profile

### Company Profile

- View comprehensive company information
- Click "Enrich" to fetch live data from the company's website
- Add notes about the company
- Save company to a list
- View signals timeline from enriched data

### Lists

- Create custom lists to organize companies
- Add companies from their profile pages
- Remove companies from lists
- Export lists as CSV or JSON

### Saved Searches

- Save current search criteria (query + filters)
- Re-run saved searches with one click
- Delete saved searches when no longer needed

## Enrichment Feature

The enrichment feature scrapes public company websites and extracts:

- **Summary**: 1-2 sentence overview
- **What They Do**: 3-6 bullet points
- **Keywords**: 5-10 relevant keywords
- **Derived Signals**: 2-4 signals (e.g., careers page exists, blog present)
- **Sources**: URLs scraped with timestamps

### How It Works

1. User clicks "Enrich" on a company profile
2. Frontend calls `/api/enrich` with the company's website URL
3. Server-side endpoint:
   - Fetches the website content
   - If OpenAI API key is available, uses GPT-4o-mini to extract structured data
   - Otherwise, uses simple text extraction and pattern matching
   - Returns structured enrichment data
4. Results are cached in localStorage
5. UI displays the enriched data with sources

### Security

- API keys are never exposed to the browser
- Only public HTTP/HTTPS URLs are allowed
- Server-side validation prevents unauthorized access
- No attempt to bypass access controls

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` (if using OpenAI)
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import the project in Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Data Storage

All data is stored in the browser's localStorage:

- **Lists**: `vc_lists`
- **Saved Searches**: `vc_saved_searches`
- **Company Notes**: `vc_company_notes_{companyId}`
- **Enrichment Cache**: `vc_enrichment_cache_{companyId}`

To clear all data, clear your browser's localStorage.

## Mock Data

The app comes with 10 mock companies for testing. To add more companies, edit `lib/mockData.ts`.

## Limitations

- Data persistence is client-side only (localStorage)
- Enrichment works best with OpenAI API key
- Some websites may block scraping (CORS, rate limiting)
- Enrichment results are cached per company

## Future Enhancements

- Database integration for persistent storage
- User authentication
- Team collaboration features
- Advanced filtering and search
- Vector similarity search
- Integration with external APIs (Crunchbase, etc.)
- Slack/email notifications
- CRM integrations

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
