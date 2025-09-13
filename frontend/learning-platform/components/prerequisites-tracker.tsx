"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ArrowRight, Target, Lock, Unlock, Clock, Star, Brain } from "lucide-react"

interface Prerequisite {
  id: string
  title: string
  description: string
  completed: boolean
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  dependsOn: string[]
}

interface PrerequisitesTrackerProps {
  topic: string
}

export function PrerequisitesTracker({ topic }: PrerequisitesTrackerProps) {
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([
    {
      id: "math-basics",
      title: "Basic Mathematics",
      description: "Arithmetic operations, fractions, decimals, and percentages",
      completed: true,
      difficulty: "beginner",
      estimatedTime: 30,
      dependsOn: [],
    },
    {
      id: "algebra",
      title: "Algebra Fundamentals",
      description: "Variables, equations, inequalities, and linear functions",
      completed: true,
      difficulty: "intermediate",
      estimatedTime: 45,
      dependsOn: ["math-basics"],
    },
    {
      id: "functions",
      title: "Functions and Graphs",
      description: "Function notation, domain/range, and coordinate graphing",
      completed: true,
      difficulty: "intermediate",
      estimatedTime: 60,
      dependsOn: ["algebra"],
    },
    {
      id: "trigonometry",
      title: "Basic Trigonometry",
      description: "Sine, cosine, tangent, and unit circle concepts",
      completed: false,
      difficulty: "intermediate",
      estimatedTime: 75,
      dependsOn: ["functions"],
    },
    {
      id: "limits",
      title: "Limits and Continuity",
      description: "Concept of limits, one-sided limits, and continuous functions",
      completed: false,
      difficulty: "advanced",
      estimatedTime: 90,
      dependsOn: ["functions", "trigonometry"],
    },
    {
      id: "derivatives-intro",
      title: "Introduction to Derivatives",
      description: "Definition of derivative and basic differentiation rules",
      completed: false,
      difficulty: "advanced",
      estimatedTime: 120,
      dependsOn: ["limits"],
    },
  ])

  const learningStats = {
    totalTime: prerequisites.reduce((sum, prereq) => sum + prereq.estimatedTime, 0),
    completedTime: prerequisites.filter((p) => p.completed).reduce((sum, prereq) => sum + prereq.estimatedTime, 0),
    nextMilestone: prerequisites.find((p) => !p.completed && isUnlocked(p)),
  }

  const togglePrerequisite = (id: string) => {
    setPrerequisites((prev) =>
      prev.map((prereq) => (prereq.id === id ? { ...prereq, completed: !prereq.completed } : prereq)),
    )
  }

  const isUnlocked = (prereq: Prerequisite) => {
    return prereq.dependsOn.every((depId) => prerequisites.find((p) => p.id === depId)?.completed)
  }

  const completedCount = prerequisites.filter((p) => p.completed).length
  const totalCount = prerequisites.length
  const progressPercentage = (completedCount / totalCount) * 100

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-balance">Prerequisites for {topic}</h2>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Master these foundational concepts to unlock advanced topics and build a strong knowledge base
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Overview */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Learning Path Progress
                </span>
                <Badge variant="outline" className="px-3 py-1">
                  {completedCount}/{totalCount} Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{learningStats.completedTime}h</div>
                  <div className="text-xs text-muted-foreground">Time Invested</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round((learningStats.totalTime - learningStats.completedTime) / 60)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {prerequisites.filter((p) => isUnlocked(p) && !p.completed).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites List */}
          <div className="space-y-4">
            {prerequisites.map((prereq, index) => {
              const unlocked = isUnlocked(prereq)

              return (
                <div key={prereq.id} className="space-y-3">
                  <Card
                    className={`transition-all shadow-sm border-0 ${
                      prereq.completed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : !unlocked
                          ? "opacity-50 bg-gray-50"
                          : "bg-white/60 backdrop-blur-sm hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unlocked && togglePrerequisite(prereq.id)}
                            disabled={!unlocked}
                            className="p-0 h-auto mt-1"
                          >
                            {prereq.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground" />
                            )}
                          </Button>

                          <div className="space-y-3 flex-1">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg">{prereq.title}</h4>
                                  {unlocked ? (
                                    <Unlock className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <p className="text-muted-foreground">{prereq.description}</p>
                              </div>

                              {unlocked && !prereq.completed && (
                                <Button size="sm" onClick={() => togglePrerequisite(prereq.id)}>
                                  <Star className="h-4 w-4 mr-1" />
                                  Start Learning
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge className={getDifficultyColor(prereq.difficulty)}>{prereq.difficulty}</Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {prereq.estimatedTime} minutes
                              </Badge>
                              {prereq.completed && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>

                            {prereq.dependsOn.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 p-2 rounded-lg">
                                <ArrowRight className="h-3 w-3" />
                                <span>Prerequisites:</span>
                                <div className="flex gap-1 flex-wrap">
                                  {prereq.dependsOn.map((depId) => {
                                    const dep = prerequisites.find((p) => p.id === depId)
                                    return (
                                      <Badge
                                        key={depId}
                                        variant={dep?.completed ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        {dep?.title}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {index < prerequisites.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-6 bg-gradient-to-b from-muted to-transparent"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Next Steps */}
          {learningStats.nextMilestone && (
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-medium">{learningStats.nextMilestone.title}</div>
                <div className="text-sm text-muted-foreground">{learningStats.nextMilestone.description}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>{learningStats.nextMilestone.estimatedTime} minutes</span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => togglePrerequisite(learningStats.nextMilestone!.id)}
                >
                  Start Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Learning Tips */}
          <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">💡 Learning Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Take Your Time</div>
                <div className="text-blue-700">Master each concept before moving to the next one.</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Practice Regularly</div>
                <div className="text-green-700">Consistent practice helps reinforce learning.</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900">Ask Questions</div>
                <div className="text-purple-700">Don't hesitate to seek help when stuck.</div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">📊 Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Completed Topics</span>
                <span className="font-medium">{completedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Topics</span>
                <span className="font-medium">{prerequisites.filter((p) => isUnlocked(p) && !p.completed).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Locked Topics</span>
                <span className="font-medium">{prerequisites.filter((p) => !isUnlocked(p)).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Study Time</span>
                <span className="font-medium">
                  {Math.round(learningStats.totalTime / 60)}h {learningStats.totalTime % 60}m
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
