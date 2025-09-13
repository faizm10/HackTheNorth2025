// Mock data generator for Databricks-style analytics dashboard

export interface MockUser {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  last_active: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  total_lessons: number;
  total_quizzes: number;
  avg_score: number;
}

export interface MockLesson {
  lesson_id: string;
  topic: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  created_at: string;
  completion_rate: number;
  avg_rating: number;
  total_enrollments: number;
}

export interface MockQuiz {
  quiz_id: string;
  lesson_id: string;
  topic: string;
  questions_count: number;
  avg_score: number;
  attempts_count: number;
  created_at: string;
}

export interface MockEvent {
  event_id: string;
  user_id: string;
  event_type: 'lesson_start' | 'lesson_complete' | 'quiz_start' | 'quiz_complete' | 'page_view' | 'download';
  lesson_id?: string;
  quiz_id?: string;
  timestamp: string;
  session_duration?: number;
  metadata: Record<string, any>;
}

export interface MockPerformance {
  date: string;
  active_users: number;
  lessons_completed: number;
  quizzes_taken: number;
  avg_session_duration: number;
  revenue: number;
  churn_rate: number;
}

const topics = [
  'Machine Learning', 'Data Science', 'Python Programming', 'SQL Databases',
  'Cloud Computing', 'DevOps', 'Web Development', 'Mobile Development',
  'Cybersecurity', 'Blockchain', 'AI/ML', 'Data Analytics'
];

const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
const subscriptionTiers = ['free', 'premium', 'enterprise'] as const;

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(daysAgo: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

function generateUsers(count: number = 1000): MockUser[] {
  const users: MockUser[] = [];
  
  for (let i = 1; i <= count; i++) {
    const user_id = `user_${i.toString().padStart(4, '0')}`;
    const created_at = randomDate(365);
    const last_active = randomDate(30);
    
    users.push({
      user_id,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      created_at,
      last_active,
      subscription_tier: randomChoice(subscriptionTiers),
      total_lessons: randomInt(0, 50),
      total_quizzes: randomInt(0, 100),
      avg_score: randomFloat(60, 95)
    });
  }
  
  return users;
}

function generateLessons(count: number = 200): MockLesson[] {
  const lessons: MockLesson[] = [];
  
  for (let i = 1; i <= count; i++) {
    const lesson_id = `lesson_${i.toString().padStart(4, '0')}`;
    const topic = randomChoice(topics);
    const difficulty = randomChoice(difficulties);
    
    lessons.push({
      lesson_id,
      topic,
      title: `${topic} Fundamentals - Part ${i}`,
      difficulty,
      duration_minutes: randomInt(15, 120),
      created_at: randomDate(180),
      completion_rate: randomFloat(0.3, 0.9),
      avg_rating: randomFloat(3.5, 5.0),
      total_enrollments: randomInt(50, 2000)
    });
  }
  
  return lessons;
}

function generateQuizzes(lessons: MockLesson[]): MockQuiz[] {
  const quizzes: MockQuiz[] = [];
  
  lessons.forEach(lesson => {
    const quizCount = randomInt(1, 3); // 1-3 quizzes per lesson
    
    for (let i = 1; i <= quizCount; i++) {
      quizzes.push({
        quiz_id: `quiz_${lesson.lesson_id}_${i}`,
        lesson_id: lesson.lesson_id,
        topic: lesson.topic,
        questions_count: randomInt(5, 20),
        avg_score: randomFloat(65, 90),
        attempts_count: randomInt(10, 500),
        created_at: randomDate(180)
      });
    }
  });
  
  return quizzes;
}

function generateEvents(users: MockUser[], lessons: MockLesson[], quizzes: MockQuiz[], count: number = 10000): MockEvent[] {
  const events: MockEvent[] = [];
  const eventTypes: MockEvent['event_type'][] = ['lesson_start', 'lesson_complete', 'quiz_start', 'quiz_complete', 'page_view', 'download'];
  
  for (let i = 1; i <= count; i++) {
    const user = randomChoice(users);
    const event_type = randomChoice(eventTypes);
    const timestamp = randomDate(30);
    
    let lesson_id: string | undefined;
    let quiz_id: string | undefined;
    let session_duration: number | undefined;
    
    if (event_type.includes('lesson')) {
      lesson_id = randomChoice(lessons).lesson_id;
    }
    
    if (event_type.includes('quiz')) {
      quiz_id = randomChoice(quizzes).quiz_id;
    }
    
    if (event_type === 'lesson_complete' || event_type === 'quiz_complete') {
      session_duration = randomInt(300, 3600); // 5-60 minutes
    }
    
    events.push({
      event_id: `event_${i.toString().padStart(6, '0')}`,
      user_id: user.user_id,
      event_type,
      lesson_id,
      quiz_id,
      timestamp,
      session_duration,
      metadata: {
        browser: randomChoice(['Chrome', 'Firefox', 'Safari', 'Edge']),
        device: randomChoice(['desktop', 'mobile', 'tablet']),
        location: randomChoice(['US', 'EU', 'Asia', 'Other'])
      }
    });
  }
  
  return events;
}

function generatePerformanceData(days: number = 30): MockPerformance[] {
  const performance: MockPerformance[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Add some realistic trends and seasonality
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 0.7 : 1.0;
    
    performance.push({
      date: dateStr,
      active_users: Math.floor(randomInt(800, 1200) * weekendMultiplier),
      lessons_completed: Math.floor(randomInt(200, 400) * weekendMultiplier),
      quizzes_taken: Math.floor(randomInt(500, 800) * weekendMultiplier),
      avg_session_duration: randomInt(1200, 2400), // 20-40 minutes
      revenue: Math.floor(randomInt(5000, 15000) * weekendMultiplier),
      churn_rate: randomFloat(0.02, 0.08)
    });
  }
  
  return performance.reverse(); // Most recent first
}

export interface DetailedUser {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  last_active: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  profile: {
    age: number;
    location: string;
    occupation: string;
    experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    interests: string[];
    goals: string[];
  };
  stats: {
    total_lessons: number;
    total_quizzes: number;
    avg_score: number;
    total_study_time: number; // minutes
    streak_days: number;
    certificates_earned: number;
    points_earned: number;
  };
  learning_journey: {
    lessons_completed: Array<{
      lesson_id: string;
      title: string;
      topic: string;
      completed_at: string;
      score: number;
      time_spent: number;
    }>;
    quiz_attempts: Array<{
      quiz_id: string;
      lesson_id: string;
      topic: string;
      attempted_at: string;
      score: number;
      time_spent: number;
      attempts: number;
    }>;
    achievements: Array<{
      achievement_id: string;
      name: string;
      description: string;
      earned_at: string;
      points: number;
    }>;
    study_sessions: Array<{
      session_id: string;
      start_time: string;
      end_time: string;
      duration: number;
      lessons_studied: number;
      quizzes_taken: number;
      topics_covered: string[];
    }>;
  };
  preferences: {
    preferred_topics: string[];
    study_time_preference: 'morning' | 'afternoon' | 'evening' | 'night';
    notification_settings: {
      email_notifications: boolean;
      push_notifications: boolean;
      weekly_progress: boolean;
      new_lessons: boolean;
    };
    learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  social: {
    friends_count: number;
    study_groups: string[];
    forum_posts: number;
    helpful_votes_received: number;
    mentor_status: boolean;
  };
}

function generateDetailedUser(): DetailedUser {
  const user_id = 'user_detailed_001';
  const created_at = '2024-01-15T10:30:00Z';
  const last_active = new Date().toISOString();
  
  // Generate comprehensive learning journey
  const lessons_completed = [];
  const quiz_attempts = [];
  const achievements = [];
  const study_sessions = [];
  
  // Generate 50+ completed lessons over 6 months
  for (let i = 0; i < 52; i++) {
    const lessonDate = new Date(created_at);
    lessonDate.setDate(lessonDate.getDate() + Math.floor(Math.random() * 180));
    
    lessons_completed.push({
      lesson_id: `lesson_${(i + 1).toString().padStart(4, '0')}`,
      title: `${randomChoice(topics)} Advanced Concepts - Part ${i + 1}`,
      topic: randomChoice(topics),
      completed_at: lessonDate.toISOString(),
      score: randomFloat(75, 98),
      time_spent: randomInt(20, 90)
    });
  }
  
  // Generate 100+ quiz attempts
  for (let i = 0; i < 108; i++) {
    const quizDate = new Date(created_at);
    quizDate.setDate(quizDate.getDate() + Math.floor(Math.random() * 180));
    
    quiz_attempts.push({
      quiz_id: `quiz_${(i + 1).toString().padStart(4, '0')}`,
      lesson_id: `lesson_${(Math.floor(i / 2) + 1).toString().padStart(4, '0')}`,
      topic: randomChoice(topics),
      attempted_at: quizDate.toISOString(),
      score: randomFloat(70, 95),
      time_spent: randomInt(5, 25),
      attempts: randomInt(1, 3)
    });
  }
  
  // Generate achievements
  const achievementTypes = [
    { name: 'First Lesson', description: 'Completed your first lesson', points: 10 },
    { name: 'Quiz Master', description: 'Scored 90%+ on 10 quizzes', points: 50 },
    { name: 'Streak Keeper', description: 'Studied for 7 days in a row', points: 25 },
    { name: 'Topic Expert', description: 'Mastered Machine Learning', points: 100 },
    { name: 'Speed Learner', description: 'Completed 5 lessons in one day', points: 30 },
    { name: 'Perfect Score', description: 'Got 100% on a quiz', points: 20 },
    { name: 'Early Bird', description: 'Studied before 7 AM', points: 15 },
    { name: 'Night Owl', description: 'Studied after 10 PM', points: 15 },
    { name: 'Social Learner', description: 'Helped 5 other students', points: 40 },
    { name: 'Certificate Collector', description: 'Earned 3 certificates', points: 75 }
  ];
  
  for (let i = 0; i < 8; i++) {
    const achievement = randomChoice(achievementTypes);
    const earnedDate = new Date(created_at);
    earnedDate.setDate(earnedDate.getDate() + Math.floor(Math.random() * 150));
    
    achievements.push({
      achievement_id: `ach_${(i + 1).toString().padStart(3, '0')}`,
      name: achievement.name,
      description: achievement.description,
      earned_at: earnedDate.toISOString(),
      points: achievement.points
    });
  }
  
  // Generate study sessions (daily for 6 months)
  for (let i = 0; i < 180; i++) {
    const sessionDate = new Date(created_at);
    sessionDate.setDate(sessionDate.getDate() + i);
    
    const startHour = randomInt(6, 22);
    const duration = randomInt(30, 180);
    
    const startTime = new Date(sessionDate);
    startTime.setHours(startHour, randomInt(0, 59), 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    study_sessions.push({
      session_id: `session_${(i + 1).toString().padStart(4, '0')}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration,
      lessons_studied: randomInt(1, 4),
      quizzes_taken: randomInt(0, 3),
      topics_covered: [randomChoice(topics), randomChoice(topics)].filter((v, i, a) => a.indexOf(v) === i)
    });
  }
  
  return {
    user_id,
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    created_at,
    last_active,
    subscription_tier: 'premium',
    profile: {
      age: 28,
      location: 'San Francisco, CA',
      occupation: 'Software Engineer',
      experience_level: 'intermediate',
      interests: ['Machine Learning', 'Data Science', 'Python Programming', 'Cloud Computing'],
      goals: ['Become a Data Scientist', 'Learn Advanced ML', 'Get AWS Certified', 'Build ML Projects']
    },
    stats: {
      total_lessons: lessons_completed.length,
      total_quizzes: quiz_attempts.length,
      avg_score: 87.5,
      total_study_time: study_sessions.reduce((sum, s) => sum + s.duration, 0),
      streak_days: 23,
      certificates_earned: 3,
      points_earned: achievements.reduce((sum, a) => sum + a.points, 0) + 500
    },
    learning_journey: {
      lessons_completed: lessons_completed.sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()),
      quiz_attempts: quiz_attempts.sort((a, b) => new Date(a.attempted_at).getTime() - new Date(b.attempted_at).getTime()),
      achievements: achievements.sort((a, b) => new Date(a.earned_at).getTime() - new Date(b.earned_at).getTime()),
      study_sessions: study_sessions.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    },
    preferences: {
      preferred_topics: ['Machine Learning', 'Data Science', 'Python Programming'],
      study_time_preference: 'evening',
      notification_settings: {
        email_notifications: true,
        push_notifications: true,
        weekly_progress: true,
        new_lessons: false
      },
      learning_style: 'visual'
    },
    social: {
      friends_count: 47,
      study_groups: ['ML Beginners', 'Data Science SF', 'Python Study Group'],
      forum_posts: 23,
      helpful_votes_received: 156,
      mentor_status: true
    }
  };
}

export function generateMockData() {
  const users = generateUsers(5000); // 5,000 users
  const lessons = generateLessons(500); // 500 lessons
  const quizzes = generateQuizzes(lessons);
  const events = generateEvents(users, lessons, quizzes, 50000); // 50,000 events
  const performance = generatePerformanceData(90); // 90 days of data
  
  // Create one super detailed user
  const detailedUser = generateDetailedUser();
  
  return {
    users,
    lessons,
    quizzes,
    events,
    performance,
    detailedUser,
    summary: {
      total_users: users.length,
      total_lessons: lessons.length,
      total_quizzes: quizzes.length,
      total_events: events.length,
      active_users_today: events.filter(e => {
        const eventDate = new Date(e.timestamp).toDateString();
        const today = new Date().toDateString();
        return eventDate === today;
      }).length,
      completion_rate: events.filter(e => e.event_type === 'lesson_complete').length / 
                     events.filter(e => e.event_type === 'lesson_start').length,
      avg_quiz_score: quizzes.reduce((sum, q) => sum + q.avg_score, 0) / quizzes.length
    }
  };
}
