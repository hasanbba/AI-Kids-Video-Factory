import axios from 'axios'

export interface ApiErrorPayload {
  message: string
  errors?: Record<string, string[]>
}

export function getApiError(error: unknown): ApiErrorPayload {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data ?? { message: 'The API could not be reached. Check your connection and try again.' }
  }

  return { message: error instanceof Error ? error.message : 'An unexpected error occurred.' }
}

export function getFieldError(error: unknown, field: string): string | undefined {
  return getApiError(error).errors?.[field]?.[0]
}
