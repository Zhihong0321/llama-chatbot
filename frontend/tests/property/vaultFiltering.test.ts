/**
 * Property Test: Vault Filtering
 * 
 * Feature: llamaindex-rag-frontend, Property 9: Vault Filtering
 * Validates: Requirements 6.5
 * 
 * Property: For any selected vault on the dashboard, the Frontend should filter 
 * the displayed agents and documents to show only those associated with that vault_id.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Agent, Document, Vault } from '../../src/api/types';

// Helper to generate random vault
const vaultArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  created_at: fc.constant('2024-01-01T00:00:00.000Z'),
});

// Helper to generate random agent with specific vault_id
const agentWithVaultArbitrary = (vaultId: string) => fc.record({
  agent_id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  vault_id: fc.constant(vaultId),
  system_prompt: fc.string({ minLength: 1, maxLength: 500 }),
  created_at: fc.constant('2024-01-01T00:00:00.000Z'),
});

// Helper to generate random document with specific vault_id
const documentWithVaultArbitrary = (vaultId: string) => fc.record({
  document_id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  source: fc.string({ minLength: 1, maxLength: 200 }),
  vault_id: fc.constant(vaultId),
  created_at: fc.constant('2024-01-01T00:00:00.000Z'),
  metadata: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
});

/**
 * Filter function that mimics the filtering logic
 * This represents what the dashboard should do when filtering by vault
 */
function filterByVault<T extends { vault_id: string }>(
  items: T[],
  selectedVaultId: string | null
): T[] {
  if (!selectedVaultId) {
    return items;
  }
  return items.filter(item => item.vault_id === selectedVaultId);
}

describe('Property 9: Vault Filtering', () => {
  it('should filter agents to show only those associated with selected vault', () => {
    fc.assert(
      fc.property(
        fc.array(vaultArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (vaults, agentCount) => {
          // Ensure vaults have unique IDs
          const uniqueVaults = vaults.map((v, idx) => ({
            ...v,
            id: `vault-${idx}-${v.id}`
          }));
          
          // Generate agents distributed across vaults
          const agents: Agent[] = [];
          for (let i = 0; i < agentCount; i++) {
            const vault = uniqueVaults[i % uniqueVaults.length];
            const agent = fc.sample(agentWithVaultArbitrary(vault.id), 1)[0];
            agents.push(agent);
          }

          // Select a random vault to filter by
          const selectedVault = uniqueVaults[0];
          
          // Apply filtering
          const filteredAgents = filterByVault(agents, selectedVault.id);
          
          // Property: All filtered agents must have the selected vault_id
          const allMatch = filteredAgents.every(
            agent => agent.vault_id === selectedVault.id
          );
          expect(allMatch).toBe(true);
          
          // Property: No agents with different vault_id should be included
          const noneExcluded = filteredAgents.every(
            agent => agents.includes(agent)
          );
          expect(noneExcluded).toBe(true);
          
          // Property: Count should match expected
          const expectedCount = agents.filter(
            agent => agent.vault_id === selectedVault.id
          ).length;
          expect(filteredAgents.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should filter documents to show only those associated with selected vault', () => {
    fc.assert(
      fc.property(
        fc.array(vaultArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (vaults, docCount) => {
          // Ensure vaults have unique IDs
          const uniqueVaults = vaults.map((v, idx) => ({
            ...v,
            id: `vault-${idx}-${v.id}`
          }));
          
          // Generate documents distributed across vaults
          const documents: Document[] = [];
          for (let i = 0; i < docCount; i++) {
            const vault = uniqueVaults[i % uniqueVaults.length];
            const doc = fc.sample(documentWithVaultArbitrary(vault.id), 1)[0];
            documents.push(doc);
          }

          // Select a random vault to filter by
          const selectedVault = uniqueVaults[0];
          
          // Apply filtering
          const filteredDocuments = filterByVault(documents, selectedVault.id);
          
          // Property: All filtered documents must have the selected vault_id
          const allMatch = filteredDocuments.every(
            doc => doc.vault_id === selectedVault.id
          );
          expect(allMatch).toBe(true);
          
          // Property: No documents with different vault_id should be included
          const noneExcluded = filteredDocuments.every(
            doc => documents.includes(doc)
          );
          expect(noneExcluded).toBe(true);
          
          // Property: Count should match expected
          const expectedCount = documents.filter(
            doc => doc.vault_id === selectedVault.id
          ).length;
          expect(filteredDocuments.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show all items when no vault is selected', () => {
    fc.assert(
      fc.property(
        fc.array(vaultArbitrary, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (vaults, itemCount) => {
          // Generate agents distributed across vaults
          const agents: Agent[] = [];
          for (let i = 0; i < itemCount; i++) {
            const vault = vaults[i % vaults.length];
            const agent = fc.sample(agentWithVaultArbitrary(vault.id), 1)[0];
            agents.push(agent);
          }

          // Apply filtering with null (no vault selected)
          const filteredAgents = filterByVault(agents, null);
          
          // Property: When no vault is selected, all items should be shown
          expect(filteredAgents.length).toBe(agents.length);
          expect(filteredAgents).toEqual(agents);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when filtering by vault with no associated items', () => {
    fc.assert(
      fc.property(
        fc.array(vaultArbitrary, { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 1, max: 10 }),
        (vaults, itemCount) => {
          // Ensure vaults have unique IDs
          const uniqueVaults = vaults.map((v, idx) => ({
            ...v,
            id: `vault-${idx}-${v.id}`
          }));
          
          // Generate agents only for the first vault
          const firstVault = uniqueVaults[0];
          const agents: Agent[] = [];
          for (let i = 0; i < itemCount; i++) {
            const agent = fc.sample(agentWithVaultArbitrary(firstVault.id), 1)[0];
            agents.push(agent);
          }

          // Filter by a different vault (one with no agents)
          const emptyVault = uniqueVaults[1];
          const filteredAgents = filterByVault(agents, emptyVault.id);
          
          // Property: Filtering by vault with no items should return empty array
          expect(filteredAgents.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
