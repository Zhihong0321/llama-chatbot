# Requirements Document

## Introduction

This document specifies the requirements for a React-based Single Page Application (SPA) frontend that interfaces with a FastAPI backend implementing a RAG (Retrieval-Augmented Generation) system using LlamaIndex. The application enables users to create knowledge bases (Vaults), upload documents, create AI agents with custom system prompts, and interact with those agents through a chat interface.

## Glossary

- **Vault**: A knowledge base container that stores related documents and their vector embeddings
- **Agent**: An AI assistant bound to a specific Vault with a custom system prompt
- **Ingestion**: The process of uploading, parsing, and vectorizing documents into a Vault
- **Task ID**: A unique identifier for tracking asynchronous ingestion operations
- **Session**: A conversation context identified by a session_id for maintaining chat history
- **RAG**: Retrieval-Augmented Generation - a technique combining document retrieval with LLM generation
- **Frontend**: The React-based single page application
- **Backend**: The FastAPI server providing REST endpoints
- **Vector Store**: The database storing document embeddings for semantic search

## Requirements

### Requirement 1

**User Story:** As a user, I want to create and manage Vaults, so that I can organize documents into separate knowledge bases.

#### Acceptance Criteria

1. WHEN a user submits a vault creation form with name and description THEN the Frontend SHALL send a POST request to `/vaults` with VaultCreateRequest payload
2. WHEN the Backend returns a VaultResponse THEN the Frontend SHALL display the new Vault in the vault list with its UUID, name, description, and creation timestamp
3. WHEN a user requests the vault list THEN the Frontend SHALL send a GET request to `/vaults` and display all Vaults
4. WHEN a user selects a vault for deletion THEN the Frontend SHALL display a confirmation dialog before sending DELETE request to `/vaults/{vault_id}`
5. WHEN a vault deletion succeeds THEN the Frontend SHALL remove the Vault from the UI and display a success notification

### Requirement 2

**User Story:** As a user, I want to upload documents to a Vault, so that I can build a knowledge base for AI agents to query.

#### Acceptance Criteria

1. WHEN a user selects a file and submits the upload form THEN the Frontend SHALL send a POST request to `/ingest` with IngestRequest containing text, title, source, vault_id, and optional metadata
2. WHEN the Backend returns an IngestResponse THEN the Frontend SHALL extract the task_id and begin polling `/ingest/status/{task_id}` every 2 seconds
3. WHEN the ingestion status is "processing" THEN the Frontend SHALL display a progress bar showing the progress percentage from 0 to 100
4. WHEN the ingestion status becomes "done" THEN the Frontend SHALL display a success notification and refresh the document list
5. IF the ingestion status becomes "failed" THEN the Frontend SHALL display the error message from the IngestStatusResponse
6. WHEN a user views the document list THEN the Frontend SHALL send a GET request to `/documents` with optional vault_id query parameter

### Requirement 3

**User Story:** As a user, I want to create AI agents with custom system prompts, so that I can have specialized assistants for different use cases.

#### Acceptance Criteria

1. WHEN a user submits an agent creation form THEN the Frontend SHALL send a POST request to `/agents` with AgentCreateRequest containing name, vault_id, and system_prompt
2. WHEN the Backend returns an AgentResponse THEN the Frontend SHALL display the new Agent with its agent_id, name, associated vault, and creation timestamp
3. WHEN a user requests the agent list THEN the Frontend SHALL send a GET request to `/agents` with optional vault_id filter
4. WHEN a user selects an agent for deletion THEN the Frontend SHALL display a confirmation dialog before sending DELETE request to `/agents/{agent_id}`
5. WHEN an agent is displayed THEN the Frontend SHALL provide a button to generate and copy a cURL command for chatting with that agent

### Requirement 4

**User Story:** As a user, I want to chat with AI agents or directly with Vaults, so that I can ask questions and receive answers based on the knowledge base.

#### Acceptance Criteria

1. WHEN a user sends a chat message THEN the Frontend SHALL send a POST request to `/chat` with ChatRequest containing session_id, message, and either vault_id or agent_id
2. WHEN the Backend returns a ChatResponse THEN the Frontend SHALL display the answer in a message bubble within the chat window
3. WHEN a ChatResponse includes sources THEN the Frontend SHALL display source cards showing document_id, title, snippet, and relevance score
4. WHEN a user starts a new chat session THEN the Frontend SHALL generate a unique session_id for maintaining conversation context
5. WHEN chat configuration is needed THEN the Frontend SHALL include config object with top_k and temperature parameters in the ChatRequest

### Requirement 5

**User Story:** As a user, I want to delete documents from Vaults, so that I can remove outdated or incorrect information.

#### Acceptance Criteria

1. WHEN a user selects a document for deletion THEN the Frontend SHALL display a confirmation dialog before proceeding
2. WHEN deletion is confirmed THEN the Frontend SHALL send a DELETE request to `/documents/{document_id}`
3. WHEN the Backend returns a DeleteResponse THEN the Frontend SHALL remove the document from the UI and display a success notification
4. WHEN document deletion fails THEN the Frontend SHALL display an error message to the user

### Requirement 6

**User Story:** As a user, I want to view a dashboard overview, so that I can quickly access my Vaults, Agents, and recent activities.

#### Acceptance Criteria

1. WHEN a user navigates to the dashboard THEN the Frontend SHALL display a VaultSelector component showing all available Vaults
2. WHEN the dashboard loads THEN the Frontend SHALL display an AgentCardList component showing all agents with their associated Vaults
3. WHEN the dashboard loads THEN the Frontend SHALL display a RecentIngests component showing the latest document ingestion jobs
4. WHEN the dashboard loads THEN the Frontend SHALL display a QuickChatBox component for immediate chat access
5. WHEN a user selects a Vault from the dashboard THEN the Frontend SHALL filter displayed agents and documents to that Vault

### Requirement 7

**User Story:** As a user, I want to copy ready-made cURL commands, so that I can integrate the API into scripts or external applications.

#### Acceptance Criteria

1. WHEN a user clicks a "Copy cURL" button for any endpoint THEN the Frontend SHALL generate a properly formatted cURL command with the correct HTTP method, headers, and payload
2. WHEN a cURL command is generated for an agent THEN the Frontend SHALL include the agent_id in the ChatRequest payload
3. WHEN a user copies a cURL command THEN the Frontend SHALL copy the text to the system clipboard and display a toast notification
4. WHEN a cURL command includes dynamic values THEN the Frontend SHALL substitute actual IDs (vault_id, agent_id) from the selected resource
5. WHEN a cURL snippet is displayed THEN the Frontend SHALL format it with proper line breaks and indentation for readability

### Requirement 8

**User Story:** As a developer, I want the application to handle API errors gracefully, so that users receive clear feedback when operations fail.

#### Acceptance Criteria

1. WHEN an API request fails with a network error THEN the Frontend SHALL display a user-friendly error message indicating connection issues
2. WHEN an API request returns a 4xx status code THEN the Frontend SHALL display the error message from the response body
3. WHEN an API request returns a 5xx status code THEN the Frontend SHALL display a generic server error message and log the details
4. WHEN multiple API errors occur THEN the Frontend SHALL queue error notifications to avoid overwhelming the user
5. WHEN an error occurs during ingestion THEN the Frontend SHALL stop polling and display the error from IngestStatusResponse

### Requirement 9

**User Story:** As a user, I want the application to be accessible, so that I can use it with assistive technologies.

#### Acceptance Criteria

1. WHEN a toast notification appears THEN the Frontend SHALL use role="alert" attribute for screen reader announcement
2. WHEN a progress bar updates THEN the Frontend SHALL use aria-live="polite" attribute for non-intrusive updates
3. WHEN interactive elements are rendered THEN the Frontend SHALL ensure all buttons and links have descriptive aria-labels
4. WHEN forms are displayed THEN the Frontend SHALL associate labels with input fields using proper for/id attributes
5. WHEN modal dialogs open THEN the Frontend SHALL trap keyboard focus within the modal and restore focus on close

### Requirement 10

**User Story:** As a user, I want the application to load quickly and perform smoothly, so that I have a responsive experience.

#### Acceptance Criteria

1. WHEN the application bundle is built THEN the Frontend SHALL produce a gzipped bundle smaller than 2 MB
2. WHEN a user navigates to the Chat page THEN the Frontend SHALL lazy-load the Chat component to reduce initial bundle size
3. WHEN heavy components re-render THEN the Frontend SHALL use React.memo to prevent unnecessary re-renders
4. WHEN API responses are received THEN the Frontend SHALL cache responses where appropriate to reduce redundant requests
5. WHEN the application initializes THEN the Frontend SHALL display a loading indicator within 100 milliseconds

### Requirement 11

**User Story:** As a developer, I want a consistent design system, so that the UI maintains visual coherence across all components.

#### Acceptance Criteria

1. WHEN any component needs styling THEN the Frontend SHALL reference tokens from a centralized theme.ts file for colors, fonts, and spacing
2. WHEN components are styled THEN the Frontend SHALL use CSS Modules or styled-components for scoped styling
3. WHEN glass-morphism effects are applied THEN the Frontend SHALL use consistent backdrop-filter and opacity values from the theme
4. WHEN typography is rendered THEN the Frontend SHALL use font families and sizes defined in the theme configuration
5. WHEN spacing is applied THEN the Frontend SHALL use spacing scale values from the theme (e.g., spacing.sm, spacing.md, spacing.lg)

### Requirement 12

**User Story:** As a developer, I want comprehensive testing, so that I can ensure the application works correctly and catch regressions early.

#### Acceptance Criteria

1. WHEN unit tests are written THEN the Frontend SHALL use Vitest or Jest for testing individual components and functions
2. WHEN end-to-end tests are written THEN the Frontend SHALL use Playwright to test complete user flows like document upload and chat
3. WHEN code is committed THEN the Frontend SHALL run ESLint with airbnb-base and prettier configurations
4. WHEN pull requests are created THEN the Frontend SHALL execute npm run lint and npm run test in CI pipeline
5. WHEN critical user flows are tested THEN the Frontend SHALL include E2E tests for vault creation, document ingestion with progress tracking, and agent chat
