import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-md"
            >
                <div className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    404
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
                <p className="text-muted-foreground text-sm">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>
                <div className="pt-4">
                    <Button onClick={() => navigate("/")} className="gap-2">
                        Return Home
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}

export function ErrorBoundaryPage({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: () => void }) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
            <div className="space-y-6 max-w-md">
                <h1 className="text-2xl font-semibold tracking-tight text-destructive">Something went wrong</h1>
                <p className="text-muted-foreground text-sm">
                    An unexpected error occurred. Please try again.
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <div className="p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono">
                        {error.message}
                    </div>
                )}
                <div className="pt-4">
                    <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    )
}
