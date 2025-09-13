"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "./file-upload"
import { TextInputArea } from "./text-input-area"
import { StudyGuideGenerator } from "./study-guide-generator"
import { PrerequisitesTracker } from "./prerequisites-tracker"
import { XPProgressSystem } from "./xp-progress-system"
import { StudySession } from "./study-session"
import { Button } from "@/components/ui/button"
import { Upload, Brain, Target, Zap, GraduationCap, TrendingUp, FileText, CheckCircle } from "lucide-react"

export function LearningDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [studyContent, setStudyContent] = useState<{
    text: string
    topic: string
    difficulty: string
  } | null>(null)
  const [activeStudySession, setActiveStudySession] = useState<any>(null)

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handleTextChange = (text: string, topic: string, difficulty: string) => {
    setStudyContent({ text, topic, difficulty })
  }

  const activeStudyGuides = [
    {
      id: 1,
      title: "LINEAR ALGEBRA I",
      overallMastery: 62,
      units: [
        { name: "Vector Operations", topics: 24, mastery: 85 },
        { name: "Matrix Fundamentals", topics: 28, mastery: 75 },
        { name: "Linear Transformations", topics: 13, mastery: 45 },
        { name: "Eigenvalues & Eigenvectors", topics: 11, mastery: 20 },
        { name: "Vector Spaces", topics: 7, mastery: 15 },
        { name: "Inner Product Spaces", topics: 17, mastery: 60 },
        { name: "Orthogonality", topics: 14, mastery: 40 },
        { name: "Applications", topics: 22, mastery: 70 },
      ],
    },
    {
      id: 2,
      title: "CALCULUS II",
      overallMastery: 78,
      units: [
        { name: "Integration Techniques", topics: 32, mastery: 90 },
        { name: "Applications of Integration", topics: 18, mastery: 85 },
        { name: "Sequences and Series", topics: 25, mastery: 65 },
        { name: "Parametric Equations", topics: 12, mastery: 70 },
        { name: "Polar Coordinates", topics: 15, mastery: 60 },
      ],
    },
  ]

  const todaysLessons = [
    {
      type: "Lesson",
      title: "Vector Addition and Scalar Multiplication",
      xp: 7,
      progress: 50,
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      type: "Assessment",
      title: "Quiz 1",
      xp: 15,
      progress: 0,
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      type: "Multistep",
      title: "Solving Systems of Linear Equations",
      xp: 15,
      progress: 0,
      icon: <Target className="h-4 w-4" />,
    },
    {
      type: "Lesson",
      title: "Matrix Multiplication Properties",
      xp: 14,
      progress: 0,
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      type: "Review",
      title: "Linear Independence",
      xp: 5,
      progress: 0,
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ]

  if (activeStudySession) {
    return <StudySession guide={activeStudySession} onBack={() => setActiveStudySession(null)} />
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LearnAI Academy</h1>
                <p className="text-sm text-gray-600">Personalized learning with AI-powered study guides</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">1,247 XP</div>
                <div className="text-xs text-gray-500">Level 8</div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="study" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="study" className="flex items-center gap-2 data-[state=active]:bg-white rounded-md">
              <Brain className="h-4 w-4" />
              Study
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-white rounded-md">
              <Upload className="h-4 w-4" />
              Create Guide
            </TabsTrigger>
            <TabsTrigger
              value="prerequisites"
              className="flex items-center gap-2 data-[state=active]:bg-white rounded-md"
            >
              <Target className="h-4 w-4" />
              Prerequisites
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-white rounded-md">
              <Zap className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {activeStudyGuides.map((guide) => (
                  <Card key={guide.id} className="border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-blue-600">{guide.title}</CardTitle>
                        <Button size="sm" onClick={() => setActiveStudySession(guide)}>
                          Continue
                        </Button>
                      </div>
                      <p className="text-gray-600 text-sm">
                        John has demonstrated mastery of <strong>{guide.overallMastery}%</strong> of {guide.title}.
                      </p>
                      <p className="text-gray-600 text-sm">
                        Following are the mastery levels for each unit in the course. The darker the color, the greater
                        the estimated level of mastery.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {guide.units.map((unit, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {index + 1}. {unit.name} ({unit.topics} topics)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${unit.mastery}%`,
                                opacity: Math.max(0.3, unit.mastery / 100),
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Lessons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todaysLessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 rounded">{lesson.icon}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lesson.type}</div>
                            <div className="text-xs text-gray-600">{lesson.title}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600">{lesson.xp} XP</div>
                          {lesson.progress > 0 && <div className="text-xs text-blue-600">{lesson.progress}%</div>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">FOUNDATIONAL KNOWLEDGE</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      John is missing <strong>9 foundational topics</strong> from Prealgebra.
                    </p>
                    <p className="text-gray-600 text-sm">
                      These topics will be remediated as John progresses through the Algebra I course.
                    </p>

                    <div className="space-y-4 mt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Functions and Graphing</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>1. Understanding Proportional Relationships Using Graphs</div>
                          <div>2. Understanding Proportional Relationships Using Tables</div>
                          <div>3. Understanding Proportional Relationships From Descriptions</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Numbers and Representation</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>1. Working With Equivalent Ratios</div>
                          <div>2. More on Equivalent Ratios</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Arithmetic</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>1. Adding and Subtracting Radicals</div>
                          <div>2. Finding Lowest Common Multiples Using Prime Factorization</div>
                          <div>3. The Power of Quotient Rule for Exponents</div>
                          <div>4. Combining the Rules of Exponents</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <div className="text-center space-y-3 mb-8">
              <h2 className="text-3xl font-bold text-balance">Create Study Guide</h2>
              <p className="text-muted-foreground text-balance max-w-xl mx-auto">
                Upload files or describe your topic to generate an AI-powered study guide
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-sm border border-gray-200 mb-6">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Upload Materials</h3>
                          <p className="text-sm text-gray-600">PDFs, docs, or images</p>
                        </div>
                      </div>
                      <FileUpload onFilesChange={handleFilesChange} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Describe Topic</h3>
                          <p className="text-sm text-gray-600">Tell us what to study</p>
                        </div>
                      </div>
                      <TextInputArea onTextChange={handleTextChange} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500 font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-center">Quick Start Templates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { topic: "Calculus I", difficulty: "intermediate", icon: "📊" },
                        { topic: "Python Programming", difficulty: "beginner", icon: "🐍" },
                        { topic: "Data Structures", difficulty: "advanced", icon: "🌳" },
                        { topic: "Statistics", difficulty: "intermediate", icon: "📈" },
                      ].map((template) => (
                        <Button
                          key={template.topic}
                          variant="outline"
                          className="h-auto p-4 flex-col gap-2 border-gray-200 bg-transparent"
                          onClick={() =>
                            handleTextChange(`I want to learn ${template.topic}`, template.topic, template.difficulty)
                          }
                        >
                          <span className="text-2xl">{template.icon}</span>
                          <div className="text-center">
                            <div className="font-medium text-sm">{template.topic}</div>
                            <div className="text-xs text-gray-500 capitalize">{template.difficulty}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(studyContent || uploadedFiles.length > 0) && (
                <div className="max-w-2xl mx-auto">
                  <StudyGuideGenerator
                    topic={studyContent?.topic || "Uploaded Content"}
                    difficulty={studyContent?.difficulty || "intermediate"}
                    files={uploadedFiles}
                    textContent={studyContent?.text || ""}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prerequisites">
            <PrerequisitesTracker topic="Calculus" />
          </TabsContent>

          <TabsContent value="progress">
            <XPProgressSystem />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
