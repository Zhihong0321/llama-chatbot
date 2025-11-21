# LlamaIndex RAG Frontend

A React-based Single Page Application (SPA) frontend for managing knowledge bases (Vaults), uploading documents, creating AI agents, and interacting with those agents through a chat interface.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules with centralized theme system
- **Testing**: Vitest (unit tests), Playwright (E2E tests), fast-check (property-based tests)
- **Linting**: ESLint with airbnb-base + Prettier

## Prerequisites

- Node.js 18+ and npm

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment example file and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

### Production API Testing

**Test against the real LlamaIndex API server:**

1. **Quick Start**: See `../QUICK-START-TESTING.md` for immediate setup
2. **Full Test Plan**: See `../REAL-API-TEST-PLAN.md` for comprehensive manual testing

Production API: `https://eternalgy-rag-llamaindex-production.up.railway.app`

### Unit Tests

Run unit tests once:
```bash
npm run test
```

Run unit tests in watch mode:
```bash
npm run test:watch
```

Run unit tests with UI:
```bash
npm run test:ui
```

### Property-Based Tests

Property-based tests use `fast-check` to validate correctness properties across many generated inputs:
```bash
npm run test -- tests/property
```

### E2E Tests

Run E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

## Linting and Formatting

Run ESLint:
```bash
npm run lint
```

Fix ESLint issues:
```bash
npm run lint:fix
```

Check formatting:
```bash
npm run format:check
```

Format code:
```bash
npm run format
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and type definitions
│   ├── components/       # React components
│   │   ├── common/       # Shared components (Button, Modal, Toast, etc.)
│   │   ├── vault/        # Vault-related components
│   │   ├── agent/        # Agent-related components
│   │   ├── document/     # Document-related components
│   │   └── chat/         # Chat interface components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── context/          # React Context providers
│   ├── theme.ts          # Design system tokens
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── e2e/              # End-to-end tests
│   └── property/         # Property-based tests
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
├── playwright.config.ts  # Playwright configuration
└── package.json          # Dependencies and scripts
```

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for the FastAPI backend (required)

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## License

MIT
