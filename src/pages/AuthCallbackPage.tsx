import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Spinner } from '@/components/ui/spinner'

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from the URL hash
                const { error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error)
                    navigate('/')
                    return
                }

                // Redirect to home - the auth context will handle the rest
                navigate('/')
            } catch (error) {
                console.error('Unexpected error during auth callback:', error)
                navigate('/')
            }
        }

        handleCallback()
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
