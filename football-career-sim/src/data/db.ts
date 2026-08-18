import clubsJson from './clubs.json'
import careerExperiencesJson from './career-experiences.json'
import knowledgeSourcesJson from './knowledge-sources.json'
import matchesJson from './matches.json'
import newsJson from './news.json'
import termsJson from './terms.json'
import type { CareerExperience, Club, EncyclopediaTerm, KnowledgeSource, MatchRecord, NewsEvent } from '../app/types'

export const clubs = clubsJson as Club[]
export const careerExperiences = careerExperiencesJson as CareerExperience[]
export const knowledgeSources = knowledgeSourcesJson as KnowledgeSource[]
export const newsEvents = newsJson as NewsEvent[]
export const matches = matchesJson as MatchRecord[]
export const terms = termsJson as EncyclopediaTerm[]

export const getClub = (clubId: string) => clubs.find((club) => club.id === clubId) ?? clubs[0]
export const getMatch = (matchId: string) => matches.find((match) => match.id === matchId)
export const getTerm = (termId: string) => terms.find((term) => term.id === termId)
export const getExperience = (experienceId: string) => careerExperiences.find((experience) => experience.id === experienceId)
export const getSource = (sourceId: string) => knowledgeSources.find((source) => source.id === sourceId)
export const getExperiencesForTerm = (termId: string) => careerExperiences.filter((experience) => experience.termIds.includes(termId))
