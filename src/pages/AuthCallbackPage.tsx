import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from the URL hash
                const { error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error)
                    toast.error('Authentication failed. Please try again.')
                    navigate('/')
                    return
                }

                // Redirect to home - the auth context will handle the rest
                navigate('/')
            } catch (error) {
                console.error('Unexpected error during auth callback:', error)
                toast.error('An unexpected error occurred during login.')
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
