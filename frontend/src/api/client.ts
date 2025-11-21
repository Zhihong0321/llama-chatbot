// API Client with centralized error handling and logging

import type { APIError } from './types';

// Get API base URL from environment variables
const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.warn('VITE_API_BASE_URL not set, using default');
    return 'http://localhost:8000';
  }
  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Extract error message from API response
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    // FastAPI typically returns errors in 'detail' field
    if (data.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    if (data.message) {
      return data.message;
    }
    return JSON.stringify(data);
  } catch {
    return response.statusText || 'Unknown error occurred';
  }
}

/**
 * Handle API response and throw appropriate errors
 */
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

// ============================================================================
// Request Logging
// ============================================================================

/**
 * Log API request for debugging
 */
function logRequest(method: string, url: string, body?: any): void {
  if (import.meta.env.DEV) {
    console.log(`[API ${method}]`, url);
    if (body) {
      console.log('[API Request Body]', body);
    }
  }
}

/**
 * Log API response for debugging
 */
function logResponse(method: string, url: string, data: any): void {
  if (import.meta.env.DEV) {
    console.log(`[API ${method} Response]`, url);
    console.log('[API Response Data]', data);
  }
}

/**
 * Log API error for debugging
 */
function logError(method: string, url: string, error: any): void {
  console.error(`[API ${method} Error]`, url);
  console.error('[API Error Details]', error);
}

// ============================================================================
// HTTP Client Methods
// ============================================================================

/**
 * Perform GET request
 */
export async function get<T>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  logRequest('GET', url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse<T>(response);
    logResponse('GET', url.toString(), data);
    return data;
  } catch (error) {
    logError('GET', url.toString(), error);
    throw error;
  }
}

/**
 * Perform POST request
 */
export async function post<T>(path: string, body: any): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  logRequest('POST', url.toString(), body);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await handleResponse<T>(response);
    logResponse('POST', url.toString(), data);
    return data;
  } catch (error) {
    logError('POST', url.toString(), error);
    throw error;
  }
}

/**
 * Perform DELETE request
 */
export async function del<T>(path: string): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  logRequest('DELETE', url.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse<T>(response);
    logResponse('DELETE', url.toString(), data);
    return data;
  } catch (error) {
    logError('DELETE', url.toString(), error);
    throw error;
  }
}

// ============================================================================
// Network Error Handling
// ============================================================================

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch'))
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to server. Please check your connection.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// Export API base URL for use in other modules (e.g., cURL generation)
export { API_BASE_URL };
