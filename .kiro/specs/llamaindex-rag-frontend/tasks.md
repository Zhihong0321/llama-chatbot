# Implementation Plan

- [x] 1. Set up project structure and development environment





  - Initialize Vite + React + TypeScript project
  - Configure ESLint with airbnb-base and Prettier
  - Set up Vitest for unit testing
  - Set up Playwright for E2E testing
  - Create directory structure (api/, components/, hooks/, pages/, utils/, context/)
  - Configure environment variables (.env.example with VITE_API_BASE_URL)
  - _Requirements: 12.1, 12.2, 12.3_
-

- [x] 2. Create theme system and design tokens




  - Create src/theme.ts with color palette, typography, spacing scale, and glass-morphism values
  - Export theme tokens for colors, fonts, spacing, and effects
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
-

- [x] 3. Implement API client and type definitions




  - Create src/api/types.ts with all TypeScript interfaces (Vault, Agent, Document, Chat types, etc.)
  - Create src/api/client.ts with HTTP wrapper (get, post, delete methods)
  - Implement centralized error handling in API client (network errors, 4xx, 5xx)
  - Add request/response logging for debugging
  - _Requirements: 1.1, 8.1, 8.2, 8.3_

- [x] 3.1 Write property test for API request construction







  - **Property 1: API Request Construction**
  - **Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.2**

- [x] 4. Implement Toast notification system




  - Create src/context/ToastContext.tsx with toast state management
  - Create src/components/common/Toast component with role="alert"
  - Implement toast queuing mechanism to avoid overwhelming users
  - Add auto-dismiss functionality (5 second default)
  - _Requirements: 7.3, 8.4, 9.1_

- [x] 4.1 Write property test for error notification queuing


  - **Property 14: Error Notification Queuing**
  - **Validates: Requirements 8.4**
- [x] 5. Create common UI components









- [ ] 5. Create common UI components

  - Create Button component with theme integration and aria-labels
  - Create Modal component with focus trap and aria attributes
  - Create ProgressBar component with aria-live="polite"
  - Apply CSS Modules for scoped styling
  - _Requirements: 9.2, 9.3, 9.5_

- [x] 5.1 Write property test for modal focus management







  - **Property 16: Modal Focus Management**
  - **Validates: Requirements 9.5**
-


- [x] 5.2 Write property test for accessibility attributes





  - **Property 15: Accessibility Attributes**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 6. Implement Vault API integration




  - Create src/api/vaults.ts with createVault, getVaults, getVault, deleteVault functions
  - Create src/hooks/useVaults.ts custom hook for vault operations
  - Implement API response caching (30 second TTL)
  - _Requirements: 1.1, 1.3, 1.4, 10.4_

- [x] 6.1 Write property test for list fetching and display







  - **Property 3: List Fetching and Display**
  - **Validates: Requirements 1.3, 2.6, 3.3**

- [x] 6.2 Write property test for API response caching


  - **Property 17: API Response Caching**
  - **Validates: Requirements 10.4**

- [-] 7. Create Vault management components






  - Create VaultList component to display all vaults
  - Create VaultSelector dropdown component with glass-morphism styling
  - Create VaultFormModal for creating/editing vaults
  - Create VaultDeleteConfirm confirmation dialog
  - _Requirements: 1.2, 1.4, 1.5, 6.1_

- [x] 7.1 Write property test for API response rendering




  - **Property 2: API Response Rendering**
  - **Validates: Requirements 1.2, 3.2, 4.2, 4.3**

- [x] 7.2 Write property test for deletion confirmation flow


  - **Property 4: Deletion Confirmation Flow**
  - **Validates: Requirements 1.4, 3.4, 5.1**

- [ ] 7.3 Write property test for deletion success handling
  - **Property 5: Deletion Success Handling**
  - **Validates: Requirements 1.5, 5.3**
-


- [x] 8. Implement Document API integration





  - Create src/api/documents.ts with getDocuments, deleteDocument functions
  - Create src/api/ingest.ts with ingestDocument and getIngestStatus functions
  - Create src/hooks/useDocuments.ts for document operations
  - Create src/hooks/useIngest.ts with

 polling mechanism (2 second interval)
  - _Requirements: 2.1, 2.2, 2.6, 5.2_



- [x] 8.1 Write property test for ingestion polling mechanism




  - **Property 6: Ingestion Polling Mechanism**
  - **Validates: Requirements 2.2**
-

- [x] 9. Create Document upload components





  - Create DocumentTable component to display documents with vault filtering
  - Create DocumentUploadForm with file picker, metadata fields, and vault selector
  - Create IngestProgressBar component that polls status and displays progress
  - Implement file validation (accept .pdf, .docx, .txt, .md)
  - Handle ingestion completion (success notification, refresh document list)
  - Handle ingestion errors (display error, stop polling)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 5.3_

- [x] 9.1 Write property test for progress display


  - **Property 7: Progress Display**
  - **Validates: Requirements 2.3**

- [x] 9.2 Write property test for ingestion completion handling


  - **Property 8: Ingestion Completion Handling**
  - **Validates: Requirements 2.4**
-

- [x] 10. Implement Agent API integration








  - Create src/api/agents.ts with createAgent, getAgents, getAgent, deleteAgent functions
  - Create src/hooks/useAgents.ts custom hook for agent operations
  - _Requirements: 3.1, 3.3, 3.4_
-

- [x] 11. Create Agent management components




  - Create AgentList component to display all agents with vault filtering
  - Create AgentCard component showing agent details
  - Create AgentFormModal for creating/editing agents (name, vault selector, system prompt textarea)
  - Create AgentDeleteConfirm confirmation dialog
  - Create AgentCURLSnippet component with copy functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11.1 Write property test for cURL generation







  - **Property 10: cURL Generation**
  - **Validates: Requirements 3.5, 7.1, 7.2, 7.4, 7.5**

- [x] 11.2 Write property test for clipboard copy with notification



  - **Property 11: Clipboard Copy with Notification**
  - **Validates: Requirements 7.3**

- [x] 12. Implement Chat API integration






  - Create src/api/chat.ts with sendChatMessage function
  - Create src/hooks/useChat.ts with message history and sendMessage functionality
  - Create src/utils/sessionId.ts for generating unique session IDs
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 12.1 Write property test for session ID uniqueness


  - **Property 12: Session ID Uniqueness**
  - **Validates: Requirements 4.4**

- [x] 12.2 Write property test for chat configuration inclusion



  - **Property 13: Chat Configuration Inclusion**
  - **Validates: Requirements 4.5**
-

- [ ] 13. Create Chat interface components



  - Create ChatWindow component with message history display
  - Create ChatMessageBubble component for rendering messages
  - Create ChatInput component with send button
  - Create ChatSourceList component to display source cards with document info
  - Implement auto-scroll to latest message
  - Add loading indicator during API calls
  - Support both agent_id and vault_id in chat requests
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
-

- [x] 14. Create Dashboard page




  - Create src/pages/Dashboard.tsx with layout
  - Integrate VaultSelector component
  - Create AgentCardList component showing all agents
  - Create RecentIngests component showing latest ingestion jobs
  - Create QuickChatBox component for immediate chat access
  - Implement vault filtering for agents and documents
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 14.1 Write property test for vault filtering


  - **Property 9: Vault Filtering**
  - **Validates: Requirements 6.5**

- [x] 15. Create remaining pages and routing





  - Create src/pages/VaultManagement.tsx
  - Create src/pages/DocumentUpload.tsx
  - Create src/pages/AgentManagement.tsx
  - Create src/pages/ChatConsole.tsx with lazy loading
  - Set up React Router with routes for all pages
  - Add navigation menu/sidebar
  - _Requirements: 10.2_

- [x] 16. Implement cURL generation utility





  - Create src/utils/curlGenerator.ts with functions for each endpoint type
  - Support vault creation, document ingestion, agent creation, and chat cURL commands
  - Include proper formatting with line breaks and indentation
  - Substitute actual IDs (vault_id, agent_id) from resources
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 17. Add performance optimizations
  - Apply React.memo to heavy components (ChatWindow, DocumentTable, AgentList)
  - Implement code splitting for Chat page
  - Add debouncing to search inputs (300ms)
  - Verify bundle size is under 2MB gzipped
  - Add loading indicator that appears within 100ms
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 17.1 Write property test for theme token usage
  - **Property 18: Theme Token Usage**
  - **Validates: Requirements 11.1, 11.3, 11.4, 11.5**
-

- [x] 18. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Write E2E tests for critical user flows
  - Write E2E test for vault creation flow
  - Write E2E test for document ingestion with progress tracking
  - Write E2E test for agent creation and chat
  - Write E2E test for cURL copy functionality
  - _Requirements: 12.5_

- [ ] 20. Create documentation and build configuration
  - Create README.md with installation, development, and build instructions
  - Document environment variables
  - Add npm scripts (dev, build, test, lint)
  - Configure build output optimization
  - Add accessibility documentation
  - Document browser support
  - _Requirements: 12.3_
