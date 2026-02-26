import { careerlyApi } from '@/lib/api'

export async function fetchSkillsAndAnalysis(userId: string) {
  const [profiles, existing] = await Promise.all([
    // Fetch Profile for current skills
    careerlyApi.db.profiles.list({
      where: { userId },
      limit: 1
    }),
    // Check for cached analysis
    careerlyApi.db.skills.list({
      where: { userId },
      limit: 1,
    })
  ])

  return { profiles, existing }
}
