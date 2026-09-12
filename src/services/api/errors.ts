export type AppError = {
  code: string;
  message: string;
  statusCode: number;
  fieldErrors?: Record<string, string>;
  retryable: boolean;
};

const ERROR_MESSAGES: Record<string, string> = {
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_OTP: 'Invalid or expired OTP. Please try again.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
  USER_SUSPENDED: 'Your account has been suspended.',
  ADMIN_ACCESS_BLOCKED: 'Admin access is currently blocked.',
  INSUFFICIENT_STOCK: 'Sorry, this product is no longer available in the requested quantity.',
  CART_EMPTY: 'Your cart is empty.',
  NETWORK_ERROR: 'No internet connection. Please check your connection and try again.',
  TIMEOUT: 'The request is taking longer than expected. Please try again.',
};

export function normalizeError(error: unknown, statusCode = 500): AppError {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error as AppError;
  }
  const body = error as { message?: string; errorCode?: string; status?: number };
  const code = body?.errorCode ?? (statusCode === 401 ? 'SESSION_EXPIRED' : 'SERVER_ERROR');
  return {
    code,
    message: ERROR_MESSAGES[code] ?? body?.message ?? 'Something went wrong on our side. Please try again.',
    statusCode: body?.status ?? statusCode,
    retryable: statusCode >= 500 || statusCode === 408,
  };
}

export function getUserMessage(error: AppError): string {
  return ERROR_MESSAGES[error.code] ?? error.message;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'appError' in error) {
    const appError = (error as { appError?: AppError }).appError;
    if (appError?.message) return appError.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
