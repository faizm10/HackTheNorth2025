export interface LearningUnit {
  name: string
  topics: number
  mastery: number
}

export interface StudyGuide {
  id: number
  title: string
  overallMastery: number
  units: LearningUnit[]
}

export interface Lesson {
  title: string
  type: 'Lesson' | 'Assessment' | 'Multistep' | string
  xp: number
  content: string
  keyPoints?: string[]
  examples?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | string
}

export interface CourseUnit {
  unitName: string
  lessons: Lesson[]
}

export interface Prerequisite {
  id: string
  title: string
  description: string
  completed: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  dependsOn: string[]
}
