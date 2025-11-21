/**
 * Property-Based Tests for Session ID Generation
 * Feature: llamaindex-rag-frontend, Property 12: Session ID Uniqueness
 * Validates: Requirements 4.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateSessionId } from '../../src/utils/sessionId';

describe('Property 12: Session ID Uniqueness', () => {
  /**
   * Property: For any number of session ID generations, each generated session_id
   * should be unique and differ from all previously generated session IDs
   */
  it('generates unique session IDs across multiple calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 200 }),
        (count) => {
          const sessionIds = new Set<string>();
          
          // Generate multiple session IDs
          for (let i = 0; i < count; i++) {
            const sessionId = generateSessionId();
            
            // Verify this ID hasn't been generated before
            expect(sessionIds.has(sessionId)).toBe(false);
            
            sessionIds.add(sessionId);
          }
          
          // Verify all IDs are unique
          expect(sessionIds.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any generated session ID, it should follow a consistent format
   * and be a non-empty string
   */
  it('generates session IDs with consistent format', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const sessionId = generateSessionId();
          
          // Should be a non-empty string
          expect(typeof sessionId).toBe('string');
          expect(sessionId.length).toBeGreaterThan(0);
          
          // Should start with 'session_' prefix
          expect(sessionId).toMatch(/^session_/);
          
          // Should contain alphanumeric characters
          expect(sessionId).toMatch(/^session_[a-z0-9_]+$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Session IDs generated in rapid succession should still be unique
   * (tests collision resistance under high-frequency generation)
   */
  it('generates unique session IDs even in rapid succession', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 50, max: 100 }),
        async (count) => {
          const sessionIds = new Set<string>();
          
          // Generate session IDs as fast as possible
          const promises = Array.from({ length: count }, () => 
            Promise.resolve(generateSessionId())
          );
          
          const results = await Promise.all(promises);
          
          results.forEach(sessionId => {
            sessionIds.add(sessionId);
          });
          
          // All should be unique despite rapid generation
          expect(sessionIds.size).toBe(count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Session IDs should be different across different test runs
   * (tests that randomness is properly seeded)
   */
  it('generates different session IDs across test runs', () => {
    const firstBatch = new Set<string>();
    const secondBatch = new Set<string>();
    
    // Generate first batch
    for (let i = 0; i < 10; i++) {
      firstBatch.add(generateSessionId());
    }
    
    // Small delay to ensure timestamp changes
    const start = Date.now();
    while (Date.now() - start < 2) {
      // Busy wait for 2ms
    }
    
    // Generate second batch
    for (let i = 0; i < 10; i++) {
      secondBatch.add(generateSessionId());
    }
    
    // Batches should have no overlap
    const intersection = new Set(
      [...firstBatch].filter(id => secondBatch.has(id))
    );
    
    expect(intersection.size).toBe(0);
  });
});
