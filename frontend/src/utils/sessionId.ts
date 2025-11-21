/**
 * Generates a unique session ID for chat sessions
 * Uses timestamp and random values to ensure uniqueness
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  return `session_${timestamp}_${randomPart}${randomPart2}`;
}
