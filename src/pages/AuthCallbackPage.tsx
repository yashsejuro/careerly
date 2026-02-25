import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { handleAppError } from '@/lib/errors'

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        // 1. Handle explicit errors in URL (e.g. ?error=access_denied&error_description=...)
        const params = new URLSearchParams(window.location.search)
        const error = params.get('error')
        const errorDescription = params.get('error_description')
        if (error) {
            console.error('Auth callback error from URL:', error, errorDescription)
            handleAppError({ error: new Error(errorDescription || error), context: 'auth.callback', errorCode: 'AUTH_CALLBACK' })
            navigate('/')
            return
        }

        // 2. Setup listener for successful sign-in
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Successful login
                navigate('/')
            }
        })

        // 3. Check if session already exists (race condition handling)
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Error checking session:', error)
                handleAppError({ error, context: 'auth.session', errorCode: 'AUTH_SESSION' })
                navigate('/')
            } else if (session) {
                navigate('/')
            }
        })

        // 4. Failsafe: If nothing happens for 8 seconds, go home
        const timeout = setTimeout(() => {
            console.warn('Auth callback timed out')
            navigate('/')
        }, 8000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [navigate])

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Spinner className="w-8 h-8 text-primary mx-auto" />
                <p className="text-muted-foreground">Completing secure sign in...</p>
            </div>
        </div>
    )
}
