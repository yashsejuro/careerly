
import { supabase } from './supabaseClient'

export type GitHubRepo = {
    id: number
    name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    updated_at: string
}

export async function getProviderToken(provider: 'github' | 'linkedin_oidc'): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    return session.provider_token ?? null
}

export async function fetchGithubRepos(token: string): Promise<GitHubRepo[]> {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
        }
    })

    if (response.status === 401) {
        throw new Error("Unauthorized")
    }

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
}

export async function fetchLinkedinProfile(token: string) {
    // Note: Standard LinkedIn API access is very limited without specific partner programs.
    // /me endpoint gives basic profile.
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`)
    }

    return response.json()
}
