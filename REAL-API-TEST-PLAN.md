# Real API Test Plan - LlamaIndex RAG Frontend

## Overview

This document provides a comprehensive manual test plan for validating the frontend application against the **REAL PRODUCTION LlamaIndex API Server**. These tests verify end-to-end functionality including connection, vault management, agent management, document ingestion, and chat interactions.

## Prerequisites

### Environment Setup

1. **Production API Server URL**: `https://eternalgy-rag-llamaindex-production.up.railway.app`
2. **Environment Configuration**: Set `VITE_API_BASE_URL` in `frontend/.env`:
   ```bash
   VITE_API_BASE_URL=https://eternalgy-rag-llamaindex-production.up.railway.app
   ```
3. **Frontend Running**: Start the frontend application:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. **Browser DevTools**: Open browser developer tools (F12) to monitor network requests

### Test Data Preparation

- Prepare a test document (text file or PDF) for ingestion testing
- Have sample text content ready for document upload
- Prepare test vault names and descriptions
- Prepare test agent names and system prompts

---

## Test Suite 1: API Connection & Health Check

### Test 1.1: Verify API Server Connectivity

**Objective**: Confirm the frontend can reach the production API server

**Steps**:
1. Open browser DevTools → Network tab
2. Navigate to the application homepage
3. Check for any API calls in the Network tab
4. Verify the base URL matches your production server

**Expected Results**:
- ✅ Network requests show correct production API URL
- ✅ No CORS errors in console
- ✅ No connection timeout errors

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 1.2: API Error Handling

**Objective**: Verify graceful handling of API errors

**Steps**:
1. Temporarily set wrong API URL in `.env` file
2. Restart the frontend
3. Try to load vault list or any API-dependent page
4. Observe error messages

**Expected Results**:
- ✅ User-friendly error message displayed
- ✅ No application crash
- ✅ Error logged in console with details

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 2: Vault Management

### Test 2.1: List All Vaults

**Objective**: Verify GET /vaults endpoint integration

**Steps**:
1. Navigate to Dashboard or Vaults page
2. Open DevTools → Network tab
3. Observe the API call to `/vaults`
4. Check the response data

**Expected Results**:
- ✅ GET request sent to `/vaults`
- ✅ Response status: 200 OK
- ✅ Response contains array of vault objects
- ✅ Each vault has: `id`, `name`, `description`, `created_at`
- ✅ Vaults displayed correctly in UI

**Pass/Fail**: ___________

**API Response Sample**:
```json
[
  {
    "id": "uuid-here",
    "name": "Vault Name",
    "description": "Description",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Test 2.2: Create New Vault

**Objective**: Verify POST /vaults endpoint integration

**Steps**:
1. Click "Create Vault" or "New Vault" button
2. Fill in the form:
   - Name: "Test Vault [Timestamp]"
   - Description: "Test vault for API validation"
3. Open DevTools → Network tab
4. Submit the form
5. Observe the POST request to `/vaults`
6. Check the response

**Expected Results**:
- ✅ POST request sent to `/vaults`
- ✅ Request body contains: `{"name": "...", "description": "..."}`
- ✅ Response status: 200 or 201
- ✅ Response contains vault object with generated `id`
- ✅ New vault appears in vault list immediately
- ✅ Success notification displayed

**Pass/Fail**: ___________

**Vault ID Created**: ___________________________________________

**Notes**: ___________________________________________

---

### Test 2.3: Delete Vault

**Objective**: Verify DELETE /vaults/{vault_id} endpoint integration

**Steps**:
1. Select a test vault from the list
2. Click "Delete" button
3. Confirm deletion in the dialog
4. Open DevTools → Network tab
5. Observe the DELETE request

**Expected Results**:
- ✅ Confirmation dialog appears before deletion
- ✅ DELETE request sent to `/vaults/{vault_id}`
- ✅ Response status: 200 OK
- ✅ Response contains: `{"success": true, "message": "..."}`
- ✅ Vault removed from UI immediately
- ✅ Success notification displayed

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 3: Document Ingestion & Management

### Test 3.1: Upload Document to Vault

**Objective**: Verify POST /ingest endpoint integration

**Steps**:
1. Navigate to Document Upload page
2. Select a vault from dropdown
3. Fill in document details:
   - Title: "Test Document [Timestamp]"
   - Source: "Manual Test"
   - Text: "This is test content for API validation. It contains sample text to verify document ingestion."
4. Open DevTools → Network tab
5. Click "Upload" or "Ingest" button
6. Observe the POST request to `/ingest`

**Expected Results**:
- ✅ POST request sent to `/ingest`
- ✅ Request body contains: `text`, `title`, `source`, `vault_id`
- ✅ Response status: 200 OK
- ✅ Response contains: `{"document_id": "...", "task_id": "..."}`
- ✅ Progress bar appears immediately

**Pass/Fail**: ___________

**Task ID**: ___________________________________________

**Document ID**: ___________________________________________

---

### Test 3.2: Monitor Ingestion Progress

**Objective**: Verify GET /ingest/status/{task_id} polling

**Steps**:
1. After starting document upload (Test 3.1)
2. Keep DevTools → Network tab open
3. Observe polling requests to `/ingest/status/{task_id}`
4. Watch progress bar update

**Expected Results**:
- ✅ GET requests sent to `/ingest/status/{task_id}` every ~2 seconds
- ✅ Response contains: `{"task_id": "...", "status": "...", "progress": 0-100}`
- ✅ Status progresses: `queued` → `processing` → `done`
- ✅ Progress bar updates from 0% to 100%
- ✅ Polling stops when status is `done`
- ✅ Success notification displayed when complete

**Pass/Fail**: ___________

**Final Status**: ___________________________________________

**Notes**: ___________________________________________

---

### Test 3.3: Handle Ingestion Failure

**Objective**: Verify error handling during ingestion

**Steps**:
1. Try to upload invalid content (if possible):
   - Empty text
   - Invalid vault_id
   - Malformed data
2. Observe error response
3. Check UI error display

**Expected Results**:
- ✅ Error status returned from API
- ✅ Polling stops on error
- ✅ Error message displayed to user
- ✅ Progress bar shows error state

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 3.4: List Documents in Vault

**Objective**: Verify GET /documents endpoint integration

**Steps**:
1. Navigate to Documents page
2. Select a vault (optional filter)
3. Open DevTools → Network tab
4. Observe GET request to `/documents`

**Expected Results**:
- ✅ GET request sent to `/documents`
- ✅ Query parameter `vault_id` included if vault selected
- ✅ Response status: 200 OK
- ✅ Response contains array of document objects
- ✅ Each document has: `document_id`, `title`, `source`, `vault_id`, `created_at`
- ✅ Documents displayed in table/list

**Pass/Fail**: ___________

**Document Count**: ___________________________________________

---

### Test 3.5: Delete Document

**Objective**: Verify DELETE /documents/{document_id} endpoint integration

**Steps**:
1. Select a test document from the list
2. Click "Delete" button
3. Confirm deletion
4. Open DevTools → Network tab
5. Observe DELETE request

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ DELETE request sent to `/documents/{document_id}`
- ✅ Response status: 200 OK
- ✅ Response contains: `{"success": true, "message": "..."}`
- ✅ Document removed from UI
- ✅ Success notification displayed

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 4: Agent Management

### Test 4.1: List All Agents

**Objective**: Verify GET /agents endpoint integration

**Steps**:
1. Navigate to Agents page or Dashboard
2. Open DevTools → Network tab
3. Observe GET request to `/agents`
4. Check response data

**Expected Results**:
- ✅ GET request sent to `/agents`
- ✅ Optional query parameter `vault_id` if filtered
- ✅ Response status: 200 OK
- ✅ Response contains array of agent objects
- ✅ Each agent has: `agent_id`, `name`, `vault_id`, `system_prompt`, `created_at`
- ✅ Agents displayed in UI with vault association

**Pass/Fail**: ___________

**Agent Count**: ___________________________________________

---

### Test 4.2: Create New Agent

**Objective**: Verify POST /agents endpoint integration

**Steps**:
1. Click "Create Agent" or "New Agent" button
2. Fill in the form:
   - Name: "Test Agent [Timestamp]"
   - Vault: Select a vault from dropdown
   - System Prompt: "You are a helpful assistant specialized in testing."
3. Open DevTools → Network tab
4. Submit the form
5. Observe POST request to `/agents`

**Expected Results**:
- ✅ POST request sent to `/agents`
- ✅ Request body contains: `{"name": "...", "vault_id": "...", "system_prompt": "..."}`
- ✅ Response status: 200 or 201
- ✅ Response contains agent object with generated `agent_id`
- ✅ New agent appears in agent list
- ✅ Success notification displayed

**Pass/Fail**: ___________

**Agent ID Created**: ___________________________________________

**Notes**: ___________________________________________

---

### Test 4.3: Generate cURL Command for Agent

**Objective**: Verify cURL generation functionality

**Steps**:
1. Select an agent from the list
2. Click "Copy cURL" or "Get cURL" button
3. Paste the copied command into a text editor
4. Verify the command structure

**Expected Results**:
- ✅ cURL command copied to clipboard
- ✅ Toast notification confirms copy
- ✅ Command includes: `curl -X POST`
- ✅ Command includes correct API URL
- ✅ Command includes `Content-Type: application/json` header
- ✅ Command includes JSON body with `agent_id`, `session_id`, `message`
- ✅ Command is properly formatted with line breaks

**Pass/Fail**: ___________

**Sample cURL**:
```bash
curl -X POST https://api.example.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "...",
    "message": "Hello",
    "agent_id": "..."
  }'
```

---

### Test 4.4: Delete Agent

**Objective**: Verify DELETE /agents/{agent_id} endpoint integration

**Steps**:
1. Select a test agent from the list
2. Click "Delete" button
3. Confirm deletion
4. Open DevTools → Network tab
5. Observe DELETE request

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ DELETE request sent to `/agents/{agent_id}`
- ✅ Response status: 200 OK
- ✅ Response contains: `{"success": true, "message": "..."}`
- ✅ Agent removed from UI
- ✅ Success notification displayed

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 5: Chat Functionality

### Test 5.1: Chat with Vault (No Agent)

**Objective**: Verify POST /chat endpoint with vault_id

**Steps**:
1. Navigate to Chat page
2. Select a vault (no agent)
3. Type a message: "What documents are in this vault?"
4. Open DevTools → Network tab
5. Send the message
6. Observe POST request to `/chat`

**Expected Results**:
- ✅ POST request sent to `/chat`
- ✅ Request body contains: `{"session_id": "...", "message": "...", "vault_id": "..."}`
- ✅ `session_id` is a valid UUID
- ✅ Response status: 200 OK
- ✅ Response contains: `{"session_id": "...", "answer": "...", "sources": [...]}`
- ✅ Answer displayed in chat window
- ✅ Sources displayed if present

**Pass/Fail**: ___________

**Session ID**: ___________________________________________

**Response Time**: ___________________________________________

---

### Test 5.2: Chat with Agent

**Objective**: Verify POST /chat endpoint with agent_id

**Steps**:
1. Navigate to Chat page
2. Select an agent from dropdown
3. Type a message: "Hello, can you help me?"
4. Open DevTools → Network tab
5. Send the message
6. Observe POST request to `/chat`

**Expected Results**:
- ✅ POST request sent to `/chat`
- ✅ Request body contains: `{"session_id": "...", "message": "...", "agent_id": "..."}`
- ✅ Response status: 200 OK
- ✅ Response contains answer and sources
- ✅ Answer reflects agent's system prompt behavior
- ✅ Message displayed in chat window

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 5.3: Chat with Configuration Parameters

**Objective**: Verify POST /chat with config object

**Steps**:
1. Navigate to Chat page
2. Open chat configuration settings (if available)
3. Set parameters:
   - top_k: 5
   - temperature: 0.7
4. Send a message
5. Open DevTools → Network tab
6. Check request body

**Expected Results**:
- ✅ Request body includes: `{"config": {"top_k": 5, "temperature": 0.7}}`
- ✅ Response reflects configuration (more/fewer sources based on top_k)

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 5.4: Display Chat Sources

**Objective**: Verify source rendering in chat response

**Steps**:
1. Send a message that should return sources
2. Wait for response
3. Check if sources are displayed

**Expected Results**:
- ✅ Sources array present in response
- ✅ Each source displays: `document_id`, `title`, `snippet`, `score`
- ✅ Sources rendered as cards or list items
- ✅ Relevance score displayed (0.0 to 1.0)

**Pass/Fail**: ___________

**Source Count**: ___________________________________________

---

### Test 5.5: Session Persistence

**Objective**: Verify session_id maintains conversation context

**Steps**:
1. Start a new chat session
2. Note the session_id from DevTools
3. Send first message: "My name is Alice"
4. Send second message: "What is my name?"
5. Check if both requests use same session_id

**Expected Results**:
- ✅ Both requests use identical session_id
- ✅ Second response references context from first message
- ✅ Session maintained across multiple messages

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 6: Dashboard Integration

### Test 6.1: Dashboard Component Loading

**Objective**: Verify all dashboard components load correctly

**Steps**:
1. Navigate to Dashboard page
2. Open DevTools → Network tab
3. Observe all API calls
4. Check component rendering

**Expected Results**:
- ✅ GET /vaults called
- ✅ GET /agents called
- ✅ GET /documents called (for recent ingests)
- ✅ VaultSelector component displays vaults
- ✅ AgentCardList component displays agents
- ✅ RecentIngests component displays recent documents
- ✅ QuickChatBox component renders

**Pass/Fail**: ___________

**API Calls Made**: ___________________________________________

---

### Test 6.2: Vault Filtering on Dashboard

**Objective**: Verify vault selection filters dashboard data

**Steps**:
1. On Dashboard, select a specific vault
2. Observe filtered data
3. Check if agents and documents are filtered

**Expected Results**:
- ✅ Only agents associated with selected vault displayed
- ✅ Only documents in selected vault displayed
- ✅ Vault selection persists during session

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 7: Error Scenarios

### Test 7.1: Network Timeout

**Objective**: Verify handling of slow/timeout responses

**Steps**:
1. Use browser DevTools → Network tab → Throttling
2. Set to "Slow 3G" or similar
3. Try to load vaults or send chat message
4. Observe behavior

**Expected Results**:
- ✅ Loading indicator displayed
- ✅ Request eventually completes or times out gracefully
- ✅ Error message if timeout occurs
- ✅ No application crash

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 7.2: 404 Not Found

**Objective**: Verify handling of missing resources

**Steps**:
1. Try to access a non-existent vault/agent/document ID
2. Observe error handling

**Expected Results**:
- ✅ 404 error caught
- ✅ User-friendly error message displayed
- ✅ Application remains functional

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

### Test 7.3: 500 Server Error

**Objective**: Verify handling of server errors

**Steps**:
1. Trigger a server error (if possible)
2. Observe error handling

**Expected Results**:
- ✅ Generic server error message displayed
- ✅ Error details logged to console
- ✅ User not exposed to technical details
- ✅ Application remains functional

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Suite 8: End-to-End Workflows

### Test 8.1: Complete Document Ingestion Workflow

**Objective**: Test full flow from vault creation to document ingestion

**Steps**:
1. Create a new vault
2. Navigate to document upload
3. Upload a document to the new vault
4. Monitor ingestion progress
5. Verify document appears in document list
6. Chat with the vault about the document content

**Expected Results**:
- ✅ All steps complete successfully
- ✅ Document content retrievable via chat
- ✅ Sources reference the uploaded document

**Pass/Fail**: ___________

**Time to Complete**: ___________________________________________

---

### Test 8.2: Complete Agent Creation and Chat Workflow

**Objective**: Test full flow from agent creation to chat interaction

**Steps**:
1. Create a new vault
2. Upload a document to the vault
3. Create an agent with custom system prompt
4. Chat with the agent
5. Verify agent behavior matches system prompt

**Expected Results**:
- ✅ All steps complete successfully
- ✅ Agent responds according to system prompt
- ✅ Agent retrieves information from vault documents

**Pass/Fail**: ___________

**Notes**: ___________________________________________

---

## Test Summary

### Overall Results

- **Total Tests**: 30
- **Passed**: ___________
- **Failed**: ___________
- **Blocked**: ___________
- **Pass Rate**: ___________%

### Critical Issues Found

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Recommendations

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Sign-Off

**Tester Name**: ___________________________________________

**Date**: ___________________________________________

**Production API URL**: https://eternalgy-rag-llamaindex-production.up.railway.app

**Frontend Version**: ___________________________________________

**Notes**: ___________________________________________
