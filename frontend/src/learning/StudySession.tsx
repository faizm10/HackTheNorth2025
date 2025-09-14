import { useEffect, useState } from 'react'
import { Layout, Card, Typography, Progress, Button, Divider } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  BookOutlined,
  AimOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { ChatTutor } from './ChatTutor'
import type { CourseUnit, StudyGuide } from './types'

const { Sider, Content } = Layout
const { Title, Text } = Typography

export function StudySession({
  guide,
  onBack,
  onProgress,
}: {
  guide: StudyGuide
  onBack: () => void
  onProgress?: (guideId: number, data: { unitIndex: number; lessonIndex: number; currentIndex: number; totalLessons: number; lessonTitle: string }) => void
}) {
  const [currentUnit, setCurrentUnit] = useState(0)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLinear, setCompletedLinear] = useState(-1) // highest completed linear index

  const courseStructure: CourseUnit[] = guide.sections && guide.sections.length > 0
    ? [
        {
          unitName: 'Lessons',
          lessons: guide.sections.map((s) => ({
            title: s.title,
            type: 'Lesson',
            xp: 10,
            content: s.content || '',
          })),
        },
      ]
    : [
    {
      unitName: "Vector Operations",
      lessons: [
        {
          title: "Introduction to Vectors",
          type: "Lesson",
          xp: 7,
          content:
            "A vector is a mathematical object that has both magnitude (length) and direction. In physics, vectors represent quantities like velocity, force, and displacement. In mathematics, they form the foundation of linear algebra. Vectors can be represented geometrically as arrows or algebraically as ordered lists of numbers.",
          keyPoints: [
            "Vectors have both magnitude and direction",
            "Represented as arrows or coordinate lists",
            "Fundamental to linear algebra and physics",
          ],
          examples:
            "**2D Vector Example:** v = (3, 4) has magnitude sqrt(3^2 + 4^2) = 5. Unit vector: v/|v| = (3/5, 4/5).",
          difficulty: "beginner",
        },
        {
          title: "Vector Addition and Scalar Multiplication",
          type: "Lesson",
          xp: 8,
          content:
            "Vector addition uses the tip-to-tail rule or parallelogram method. Scalar multiplication changes a vector's magnitude (and reverses direction for negative scalars). These operations satisfy commutativity, associativity, and distributivity.",
          keyPoints: [
            "Tip-to-tail (parallelogram) rule for addition",
            "Scalar multiplication scales magnitude",
            "Operations satisfy algebraic properties",
          ],
          examples: "Example: (3,4) + (1,2) = (4,6). 3·(2,1) = (6,3).",
          difficulty: "beginner",
        },
        {
          title: "Dot Product and Cross Product",
          type: "Assessment",
          xp: 15,
          content:
            "The dot product measures directional similarity and yields a scalar. The cross product (in 3D) yields a vector perpendicular to both inputs. These have important geometric and physical interpretations.",
          keyPoints: [
            "Dot product relates to angles and projections",
            "Cross product gives perpendicular vector in 3D",
            "Used widely in physics and graphics",
          ],
          examples:
            "Dot: u·v = |u||v|cosθ. For u=(2,1), v=(1,3) → 2*1 + 1*3 = 5. Cross: u×v uses 3×3 determinant with i, j, k.",
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
          content:
            "A matrix is a rectangular array of numbers used to represent linear transformations, systems of equations, and data. Matrices are described by their dimensions m×n and include special types like identity and zero matrices.",
          keyPoints: [
            "Rectangular arrays with rows and columns",
            "Represent transformations and systems",
            "Identified by dimensions (m×n)",
          ],
          examples: "2×3 matrix: [[1,2,3],[4,5,6]]. Identity: [[1,0],[0,1]].",
          difficulty: "beginner",
        },
        {
          title: "Matrix Operations",
          type: "Lesson",
          xp: 10,
          content:
            "Addition and subtraction are element-wise. Multiplication uses the row-by-column rule and represents composition of transformations. Matrix multiplication is generally not commutative.",
          keyPoints: [
            "Add/subtract element-wise",
            "Row-by-column multiplication",
            "Not commutative in general",
          ],
          examples:
            "For A=[[1,2],[3,4]], B=[[5,6],[7,8]], AB=[[19,22],[43,50]].",
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
          content:
            "A linear transformation preserves vector addition and scalar multiplication and can be represented by a matrix. Common transformations include rotations, reflections, scaling, and projections.",
          keyPoints: [
            "Preserve addition and scalar multiplication",
            "Represented by matrices",
            "Connect algebra with geometry",
          ],
          examples:
            "Rotation (2D): [[cosθ, -sinθ],[sinθ, cosθ]]. Scaling: [[a,0],[0,b]].",
          difficulty: "intermediate",
        },
      ],
    },
  ];

  /** Currently selected unit data from the course structure */
  const currentUnitData = courseStructure[currentUnit];

  /** Currently selected lesson data within the current unit */
  const currentLessonData = currentUnitData.lessons[currentLesson];

  const toLinearIndex = (unitIdx: number, lessonIdx: number) =>
    courseStructure.slice(0, unitIdx).reduce((s, u) => s + u.lessons.length, 0) + lessonIdx

  const totalLessons = courseStructure.reduce((sum, u) => sum + u.lessons.length, 0)
  const currentIndex = toLinearIndex(currentUnit, currentLesson)
  const progressPct = ((currentIndex + 1) / totalLessons) * 100

  // Quiz is disabled in current design; allow linear continue
  const canContinue = true

  const nextLesson = () => {
    // Block continuing if assessment not passed
    if (!canContinue) return
    // Mark current as completed
    const currLi = toLinearIndex(currentUnit, currentLesson)
    setCompletedLinear((prev) => Math.max(prev, currLi))

    // Navigate to next
    if (currentLesson < currentUnitData.lessons.length - 1) {
      setCurrentLesson((c) => c + 1);
    } else if (currentUnit < courseStructure.length - 1) {
      setCurrentUnit((u) => u + 1);
      setCurrentLesson(0);
    }
  };

  /**
   * Goes back to the previous lesson in the course sequence.
   *
   * Navigation Logic:
   * 1. If not at first lesson in unit → go to previous lesson
   * 2. If at first lesson but not first unit → go to last lesson of previous unit
   * 3. If at very first lesson → no action (stay on first lesson)
   *
   * This enables backward navigation while maintaining the logical
   * course flow and unit structure.
   */
  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson((c) => c - 1);
    } else if (currentUnit > 0) {
      setCurrentUnit((u) => u - 1);
      setCurrentLesson(courseStructure[currentUnit - 1].lessons.length - 1);
    }
  }

  // Difficulty chip removed per design

  const typeIcon = (t: string) => {
    if (t === 'Assessment') return <CheckCircleOutlined />
    if (t === 'Lesson') return <BookOutlined />
    return <AimOutlined />
  }

  // Report progress upward whenever unit/lesson changes
  useEffect(() => {
    if (!onProgress) return
    onProgress(guide.id, {
      unitIndex: currentUnit,
      lessonIndex: currentLesson,
      currentIndex,
      totalLessons,
      lessonTitle: currentLessonData.title,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUnit, currentLesson, totalLessons])

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Sider width={240} theme="light" style={{ padding: 16, borderRight: '1px solid #f0f0f0' }}>
        <Button onClick={onBack} style={{ marginBottom: 12 }} icon={<LeftOutlined />}>Back to Study</Button>
        <Title level={4} style={{ margin: 0 }}>{currentLessonData.title}</Title>
        <Text type="secondary">{currentUnitData.unitName} • Lesson {currentLesson + 1} of {currentUnitData.lessons.length}</Text>
        <div style={{ marginTop: 12 }}>
          <Progress percent={Math.round(progressPct)} size="small" />
        </div>

        <Divider />
        <Title level={5}>Course Units</Title>
        {courseStructure.map((unit, unitIndex) => (
          <Card
            key={unit.unitName}
            size="small"
            style={{ marginBottom: 8 }}
            bodyStyle={{ padding: 8 }}
          >
            <Text strong style={{ fontSize: 12 }}>
              {unit.unitName}
            </Text>
            <div style={{ marginTop: 8 }}>
              {unit.lessons.map((lesson, lessonIndex) => {
                const active = unitIndex === currentUnit && lessonIndex === currentLesson
                const li = toLinearIndex(unitIndex, lessonIndex)
                const completed = li <= completedLinear
                const unlocked = li <= completedLinear + 1
                return (
                  <div
                    key={lesson.title}
                    onClick={() => {
                      if (unlocked) {
                        setCurrentUnit(unitIndex)
                        setCurrentLesson(lessonIndex)
                      }
                    }}
                    style={{
                      padding: "6px 8px",
                      borderRadius: 6,
                      cursor: unlocked ? 'pointer' : 'not-allowed',
                      background: active ? '#e6f7ff' : undefined,
                      opacity: unlocked ? 1 : 0.6,
                      display: 'grid',
                      gridTemplateColumns: '1fr 24px',
                      columnGap: 8,
                      alignItems: 'center',
                      minHeight: 28,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      {typeIcon(lesson.type)}
                      <Text style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</Text>
                    </span>
                    <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {completed ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : !unlocked ? (
                        <LockOutlined style={{ color: '#999' }} />
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </Sider>

      <Content
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateRows: "auto 1fr",
            gap: 12,
          }}
        >
          {/* Header Card */}
          <Card bodyStyle={{ padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {typeIcon(currentLessonData.type)}
                <Text type="secondary">{currentLessonData.type}</Text>
              </div>
              <div />
            </div>
            <Title level={4} style={{ margin: "4px 0 0" }}>
              {currentLessonData.title}
            </Title>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <Button size="small" onClick={prevLesson} disabled={currentUnit === 0 && currentLesson === 0} icon={<LeftOutlined />}>Previous</Button>
              <div />
              <Button size="small" type="primary" onClick={nextLesson} icon={<RightOutlined />} disabled={!canContinue}>
                {currentUnit === courseStructure.length - 1 && currentLesson === currentUnitData.lessons.length - 1 ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </Card>

          {/* Two-column main area: left chat, right quiz */}
          <div >
            {/* <div style={{ minHeight: 0 }}> */}
              <ChatTutor
                key={`${guide.title}::${currentUnitData.unitName}::${currentLessonData.title}`}
                currentTopic={currentLessonData.title}
                lessonContent={currentLessonData.content}
                initialLessonText={currentLessonData.content}
                moduleName={`${guide.title} - ${currentUnitData.unitName}`}
                requirements={
                  currentLessonData.keyPoints &&
                  currentLessonData.keyPoints.length > 0
                    ? currentLessonData.keyPoints
                    : undefined
                }
              />
       {/* removed the quiz */}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
