// API configuration for connecting to Express backend
const isDevelopment = process.env.NODE_ENV === 'development'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:5000' : 'https://api.fourxclub.in')

export interface ApiOptions extends RequestInit {
    skipAuth?: boolean
}

/**
 * Make an authenticated API request to the Express backend
 */
export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options

    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include', // Send cookies for auth
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'API request failed')
    }

    return data
}

/**
 * Convenience methods for common HTTP methods
 */
export const apiClient = {
    get: <T>(endpoint: string, options?: ApiOptions) =>
        api<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
        api<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
        api<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string, options?: ApiOptions) =>
        api<T>(endpoint, { ...options, method: 'DELETE' }),
}
