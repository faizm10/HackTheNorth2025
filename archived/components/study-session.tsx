"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  BookOpen,
  Target,
  Clock,
  ArrowLeft,
  Lightbulb,
  AlertCircle,
} from "lucide-react"

interface StudySessionProps {
  guide: {
    id: number
    title: string
    overallMastery: number
    units: Array<{
      name: string
      topics: number
      mastery: number
    }>
  }
  onBack: () => void
}

export function StudySession({ guide, onBack }: StudySessionProps) {
  const [currentUnit, setCurrentUnit] = useState(0)
  const [currentLesson, setCurrentLesson] = useState(0)

  const courseStructure = [
    {
      unitName: "Vector Operations",
      lessons: [
        {
          title: "Introduction to Vectors",
          type: "Lesson",
          xp: 7,
          content: `A vector is a mathematical object that has both magnitude (length) and direction. In physics, vectors represent quantities like velocity, force, and displacement. In mathematics, they form the foundation of linear algebra.

Vectors can be represented in multiple ways: geometrically as arrows, algebraically as ordered lists of numbers, or abstractly as elements of vector spaces.`,
          keyPoints: [
            "Vectors have both magnitude and direction",
            "Can be represented as arrows or coordinate lists",
            "Form the building blocks of linear algebra",
            "Used extensively in physics and engineering",
          ],
          examples: `**2D Vector Example:** The vector $$\\vec{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$$ represents a displacement of 3 units right and 4 units up.

**Magnitude:** $$|\\vec{v}| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$$

**Unit Vector:** $$\\hat{v} = \\frac{\\vec{v}}{|\\vec{v}|} = \\begin{bmatrix} 3/5 \\\\ 4/5 \\end{bmatrix}$$`,
          difficulty: "beginner",
        },
        {
          title: "Vector Addition and Scalar Multiplication",
          type: "Lesson",
          xp: 8,
          content: `Vector addition combines two vectors to produce a resultant vector. Geometrically, this follows the "tip-to-tail" rule or parallelogram method. Scalar multiplication changes a vector's magnitude and potentially its direction.

These operations satisfy important algebraic properties including commutativity, associativity, and distributivity, making vectors behave like familiar algebraic objects.`,
          keyPoints: [
            "Vector addition follows the parallelogram rule",
            "Scalar multiplication scales magnitude",
            "Operations satisfy algebraic properties",
            "Negative scalars reverse direction",
          ],
          examples: `**Vector Addition:** If $$\\vec{u} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}$$ and $$\\vec{v} = \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix}$$, then:
$$\\vec{u} + \\vec{v} = \\begin{bmatrix} 2+1 \\\\ 1+3 \\end{bmatrix} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$$

**Scalar Multiplication:** $$3\\vec{u} = 3\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 6 \\\\ 3 \\end{bmatrix}$$`,
          difficulty: "beginner",
        },
        {
          title: "Dot Product and Cross Product",
          type: "Assessment",
          xp: 15,
          content: `The dot product (scalar product) measures how much two vectors point in the same direction. It produces a scalar value and has geometric interpretations related to angles and projections.

The cross product (vector product) creates a new vector perpendicular to both input vectors. It's particularly important in 3D geometry and physics applications.`,
          keyPoints: [
            "Dot product measures directional similarity",
            "Cross product creates perpendicular vectors",
            "Both have important geometric interpretations",
            "Used extensively in physics and computer graphics",
          ],
          examples: `**Dot Product:** $$\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta$$

For $$\\vec{u} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}$$ and $$\\vec{v} = \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix}$$:
$$\\vec{u} \\cdot \\vec{v} = 2(1) + 1(3) = 5$$

**Cross Product (3D):** $$\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}$$`,
          difficulty: "intermediate",
        },
      ],
    },
    {
      unitName: "Matrix Fundamentals",
      lessons: [
        {
          title: "Introduction to Matrices",
          type: "Lesson",
          xp: 8,
          content: `A matrix is a rectangular array of numbers arranged in rows and columns. Matrices provide a compact way to represent and manipulate systems of linear equations, transformations, and data.

Matrix notation and terminology are essential for understanding linear algebra. We classify matrices by their dimensions and special properties.`,
          keyPoints: [
            "Matrices are rectangular arrays of numbers",
            "Classified by dimensions (m × n)",
            "Represent systems of equations efficiently",
            "Foundation for linear transformations",
          ],
          examples: `**Matrix Example:** $$A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}$$ is a 2×3 matrix.

**Special Matrices:**
- Identity: $$I = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$$
- Zero: $$O = \\begin{bmatrix} 0 & 0 \\\\ 0 & 0 \\end{bmatrix}$$`,
          difficulty: "beginner",
        },
        {
          title: "Matrix Operations",
          type: "Lesson",
          xp: 10,
          content: `Matrix addition, subtraction, and scalar multiplication follow element-wise rules similar to vectors. Matrix multiplication, however, follows a more complex row-by-column rule that reflects composition of linear transformations.

Understanding these operations is crucial for solving systems of equations and working with linear transformations.`,
          keyPoints: [
            "Addition/subtraction are element-wise",
            "Multiplication follows row-by-column rule",
            "Matrix multiplication is not commutative",
            "Operations have geometric interpretations",
          ],
          examples: `**Matrix Multiplication:** For $$A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$$ and $$B = \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}$$:

$$AB = \\begin{bmatrix} 1(5)+2(7) & 1(6)+2(8) \\\\ 3(5)+4(7) & 3(6)+4(8) \\end{bmatrix} = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}$$`,
          difficulty: "intermediate",
        },
      ],
    },
    {
      unitName: "Linear Transformations",
      lessons: [
        {
          title: "Understanding Linear Transformations",
          type: "Lesson",
          xp: 12,
          content: `A linear transformation is a function between vector spaces that preserves vector addition and scalar multiplication. Every linear transformation can be represented by matrix multiplication.

Linear transformations include rotations, reflections, scaling, and projections. Understanding their properties helps visualize how matrices act on geometric objects.`,
          keyPoints: [
            "Preserve vector addition and scalar multiplication",
            "Represented by matrix multiplication",
            "Include rotations, reflections, scaling",
            "Connect algebra with geometry",
          ],
          examples: `**Rotation Matrix (2D):** Rotate by angle θ:
$$R(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}$$

**Scaling Matrix:** Scale by factors a, b:
$$S = \\begin{bmatrix} a & 0 \\\\ 0 & b \\end{bmatrix}$$`,
          difficulty: "intermediate",
        },
      ],
    },
  ]

  const currentUnitData = courseStructure[currentUnit]
  const currentLessonData = currentUnitData.lessons[currentLesson]
  const totalLessons = courseStructure.reduce((sum, unit) => sum + unit.lessons.length, 0)
  const currentLessonIndex =
    courseStructure.slice(0, currentUnit).reduce((sum, unit) => sum + unit.lessons.length, 0) + currentLesson
  const progressPercentage = ((currentLessonIndex + 1) / totalLessons) * 100

  const handleContinue = () => {
    if (currentLesson < currentUnitData.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    } else if (currentUnit < courseStructure.length - 1) {
      setCurrentUnit(currentUnit + 1)
      setCurrentLesson(0)
    }
  }

  const handlePrevious = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1)
    } else if (currentUnit > 0) {
      setCurrentUnit(currentUnit - 1)
      setCurrentLesson(courseStructure[currentUnit - 1].lessons.length - 1)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Assessment":
        return <CheckCircle className="h-4 w-4" />
      case "Lesson":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Study
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-blue-600">{guide.title}</h1>
                <p className="text-sm text-gray-600">
                  {currentUnitData.unitName} • Lesson {currentLesson + 1} of {currentUnitData.lessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</div>
                <div className="text-xs text-gray-500">15-20 min remaining</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Unit Navigation */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border border-gray-200 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Course Units
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseStructure.map((unit, unitIndex) => (
                  <div key={unitIndex} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">{unit.unitName}</h4>
                    <div className="space-y-1">
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lessonIndex}
                          onClick={() => {
                            setCurrentUnit(unitIndex)
                            setCurrentLesson(lessonIndex)
                          }}
                          className={`w-full text-left p-2 rounded text-xs transition-colors ${
                            unitIndex === currentUnit && lessonIndex === currentLesson
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {getTypeIcon(lesson.type)}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{lesson.title}</div>
                              <div className="text-gray-500">{lesson.xp} XP</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(currentLessonData.type)}
                      <span className="text-sm font-medium text-blue-600">{currentLessonData.type}</span>
                    </div>
                    <CardTitle className="text-2xl">{currentLessonData.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(currentLessonData.difficulty)}>
                      {currentLessonData.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentLessonData.xp} XP</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Content */}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{currentLessonData.content}</p>
                </div>

                {/* Key Points */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Learning Points
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {currentLessonData.keyPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Examples & Applications
                  </h3>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm text-amber-800 whitespace-pre-line">{currentLessonData.examples}</div>
                  </div>
                </div>

                {/* Study Tip */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Study Tip</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {currentLessonData.type === "Assessment"
                          ? "Take your time with this assessment. Review the key concepts before proceeding."
                          : "Practice the examples by hand and try to visualize the geometric interpretations when possible."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentUnit === 0 && currentLesson === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Estimated time: 15-20 minutes
              </div>

              <Button
                onClick={handleContinue}
                disabled={
                  currentUnit === courseStructure.length - 1 && currentLesson === currentUnitData.lessons.length - 1
                }
                className="flex items-center gap-2"
              >
                {currentUnit === courseStructure.length - 1 && currentLesson === currentUnitData.lessons.length - 1
                  ? "Complete"
                  : "Continue"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
