"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BookOpen, CheckCircle, Clock, Target, Lightbulb, ArrowRight, Star, Brain, Loader2, AlertCircle } from "lucide-react"
import { ApiClient, type ProcessedResult } from "@/lib/api"

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
  const [extractionStatus, setExtractionStatus] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Generate study guide using the backend API
  const generateStudyGuide = async () => {
    setIsGenerating(true)
    setError(null)
    setExtractionStatus("")
    setIsCompleted(false)

    try {
      let finalText = textContent

      // If we have files but no text content, extract text from files first
      if (files.length > 0 && (!textContent || textContent.length < 100)) {
        setExtractionStatus("Extracting text from uploaded files...")
        
        const extractionResult = await ApiClient.uploadAndProcess(files)

        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Failed to extract text from files')
        }

        if (extractionResult.data) {
          setExtractionStatus("Text extraction completed! Processing with AI...")
          // Use the processed result directly
          const processedData = extractionResult.data.processedResult
          const studyGuideSections = convertToStudyGuideSections(processedData, topic)
          setStudyGuide(studyGuideSections)
          setExtractionStatus("Study guide generation completed!")
          setIsCompleted(true)
          setIsGenerating(false)
          return
        }
      }

      // If we have text content, process it directly
      if (finalText && finalText.length > 100) {
        setExtractionStatus("Processing text with AI...")
        
        const processResult = await ApiClient.processText(finalText)

        if (!processResult.success) {
          throw new Error(processResult.error || 'Failed to process text')
        }

        if (processResult.data) {
          setExtractionStatus("AI processing completed! Generating study guide...")
          const studyGuideSections = convertToStudyGuideSections(processResult.data, topic)
          setStudyGuide(studyGuideSections)
          setExtractionStatus("Study guide generation completed!")
          setIsCompleted(true)
        }
      } else {
        // Provide more helpful error message
        if (files.length > 0) {
          throw new Error('Failed to extract text from uploaded files. Please try uploading different files or check file formats.')
        } else {
          throw new Error('No text content available for processing. Please upload files or provide text content.')
        }
      }

    } catch (error) {
      console.error('Study guide generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate study guide')
    } finally {
      setIsGenerating(false)
    }
  }

  // Convert backend response to study guide sections
  const convertToStudyGuideSections = (data: ProcessedResult, topic: string): StudyGuideSection[] => {
    const sections: StudyGuideSection[] = []
    
    if (data.modules?.modules) {
      data.modules.modules.forEach((module: any, index: number) => {
        sections.push({
          id: module.id || `module-${index + 1}`,
          title: module.title || `Module ${index + 1}`,
          content: module.summary || `Content for ${module.title}`,
          difficulty: index < 2 ? "beginner" : index < 4 ? "intermediate" : "advanced",
          estimatedTime: Math.max(10, Math.min(30, Math.floor(module.summary?.length / 50) || 15)),
          prerequisites: index > 0 ? [sections[index - 1]?.id].filter(Boolean) : [],
          completed: false,
        })
      })
    }

    // If no modules, create a basic structure
    if (sections.length === 0) {
      sections.push({
        id: "1",
        title: `Introduction to ${topic}`,
        content: `Get started with ${topic}. This section covers the fundamental concepts and principles.`,
        difficulty: "beginner",
        estimatedTime: 15,
        prerequisites: [],
        completed: false,
      })
    }

    return sections
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
            
            {/* Status Messages */}
            {extractionStatus && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-800">{extractionStatus}</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
            
            {isCompleted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Study guide generation completed successfully!</span>
                </div>
              </div>
            )}
            
            <Button onClick={generateStudyGuide} disabled={isGenerating} className="mt-6" size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
      {/* Completion Status */}
      {isCompleted && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-800">Study Guide Generated Successfully!</h3>
            </div>
            <p className="text-sm text-green-700">
              Your personalized study guide for <strong>{topic}</strong> has been created using AI analysis of your uploaded content.
            </p>
          </CardContent>
        </Card>
      )}
      
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
