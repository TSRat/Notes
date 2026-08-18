import { Award, LockKeyhole } from 'lucide-react'
import { achievementDefinitions } from '../data/world/worldData'

export function AchievementReveal({ unlockedIds, showLocked = false }: { unlockedIds: string[]; showLocked?: boolean }) {
  const achievements = showLocked
    ? achievementDefinitions
    : achievementDefinitions.filter((achievement) => unlockedIds.includes(achievement.id))
  if (achievements.length === 0) return <p className="empty-copy">生涯印记不会提供属性加成，但会记住你如何走到这里。</p>
  return (
    <div className="achievement-grid">
      {achievements.map((achievement) => {
        const unlocked = unlockedIds.includes(achievement.id)
        return (
          <article className={`achievement-card${unlocked ? ' is-unlocked' : ''}`} key={achievement.id}>
            {unlocked ? <Award aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
            <span>{achievement.category}</span>
            <h3>{unlocked || !achievement.hidden ? achievement.title : '未公开印记'}</h3>
            <p>{unlocked || !achievement.hidden ? achievement.description : '在某条特殊生涯路径中才会显现。'}</p>
          </article>
        )
      })}
    </div>
  )
}
