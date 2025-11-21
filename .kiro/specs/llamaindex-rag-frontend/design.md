# Design Document

## Overview

The LlamaIndex RAG Frontend is a React-based Single Page Application (SPA) built with TypeScript and Vite. The application provides a premium user interface for managing knowledge bases (Vaults), uploading documents, creating AI agents, and interacting with those agents through a chat interface. The frontend communicates with a FastAPI backend via RESTful HTTP endpoints.

The application follows a component-based architecture with clear separation between presentation, business logic, and data fetching. State management is handled through React Context API for global state and local component state for UI-specific concerns. The design emphasizes accessibility, performance, and maintainability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React SPA (Frontend)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Hooks      │      │
│  │              │  │              │  │              │      │
│  │ - Dashboard  │  │ - VaultList  │  │ - useVaults  │      │
│  │ - Vaults     │  │ - AgentCard  │  │ - useAgents  │      │
│  │ - Documents  │  │ - ChatWindow │  │ - useChat    │      │
│  │ - Agents     │  │ - UploadForm │  │ - useIngest  │      │
│  │ - Chat       │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API Client   │  │ State Mgmt   │  │ Utils        │      │
│  │              │  │              │  │              │      │
│  │ - api.ts     │  │ - Context    │  │ - validators │      │
│  │ - types.ts   │  │ - Providers  │  │ - formatters │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│  /vaults  /agents  /ingest  /documents  /chat               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules with centralized theme system
- **HTTP Client**: Native Fetch API with custom wrapper
- **State Management**: React Context API + custom hooks
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Linting**: ESLint with airbnb-base + Prettier

### Directory Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # HTTP client wrapper
│   │   ├── types.ts           # API request/response types
│   │   ├── vaults.ts          # Vault API calls
│   │   ├── agents.ts          # Agent API calls
│   │   ├── documents.ts       # Document API calls
│   │   ├── chat.ts            # Chat API calls
│   │   └── ingest.ts          # Ingestion API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   └── ProgressBar/
│   │   ├── vault/
│   │   │   ├── VaultList/
│   │   │   ├── VaultSelector/
│   │   │   ├── VaultFormModal/
│   │   │   └── VaultDeleteConfirm/
│   │   ├── agent/
│   │   │   ├── AgentList/
│   │   │   ├── AgentCard/
│   │   │   ├── AgentFormModal/
│   │   │   └── AgentCURLSnippet/
│   │   ├── document/
│   │   │   ├── DocumentTable/
│   │   │   ├── DocumentUploadForm/
│   │   │   └── IngestProgressBar/
│   │   └── chat/
│   │       ├── ChatWindow/
│   │       ├── ChatMessageBubble/
│   │       ├── ChatInput/
│   │       └── ChatSourceList/
│   ├── hooks/
│   │   ├── useVaults.ts
│   │   ├── useAgents.ts
│   │   ├── useDocuments.ts
│   │   ├── useChat.ts
│   │   ├── useIngest.ts
│   │   └── useToast.ts
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── ToastContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── VaultManagement.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── AgentManagement.tsx
│   │   └── ChatConsole.tsx
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── curlGenerator.ts
│   │   └── sessionId.ts
│   ├── theme.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Components and Interfaces

### Core Components

#### 1. VaultSelector
**Purpose**: Dropdown component for selecting a Vault from available options.

**Props**:
```typescript
interface VaultSelectorProps {
  vaults: Vault[];
  selectedVaultId: string | null;
  onSelect: (vaultId: string) => void;
  disabled?: boolean;
}
```

**Behavior**:
- Displays vault name and description in dropdown options
- Applies glass-morphism styling from theme
- Emits selection event when user chooses a vault

#### 2. DocumentUploadForm
**Purpose**: Form for uploading documents to a selected Vault.

**Props**:
```typescript
interface DocumentUploadFormProps {
  vaultId: string;
  onUploadComplete: (documentId: string) => void;
}
```

**Features**:
- File picker accepting `.pdf`, `.docx`, `.txt`, `.md`
- Optional metadata fields (title, source, custom JSON)
- Vault selector (required)
- Submit triggers POST `/ingest`
- Shows IngestProgressBar after submission

#### 3. IngestProgressBar
**Purpose**: Displays real-time progress of document ingestion.

**Props**:
```typescript
interface IngestProgressBarProps {
  taskId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}
```

**Behavior**:
- Polls `/ingest/status/{task_id}` every 2 seconds
- Updates progress bar (0-100%)
- Fires `onComplete` when status === "done"
- Fires `onError` when status === "failed"
- Stops polling on completion or error

#### 4. AgentFormModal
**Purpose**: Modal dialog for creating or editing agents.

**Props**:
```typescript
interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agent: AgentCreateRequest) => void;
  initialData?: Partial<AgentCreateRequest>;
}
```

**Fields**:
- Agent name (text input)
- Vault selector (dropdown)
- System prompt (textarea)

#### 5. AgentCURLSnippet
**Purpose**: Displays and copies cURL command for agent chat.

**Props**:
```typescript
interface AgentCURLSnippetProps {
  agentId: string;
  apiBaseUrl: string;
}
```

**Features**:
- Generates formatted cURL command
- Copy button with clipboard API
- Shows success toast on copy

#### 6. ChatWindow
**Purpose**: Main chat interface for interacting with agents or vaults.

**Props**:
```typescript
interface ChatWindowProps {
  agentId?: string;
  vaultId?: string;
  sessionId: string;
}
```

**Features**:
- Message history display
- Input field with send button
- Source cards for each response
- Auto-scroll to latest message
- Loading indicator during API calls

### API Client Interface

```typescript
// src/api/client.ts
interface APIClient {
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
  post<T>(path: string, body: any): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

// Error handling
interface APIError {
  status: number;
  message: string;
  details?: any;
}
```

### Type Definitions

```typescript
// src/api/types.ts

// Vault types
interface Vault {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface VaultCreateRequest {
  name: string;
  description: string;
}

// Agent types
interface Agent {
  agent_id: string;
  name: string;
  vault_id: string;
  system_prompt: string;
  created_at: string;
}

interface AgentCreateRequest {
  name: string;
  vault_id: string;
  system_prompt: string;
}

// Document types
interface Document {
  document_id: string;
  title: string;
  source: string;
  vault_id: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface IngestRequest {
  text: string;
  title: string;
  source: string;
  vault_id: string;
  metadata?: Record<string, any>;
}

interface IngestResponse {
  document_id: string;
  task_id: string;
}

interface IngestStatus {
  task_id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
  error?: string;
}

// Chat types
interface ChatRequest {
  session_id: string;
  message: string;
  vault_id?: string;
  agent_id?: string;
  config?: {
    top_k?: number;
    temperature?: number;
  };
}

interface ChatSource {
  document_id: string;
  title: string;
  snippet: string;
  score: number;
}

interface ChatResponse {
  session_id: string;
  answer: string;
  sources: ChatSource[];
}
```

## Data Models

### State Management

The application uses React Context for global state and custom hooks for data fetching.

#### AppContext
```typescript
interface AppState {
  selectedVaultId: string | null;
  apiBaseUrl: string;
}

interface AppContextValue {
  state: AppState;
  setSelectedVault: (vaultId: string | null) => void;
}
```

#### ToastContext
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}
```

### Custom Hooks

#### useVaults
```typescript
function useVaults() {
  return {
    vaults: Vault[];
    loading: boolean;
    error: string | null;
    createVault: (data: VaultCreateRequest) => Promise<Vault>;
    deleteVault: (vaultId: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
}
```

#### useIngest
```typescript
function useIngest() {
  return {
    ingest: (data: IngestRequest) => Promise<IngestResponse>;
    pollStatus: (taskId: string, onProgress: (status: IngestStatus) => void) => void;
    stopPolling: () => void;
  };
}
```

#### useChat
```typescript
function useChat(sessionId: string) {
  return {
    messages: ChatMessage[];
    loading: boolean;
    sendMessage: (request: ChatRequest) => Promise<void>;
    clearHistory: () => void;
  };
}
```

## Cor
rectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Request Construction

*For any* API operation (vault creation, agent creation, document ingestion, chat message), when the user triggers the operation through the UI, the Frontend should construct and send an HTTP request with the correct method, endpoint, headers, and payload structure matching the API specification.

**Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.2**

### Property 2: API Response Rendering

*For any* API response containing data objects (Vault, Agent, Document, ChatResponse), when the Frontend receives the response, all fields specified in the response schema should be extracted and displayed in the UI.

**Validates: Requirements 1.2, 3.2, 4.2, 4.3**

### Property 3: List Fetching and Display

*For any* resource type (vaults, agents, documents), when the user requests a list with optional filters, the Frontend should send a GET request with the correct query parameters and display all returned items.

**Validates: Requirements 1.3, 2.6, 3.3**

### Property 4: Deletion Confirmation Flow

*For any* deletable resource (vault, agent, document), when the user initiates deletion, the Frontend should display a confirmation dialog before sending the DELETE request to the API.

**Validates: Requirements 1.4, 3.4, 5.1**

### Property 5: Deletion Success Handling

*For any* successful deletion operation, the Frontend should remove the deleted item from the UI and display a success notification.

**Validates: Requirements 1.5, 5.3**

### Property 6: Ingestion Polling Mechanism

*For any* document ingestion operation, when the Backend returns a task_id, the Frontend should begin polling the status endpoint at 2-second intervals until the status becomes "done" or "failed".

**Validates: Requirements 2.2**

### Property 7: Progress Display

*For any* ingestion status response with progress value between 0 and 100, the Frontend should update the progress bar to reflect that percentage.

**Validates: Requirements 2.3**

### Property 8: Ingestion Completion Handling

*For any* ingestion task, when the status becomes "done", the Frontend should display a success notification and refresh the document list.

**Validates: Requirements 2.4**

### Property 9: Vault Filtering

*For any* selected vault on the dashboard, the Frontend should filter the displayed agents and documents to show only those associated with that vault_id.

**Validates: Requirements 6.5**

### Property 10: cURL Generation

*For any* agent or endpoint, when the user requests a cURL command, the Frontend should generate a properly formatted cURL string with the correct HTTP method, headers, endpoint URL, and payload containing the actual resource IDs (vault_id, agent_id).

**Validates: Requirements 3.5, 7.1, 7.2, 7.4, 7.5**

### Property 11: Clipboard Copy with Notification

*For any* copyable content (cURL command), when the user clicks the copy button, the Frontend should copy the text to the system clipboard and display a toast notification.

**Validates: Requirements 7.3**

### Property 12: Session ID Uniqueness

*For any* new chat session, the Frontend should generate a unique session_id that differs from all previously generated session IDs in the current application instance.

**Validates: Requirements 4.4**

### Property 13: Chat Configuration Inclusion

*For any* chat request where configuration is specified, the Frontend should include the config object with top_k and temperature parameters in the ChatRequest payload.

**Validates: Requirements 4.5**

### Property 14: Error Notification Queuing

*For any* sequence of multiple API errors occurring in rapid succession, the Frontend should queue the error notifications rather than displaying them all simultaneously.

**Validates: Requirements 8.4**

### Property 15: Accessibility Attributes

*For any* interactive UI element (toast, progress bar, button, link, form input), the Frontend should include appropriate ARIA attributes (role, aria-live, aria-label, for/id associations) according to WCAG guidelines.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 16: Modal Focus Management

*For any* modal dialog, when opened, the Frontend should trap keyboard focus within the modal, and when closed, should restore focus to the element that triggered the modal.

**Validates: Requirements 9.5**

### Property 17: API Response Caching

*For any* API request that is repeated within a short time window (e.g., fetching the same vault list twice within 30 seconds), the Frontend should return the cached response for the second request without making a new API call.

**Validates: Requirements 10.4**

### Property 18: Theme Token Usage

*For any* styled component, the component should reference color, font, and spacing values from the centralized theme.ts file rather than using hardcoded values.

**Validates: Requirements 11.1, 11.3, 11.4, 11.5**

## Error Handling

### API Error Handling Strategy

The application implements a centralized error handling mechanism in the API client:

```typescript
// src/api/client.ts
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: APIError = {
      status: response.status,
      message: await extractErrorMessage(response),
    };
    
    if (response.status >= 500) {
      // Server errors - show generic message, log details
      console.error('Server error:', error);
      throw new Error('Server error occurred. Please try again later.');
    } else if (response.status >= 400) {
      // Client errors - show specific message from API
      throw new Error(error.message);
    }
  }
  
  return response.json();
}
```

### Error Display

Errors are displayed through the Toast notification system:

- **Network errors**: "Unable to connect to server. Please check your connection."
- **4xx errors**: Display the error message from the API response
- **5xx errors**: "Server error occurred. Please try again later."
- **Ingestion errors**: Display the error field from IngestStatusResponse

### Error Recovery

- Failed API requests do not automatically retry (user must manually retry)
- Polling stops immediately on ingestion failure
- Form submissions are re-enabled after errors so users can retry
- Error toasts auto-dismiss after 5 seconds (configurable)

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Coverage Areas**:
- Component rendering with various props
- Custom hooks (useVaults, useAgents, useChat, useIngest)
- Utility functions (validators, formatters, cURL generator)
- API client request construction
- Error handling logic

**Example Unit Tests**:
```typescript
// tests/unit/components/VaultSelector.test.tsx
describe('VaultSelector', () => {
  it('renders all vaults in dropdown', () => {
    const vaults = generateRandomVaults(5);
    render(<VaultSelector vaults={vaults} onSelect={vi.fn()} />);
    vaults.forEach(vault => {
      expect(screen.getByText(vault.name)).toBeInTheDocument();
    });
  });
});

// tests/unit/hooks/useIngest.test.ts
describe('useIngest', () => {
  it('polls status endpoint every 2 seconds', async () => {
    const { result } = renderHook(() => useIngest());
    const taskId = 'test-task-123';
    
    result.current.pollStatus(taskId, vi.fn());
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/ingest/status/${taskId}`);
    }, { timeout: 2100 });
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Property Test Examples**:

```typescript
// tests/property/apiClient.test.ts
import fc from 'fast-check';

/**
 * Feature: llamaindex-rag-frontend, Property 1: API Request Construction
 */
describe('Property 1: API Request Construction', () => {
  it('constructs valid API requests for all operations', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          description: fc.string(),
        }),
        async (vaultData) => {
          const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
          global.fetch = mockFetch;
          
          await createVault(vaultData);
          
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/vaults'),
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
              body: JSON.stringify(vaultData),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: llamaindex-rag-frontend, Property 12: Session ID Uniqueness
 */
describe('Property 12: Session ID Uniqueness', () => {
  it('generates unique session IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (count) => {
          const sessionIds = new Set();
          for (let i = 0; i < count; i++) {
            sessionIds.add(generateSessionId());
          }
          expect(sessionIds.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: llamaindex-rag-frontend, Property 18: Theme Token Usage
 */
describe('Property 18: Theme Token Usage', () => {
  it('all components reference theme tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Button', 'Modal', 'VaultCard', 'ChatBubble'),
        (componentName) => {
          const componentFile = readComponentFile(componentName);
          const hasHardcodedColors = /color:\s*['"]#[0-9a-f]{3,6}['"]/i.test(componentFile);
          expect(hasHardcodedColors).toBe(false);
          expect(componentFile).toContain('theme.');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### End-to-End Testing

**Framework**: Playwright

**Critical User Flows**:

1. **Vault Creation Flow**
   - Navigate to Vault Management
   - Fill vault creation form
   - Submit and verify vault appears in list

2. **Document Ingestion with Progress Tracking**
   - Select a vault
   - Upload a document
   - Verify progress bar appears and updates
   - Verify success notification and document appears in list

3. **Agent Creation and Chat**
   - Create a new agent with system prompt
   - Navigate to chat console
   - Send a message to the agent
   - Verify response appears with sources

4. **cURL Copy**
   - View an agent
   - Click "Copy cURL" button
   - Verify toast notification appears
   - Verify clipboard contains valid cURL command

**Example E2E Test**:
```typescript
// tests/e2e/documentIngestion.spec.ts
test('document ingestion with progress tracking', async ({ page }) => {
  await page.goto('/documents');
  
  // Select vault
  await page.selectOption('[data-testid="vault-selector"]', 'test-vault-id');
  
  // Upload file
  await page.setInputFiles('[data-testid="file-input"]', 'test-document.txt');
  await page.fill('[data-testid="title-input"]', 'Test Document');
  await page.click('[data-testid="submit-button"]');
  
  // Verify progress bar appears
  await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  
  // Wait for completion
  await expect(page.locator('[data-testid="success-toast"]')).toBeVisible({ timeout: 30000 });
  
  // Verify document in list
  await expect(page.locator('text=Test Document')).toBeVisible();
});
```

### Testing Requirements Summary

- **Unit tests**: Test individual components, hooks, and utilities
- **Property tests**: Verify universal properties hold across all inputs (minimum 100 iterations per property)
- **E2E tests**: Validate complete user workflows
- **Coverage target**: 80% code coverage for unit tests
- **CI Integration**: All tests run on pull requests
- **Test tagging**: Each property-based test must include a comment with format: `Feature: llamaindex-rag-frontend, Property {number}: {property_text}`

## Implementation Notes

### Environment Configuration

The application requires the following environment variables:

```bash
# .env
VITE_API_BASE_URL=https://api.example.com
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chat': ['./src/pages/ChatConsole.tsx'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

### Performance Optimizations

1. **Code Splitting**: Chat page is lazy-loaded
2. **Memoization**: Heavy components use React.memo
3. **Debouncing**: Search inputs debounced by 300ms
4. **Caching**: API responses cached for 30 seconds
5. **Virtual Scrolling**: Document and agent lists use virtual scrolling for large datasets

### Accessibility Considerations

- All interactive elements have keyboard navigation support
- Focus indicators are visible and meet WCAG contrast requirements
- Screen reader announcements for dynamic content updates
- Skip navigation links for keyboard users
- Color contrast ratios meet WCAG AA standards (4.5:1 for normal text)

### Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

### Security Considerations

- API base URL validated on startup
- No sensitive data stored in localStorage (only session IDs)
- XSS prevention through React's built-in escaping
- CORS headers required from backend
- Content Security Policy headers recommended
