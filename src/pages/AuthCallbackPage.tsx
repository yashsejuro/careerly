import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleCallback = async () => {
            // Check if we already have a session, if so, just go home
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                navigate('/')
                return
            }

            // If no session, wait for the hash to be processed or show error
            const { error } = await supabase.auth.getSession()

            if (error) {
                console.error('Auth callback error:', error)
                toast.error('Authentication failed. Please try again.')
                navigate('/')
            }
        }

        // Listen for auth state changes to catch the 'SIGNED_IN' event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/')
            }
        })

        handleCallback()

        return () => {
            subscription.unsubscribe()
        }
    }, [navigate])

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Spinner className="w-8 h-8 text-primary mx-auto" />
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    )
}
