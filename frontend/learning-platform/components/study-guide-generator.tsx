"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BookOpen, CheckCircle, Clock, Target, Lightbulb, ArrowRight, Star, Brain } from "lucide-react"

interface StudyGuideSection {
  id: string
  title: string
  content: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
  prerequisites: string[]
  completed: boolean
}

interface StudyGuideProps {
  topic: string
  difficulty: string
  files: File[]
  textContent: string
}

export function StudyGuideGenerator({ topic, difficulty, files, textContent }: StudyGuideProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [studyGuide, setStudyGuide] = useState<StudyGuideSection[] | null>(null)

  // Mock study guide generation - in real app, this would call an AI API
  const generateStudyGuide = async () => {
    setIsGenerating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock study guide based on topic
    const mockGuide: StudyGuideSection[] = [
      {
        id: "1",
        title: "Fundamentals and Core Concepts",
        content: `Understanding the basic principles of ${topic}. This section covers the essential building blocks you need to master before moving to more complex topics.`,
        difficulty: "beginner",
        estimatedTime: 15,
        prerequisites: [],
        completed: false,
      },
      {
        id: "2",
        title: "Key Terminology and Definitions",
        content: `Master the vocabulary and terminology specific to ${topic}. Learn the precise definitions and how they relate to each other.`,
        difficulty: "beginner",
        estimatedTime: 10,
        prerequisites: ["1"],
        completed: false,
      },
      {
        id: "3",
        title: "Practical Applications",
        content: `Apply your knowledge of ${topic} to real-world scenarios. Work through examples and case studies to solidify your understanding.`,
        difficulty: "intermediate",
        estimatedTime: 25,
        prerequisites: ["1", "2"],
        completed: false,
      },
      {
        id: "4",
        title: "Advanced Techniques and Methods",
        content: `Explore advanced concepts and methodologies in ${topic}. This section challenges you to think critically and solve complex problems.`,
        difficulty: "advanced",
        estimatedTime: 30,
        prerequisites: ["1", "2", "3"],
        completed: false,
      },
      {
        id: "5",
        title: "Integration and Synthesis",
        content: `Combine all your knowledge to tackle comprehensive problems. Learn to integrate different aspects of ${topic} into cohesive solutions.`,
        difficulty: "advanced",
        estimatedTime: 20,
        prerequisites: ["1", "2", "3", "4"],
        completed: false,
      },
    ]

    setStudyGuide(mockGuide)
    setIsGenerating(false)
  }

  const toggleSectionComplete = (sectionId: string) => {
    if (!studyGuide) return

    setStudyGuide(
      studyGuide.map((section) => (section.id === sectionId ? { ...section, completed: !section.completed } : section)),
    )
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
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

  const completedSections = studyGuide?.filter((s) => s.completed).length || 0
  const totalSections = studyGuide?.length || 0
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0

  if (!studyGuide) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Study Guide Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Ready to generate a personalized study guide for:</div>
              <div className="font-medium text-lg">{topic || "Your uploaded content"}</div>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">{difficulty} level</Badge>
                <Badge variant="outline">{files.length} files uploaded</Badge>
              </div>
            </div>
            <Button onClick={generateStudyGuide} disabled={isGenerating} className="mt-6" size="lg">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Study Guide...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Study Guide
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Progress
            </span>
            <Badge variant="outline">
              {completedSections}/{totalSections} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Study Guide Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Study Guide: {topic}
        </h3>

        {studyGuide.map((section, index) => {
          const canStart = section.prerequisites.every(
            (prereqId) => studyGuide.find((s) => s.id === prereqId)?.completed,
          )

          return (
            <Card
              key={section.id}
              className={`transition-all ${
                section.completed ? "bg-green-50 border-green-200" : !canStart ? "opacity-60" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Section {index + 1}</span>
                      <Badge className={getDifficultyColor(section.difficulty)}>{section.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <Button
                    variant={section.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSectionComplete(section.id)}
                    disabled={!canStart}
                    className="shrink-0"
                  >
                    {section.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-1" />
                        {section.estimatedTime}min
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4">{section.content}</p>

                {section.prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-muted-foreground">Prerequisites:</span>
                      <div className="flex gap-1">
                        {section.prerequisites.map((prereqId) => {
                          const prereq = studyGuide.find((s) => s.id === prereqId)
                          return (
                            <Badge
                              key={prereqId}
                              variant={prereq?.completed ? "default" : "outline"}
                              className="text-xs"
                            >
                              Section {prereqId}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completion Celebration */}
      {completedSections === totalSections && totalSections > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="text-center py-8">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">You've completed your study guide for {topic}. Great work!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
