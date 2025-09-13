/**
 * Represents a single learning unit within a study guide.
 *
 * @interface LearningUnit
 * @property {string} name - The display name of the learning unit
 * @property {number} topics - Total number of topics/lessons in this unit
 * @property {number} mastery - Current mastery level as a percentage (0-100)
 *
 * @example
 * ```typescript
 * const unit: LearningUnit = {
 *   name: "Vector Operations",
 *   topics: 8,
 *   mastery: 75
 * }
 * ```
 */
export interface LearningUnit {
  name: string;
  topics: number;
  mastery: number;
}

/**
 * Represents a complete study guide containing multiple learning units.
 *
 * @interface StudyGuide
 * @property {number} id - Unique identifier for the study guide
 * @property {string} title - Display title of the study guide
 * @property {number} overallMastery - Overall progress percentage across all units (0-100)
 * @property {LearningUnit[]} units - Array of learning units within this guide
 *
 * @example
 * ```typescript
 * const guide: StudyGuide = {
 *   id: 1,
 *   title: "Linear Algebra I",
 *   overallMastery: 68,
 *   units: [
 *     { name: "Vector Operations", topics: 8, mastery: 75 },
 *     { name: "Matrix Fundamentals", topics: 6, mastery: 60 }
 *   ]
 * }
 * ```
 */
export interface StudyGuide {
  id: number;
  title: string;
  overallMastery: number;
  units: LearningUnit[];
  sections?: StudyGuideSection[];
}

/**
 * Represents an individual lesson within a course unit.
 *
 * @interface Lesson
 * @property {string} title - The lesson title displayed to students
 * @property {'Lesson' | 'Assessment' | 'Multistep' | string} type - Type of lesson content
 * @property {number} xp - Experience points awarded for completing this lesson
 * @property {string} content - Main educational content (supports markdown)
 * @property {string[]} [keyPoints] - Optional array of key learning points
 * @property {string} [examples] - Optional examples section (supports markdown)
 * @property {'beginner' | 'intermediate' | 'advanced' | string} [difficulty] - Difficulty level
 *
 * Lesson Types:
 * - **Lesson**: Standard instructional content
 * - **Assessment**: Evaluation or testing content
 * - **Multistep**: Complex lessons with multiple parts
 *
 * @example
 * ```typescript
 * const lesson: Lesson = {
 *   title: "Introduction to Vectors",
 *   type: "Lesson",
 *   xp: 15,
 *   content: "A vector is a mathematical object with magnitude and direction...",
 *   keyPoints: [
 *     "Vectors have both magnitude and direction",
 *     "Can be represented geometrically or algebraically"
 *   ],
 *   examples: "Vector (3,4) has magnitude 5 and points northeast",
 *   difficulty: "beginner"
 * }
 * ```
 */
export interface Lesson {
  title: string;
  type: "Lesson" | "Assessment" | "Multistep" | string;
  xp: number;
  content: string;
  keyPoints?: string[];
  examples?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | string;
}

/**
 * Represents a unit of study containing multiple related lessons.
 *
 * @interface CourseUnit
 * @property {string} unitName - The display name for this unit
 * @property {Lesson[]} lessons - Array of lessons within this unit
 *
 * @example
 * ```typescript
 * const unit: CourseUnit = {
 *   unitName: "Vector Operations",
 *   lessons: [
 *     { title: "Introduction to Vectors", type: "Lesson", ... },
 *     { title: "Vector Addition", type: "Lesson", ... },
 *     { title: "Vector Quiz", type: "Assessment", ... }
 *   ]
 * }
 * ```
 */
export interface CourseUnit {
  unitName: string;
  lessons: Lesson[];
}

/**
 * Represents a prerequisite requirement that must be completed before accessing certain content.
 *
 * @interface Prerequisite
 * @property {string} id - Unique identifier for this prerequisite
 * @property {string} title - Display title of the prerequisite
 * @property {string} description - Detailed description of what needs to be completed
 * @property {boolean} completed - Whether this prerequisite has been fulfilled
 * @property {'beginner' | 'intermediate' | 'advanced'} difficulty - Difficulty level
 * @property {number} estimatedTime - Estimated time in minutes to complete
 * @property {string[]} dependsOn - Array of prerequisite IDs that must be completed first
 *
 * Dependency System:
 * Prerequisites can depend on other prerequisites, creating a learning path
 * that ensures students have the necessary foundation before advancing.
 *
 * @example
 * ```typescript
 * const prereq: Prerequisite = {
 *   id: "basic-algebra",
 *   title: "Basic Algebra",
 *   description: "Understanding of variables, equations, and basic operations",
 *   completed: true,
 *   difficulty: "beginner",
 *   estimatedTime: 120,
 *   dependsOn: ["arithmetic"]
 * }
 * ```
 */
export interface Prerequisite {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  dependsOn: string[];
}

export interface StudyGuideSection {
  id: string
  title: string
  content: string
  prerequisites?: string[];
}

export interface StudyGuideSection {
  id: string
  title: string
  content: string
  prerequisites?: string[]
}
