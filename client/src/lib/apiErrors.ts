import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export interface StandardApiError {
  status: number | string;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Standardizes RTK Query and network errors into consistent, user-facing error structures.
 * Distinguishes 400, 401, 403, 404, 409, 500 without leaking raw internal stack traces.
 */
export function parseApiError(error: unknown): StandardApiError {
  if (!error) {
    return {
      status: 'UNKNOWN',
      message: 'An unknown error occurred.',
    };
  }

  // Handle RTK Query FetchBaseQueryError
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    const status = fetchError.status;

    // Try extracting structured backend response
    if (typeof fetchError.data === 'object' && fetchError.data !== null) {
      const data = fetchError.data as Record<string, unknown>;
      const errorObj = data.error as Record<string, unknown> | undefined;

      const message =
        typeof errorObj?.message === 'string'
          ? errorObj.message
          : typeof data.message === 'string'
          ? data.message
          : getDefaultMessageForStatus(status);

      const code = typeof errorObj?.code === 'string' ? errorObj.code : undefined;
      const details = errorObj?.details;

      return {
        status,
        message,
        code,
        details,
      };
    }

    return {
      status,
      message: getDefaultMessageForStatus(status),
    };
  }

  // Handle RTK Query SerializedError
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const serialized = error as SerializedError;
    return {
      status: serialized.code || 'ERROR',
      message: serialized.message || 'An unexpected client error occurred.',
    };
  }

  return {
    status: 'UNKNOWN',
    message: String(error),
  };
}

function getDefaultMessageForStatus(status: number | string): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your inputs.';
    case 401:
      return 'You must be signed in to perform this action.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may have been modified by another action.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 'FETCH_ERROR':
      return 'Unable to connect to the server. Please check your network connection.';
    case 'PARSING_ERROR':
      return 'Failed to parse server response.';
    case 'TIMEOUT_ERROR':
      return 'The server request timed out. Please try again.';
    default:
      return 'An unexpected error occurred.';
  }
}
