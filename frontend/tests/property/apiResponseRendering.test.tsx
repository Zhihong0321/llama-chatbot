/**
 * Property-Based Tests for API Response Rendering
 * Feature: llamaindex-rag-frontend, Property 2: API Response Rendering
 * Validates: Requirements 1.2, 3.2, 4.2, 4.3
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { VaultList } from '../../src/components/vault/VaultList';
import type { Vault } from '../../src/api/types';

describe('Property 2: API Response Rendering', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property: For any Vault response, when the VaultList component receives
   * the data, all fields specified in the Vault schema (id, name, description,
   * created_at) should be extracted and displayed in the UI
   */
  it('renders all Vault fields from API response', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 })
              .map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (vaults: Vault[]) => {
          const { container, unmount } = render(<VaultList vaults={vaults} />);

          try {
            const renderedText = container.textContent || '';
            
            // Verify each vault's fields are rendered
            vaults.forEach((vault) => {
              // Name should be displayed
              expect(renderedText).toContain(vault.name);

              // Description should be displayed
              expect(renderedText).toContain(vault.description);

              // ID should be displayed (at least partially)
              const idPrefix = vault.id.substring(0, 8);
              expect(renderedText).toContain(idPrefix);

              // Created date should be displayed
              const formattedDate = new Date(vault.created_at).toLocaleDateString();
              expect(renderedText).toContain(formattedDate);
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any single Vault response, all required fields should be
   * present in the rendered output
   */
  it('renders all required fields for each vault', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          created_at: fc.integer({ min: 946684800000, max: 1924905600000 })
            .map(ts => new Date(ts).toISOString()),
        }),
        (vault: Vault) => {
          const { container, unmount } = render(<VaultList vaults={[vault]} />);

          try {
            // All fields must be present in the rendered output
            const renderedText = container.textContent || '';

            // Check name is rendered
            expect(renderedText).toContain(vault.name);

            // Check description is rendered
            expect(renderedText).toContain(vault.description);

            // Check ID is rendered (at least first 8 chars)
            expect(renderedText).toContain(vault.id.substring(0, 8));

            // Check created_at is rendered in some form
            const date = new Date(vault.created_at);
            const dateString = date.toLocaleDateString();
            expect(renderedText).toContain(dateString);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any list of vaults, the number of rendered vault items
   * should equal the number of vaults in the response
   */
  it('renders correct number of vault items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 })
              .map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (vaults: Vault[]) => {
          const { container, unmount } = render(<VaultList vaults={vaults} />);

          try {
            if (vaults.length === 0) {
              // Should show empty state
              const emptyMessages = screen.queryAllByText(/no vaults found/i);
              expect(emptyMessages.length).toBeGreaterThan(0);
            } else {
              // Should render list items
              const listItems = container.querySelectorAll('[role="list"] > li');
              expect(listItems.length).toBe(vaults.length);
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any vault with special characters in fields, all content
   * should be rendered without errors
   */
  it('handles special characters in vault fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
          created_at: fc.integer({ min: 946684800000, max: 1924905600000 })
            .map(ts => new Date(ts).toISOString()),
        }),
        (vault: Vault) => {
          let container: any;
          let unmount: any;

          // Should not throw when rendering
          expect(() => {
            const result = render(<VaultList vaults={[vault]} />);
            container = result.container;
            unmount = result.unmount;
          }).not.toThrow();

          try {
            // Verify content is rendered
            expect(container.textContent).toContain(vault.name);
            expect(container.textContent).toContain(vault.description);
          } finally {
            if (unmount) unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any vault response, the rendered output should maintain
   * the order of vaults as received from the API
   */
  it('maintains vault order from API response', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
            created_at: fc.integer({ min: 946684800000, max: 1924905600000 })
              .map(ts => new Date(ts).toISOString()),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (vaults: Vault[]) => {
          const { container, unmount } = render(<VaultList vaults={vaults} />);

          try {
            // Get all list items in order
            const listItems = container.querySelectorAll('[role="list"] > li');
            
            // Verify the number of items matches
            expect(listItems.length).toBe(vaults.length);
            
            // Verify each item contains the correct vault data in order
            listItems.forEach((item, index) => {
              const itemText = item.textContent || '';
              expect(itemText).toContain(vaults[index].name);
              expect(itemText).toContain(vaults[index].description);
              expect(itemText).toContain(vaults[index].id.substring(0, 8));
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
