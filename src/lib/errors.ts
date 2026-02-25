/**
 * Centralized Error Handling for Careerly
 * 
 * Maps internal errors from Supabase, Groq, and other services to
 * user-friendly error codes. Users should NEVER see service names
 * like "Supabase", "Groq", etc.
 * 
 * Error Code Format: CRL-{CATEGORY}-{NUMBER}
 *   CRL-AUTH-xxx  → Authentication errors
 *   CRL-DB-xxx   → Database/data errors
 *   CRL-AI-xxx   → AI feature errors
 *   CRL-NET-xxx  → Network/connectivity errors
 */

import toast from 'react-hot-toast'

// ─── Error Code Definitions ─────────────────────────────────────────────────

export const ERROR_CODES = {
    // Auth errors
    AUTH_TIMEOUT: { code: 'CRL-AUTH-001', message: 'Sign-in is taking too long. Please try again.' },
    AUTH_FAILED: { code: 'CRL-AUTH-002', message: 'Authentication failed. Please try again.' },
    AUTH_SESSION: { code: 'CRL-AUTH-003', message: 'Session verification failed. Please sign in again.' },
    AUTH_SEND_LINK: { code: 'CRL-AUTH-004', message: 'Could not send login link. Please try again later.' },
    AUTH_PROVIDER: { code: 'CRL-AUTH-005', message: 'Sign-in provider is unavailable. Try another method.' },
    AUTH_CALLBACK: { code: 'CRL-AUTH-006', message: 'Sign-in callback failed. Please try signing in again.' },
    AUTH_LINK_ACCOUNT: { code: 'CRL-AUTH-007', message: 'Could not link account. It may already be linked to another user.' },

    // Database errors
    DB_LOAD: { code: 'CRL-DB-001', message: 'Failed to load data. Please refresh the page.' },
    DB_SAVE: { code: 'CRL-DB-002', message: 'Failed to save. Please try again.' },
    DB_DELETE: { code: 'CRL-DB-003', message: 'Failed to delete. Please try again.' },
    DB_PROFILE: { code: 'CRL-DB-004', message: 'Failed to save profile. Please try again.' },
    DB_SYNC: { code: 'CRL-DB-005', message: 'Sync failed. Please check your connection and try again.' },

    // AI errors
    AI_RATE_LIMIT: { code: 'CRL-AI-001', message: 'AI is currently busy. Using cached data instead.' },
    AI_UNAVAILABLE: { code: 'CRL-AI-002', message: 'AI features are temporarily unavailable. Using fallback data.' },
    AI_GENERATE: { code: 'CRL-AI-003', message: 'Could not generate analysis. Please try again.' },
    AI_PARSE: { code: 'CRL-AI-004', message: 'Received unexpected data. Using fallback data.' },

    // Network errors
    NET_OFFLINE: { code: 'CRL-NET-001', message: 'You appear to be offline. Please check your connection.' },
    NET_TIMEOUT: { code: 'CRL-NET-002', message: 'Request timed out. Please try again.' },
    NET_SERVICE: { code: 'CRL-NET-003', message: 'Service temporarily unavailable. Please try again later.' },

    // Generic
    UNKNOWN: { code: 'CRL-ERR-001', message: 'Something went wrong. Please try again.' },
} as const

type ErrorCodeKey = keyof typeof ERROR_CODES

// ─── Error Classifier ───────────────────────────────────────────────────────

/**
 * Classifies a raw error (from Supabase, Groq, fetch, etc.) into
 * a user-friendly error code.
 */
export function classifyError(error: unknown, context?: string): ErrorCodeKey {
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

    // Network errors
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('net::')) {
        return navigator.onLine ? 'NET_SERVICE' : 'NET_OFFLINE'
    }
    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('aborted')) {
        return 'NET_TIMEOUT'
    }

    // Auth errors
    if (msg.includes('rate limit')) return 'AI_RATE_LIMIT'
    if (msg.includes('missing api key') || msg.includes('missing vite_')) return 'AI_UNAVAILABLE'
    if (msg.includes('auth') || msg.includes('session') || msg.includes('jwt')) {
        if (msg.includes('session')) return 'AUTH_SESSION'
        if (msg.includes('callback')) return 'AUTH_CALLBACK'
        return 'AUTH_FAILED'
    }

    // AI errors (Groq-specific patterns, mapped to generic codes)
    if (msg.includes('groq') || msg.includes('openai') || msg.includes('llama')) return 'AI_GENERATE'
    if (msg.includes('json') && msg.includes('parse')) return 'AI_PARSE'
    if (msg.includes('429') || msg.includes('rate')) return 'AI_RATE_LIMIT'

    // Context-based fallbacks
    if (context) {
        if (context.startsWith('auth')) return 'AUTH_FAILED'
        if (context.startsWith('db') || context.startsWith('data')) return 'DB_LOAD'
        if (context.startsWith('ai')) return 'AI_GENERATE'
    }

    return 'UNKNOWN'
}

// ─── User-facing Error Handler ──────────────────────────────────────────────

interface AppErrorOptions {
    /** The raw error from the service */
    error: unknown
    /** Context hint for classification (e.g. 'auth.login', 'db.save', 'ai.generate') */
    context?: string
    /** Override the error code key instead of auto-classifying */
    errorCode?: ErrorCodeKey
    /** Show toast notification (default: true) */
    showToast?: boolean
}

/**
 * Handles an application error by:
 * 1. Classifying it into a user-friendly error code
 * 2. Logging the real error to console (for debugging)
 * 3. Showing a clean toast to the user with error code
 * 
 * Returns the error code info for optional further handling.
 */
export function handleAppError({ error, context, errorCode, showToast = true }: AppErrorOptions) {
    const key = errorCode ?? classifyError(error, context)
    const errorInfo = ERROR_CODES[key]

    // Log real error for debugging (only visible in dev tools)
    console.error(`[${errorInfo.code}] ${context ?? 'unknown context'}:`, error)

    // Show clean, user-friendly toast
    if (showToast) {
        toast.error(`${errorInfo.message}\n(${errorInfo.code})`, {
            duration: 5000,
            style: {
                maxWidth: '420px',
            },
        })
    }

    return errorInfo
}

/**
 * Returns a user-friendly error message with code for a given error code key.
 * Useful when you want to display the error in UI instead of a toast.
 */
export function getErrorMessage(key: ErrorCodeKey): string {
    const info = ERROR_CODES[key]
    return `${info.message} (${info.code})`
}
