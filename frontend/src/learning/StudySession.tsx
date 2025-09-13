import { useState, type ReactNode } from 'react'
import { Layout, Card, Typography, Progress, Button, Tag, Divider, Alert } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  BookOutlined,
  AimOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { ChatTutor } from './ChatTutor'
import type { CourseUnit } from './types'

const { Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography

export function StudySession({
  guide,
  onBack,
}: {
  guide: { id: number; title: string; overallMastery: number; units: Array<{ name: string; topics: number; mastery: number }> }
  onBack: () => void
}) {
  const [currentUnit, setCurrentUnit] = useState(0)
  const [currentLesson, setCurrentLesson] = useState(0)

  const courseStructure: CourseUnit[] = [
    {
      unitName: 'Vector Operations',
      lessons: [
        {
          title: 'Introduction to Vectors',
          type: 'Lesson',
          xp: 7,
          content:
            'A vector is a mathematical object that has both magnitude (length) and direction. In physics, vectors represent quantities like velocity, force, and displacement. In mathematics, they form the foundation of linear algebra. Vectors can be represented geometrically as arrows or algebraically as ordered lists of numbers.',
          keyPoints: [
            'Vectors have both magnitude and direction',
            'Represented as arrows or coordinate lists',
            'Fundamental to linear algebra and physics',
          ],
          examples:
            '**2D Vector Example:** v = (3, 4) has magnitude sqrt(3^2 + 4^2) = 5. Unit vector: v/|v| = (3/5, 4/5).',
          difficulty: 'beginner',
        },
        {
          title: 'Vector Addition and Scalar Multiplication',
          type: 'Lesson',
          xp: 8,
          content:
            'Vector addition uses the tip-to-tail rule or parallelogram method. Scalar multiplication changes a vector\'s magnitude (and reverses direction for negative scalars). These operations satisfy commutativity, associativity, and distributivity.',
          keyPoints: [
            'Tip-to-tail (parallelogram) rule for addition',
            'Scalar multiplication scales magnitude',
            'Operations satisfy algebraic properties',
          ],
          examples: 'Example: (3,4) + (1,2) = (4,6). 3·(2,1) = (6,3).',
          difficulty: 'beginner',
        },
        {
          title: 'Dot Product and Cross Product',
          type: 'Assessment',
          xp: 15,
          content:
            'The dot product measures directional similarity and yields a scalar. The cross product (in 3D) yields a vector perpendicular to both inputs. These have important geometric and physical interpretations.',
          keyPoints: [
            'Dot product relates to angles and projections',
            'Cross product gives perpendicular vector in 3D',
            'Used widely in physics and graphics',
          ],
          examples:
            'Dot: u·v = |u||v|cosθ. For u=(2,1), v=(1,3) → 2*1 + 1*3 = 5. Cross: u×v uses 3×3 determinant with i, j, k.',
          difficulty: 'intermediate',
        },
      ],
    },
    {
      unitName: 'Matrix Fundamentals',
      lessons: [
        {
          title: 'Introduction to Matrices',
          type: 'Lesson',
          xp: 8,
          content:
            'A matrix is a rectangular array of numbers used to represent linear transformations, systems of equations, and data. Matrices are described by their dimensions m×n and include special types like identity and zero matrices.',
          keyPoints: [
            'Rectangular arrays with rows and columns',
            'Represent transformations and systems',
            'Identified by dimensions (m×n)',
          ],
          examples: '2×3 matrix: [[1,2,3],[4,5,6]]. Identity: [[1,0],[0,1]].',
          difficulty: 'beginner',
        },
        {
          title: 'Matrix Operations',
          type: 'Lesson',
          xp: 10,
          content:
            'Addition and subtraction are element-wise. Multiplication uses the row-by-column rule and represents composition of transformations. Matrix multiplication is generally not commutative.',
          keyPoints: [
            'Add/subtract element-wise',
            'Row-by-column multiplication',
            'Not commutative in general',
          ],
          examples:
            'For A=[[1,2],[3,4]], B=[[5,6],[7,8]], AB=[[19,22],[43,50]].',
          difficulty: 'intermediate',
        },
      ],
    },
    {
      unitName: 'Linear Transformations',
      lessons: [
        {
          title: 'Understanding Linear Transformations',
          type: 'Lesson',
          xp: 12,
          content:
            'A linear transformation preserves vector addition and scalar multiplication and can be represented by a matrix. Common transformations include rotations, reflections, scaling, and projections.',
          keyPoints: [
            'Preserve addition and scalar multiplication',
            'Represented by matrices',
            'Connect algebra with geometry',
          ],
          examples:
            'Rotation (2D): [[cosθ, -sinθ],[sinθ, cosθ]]. Scaling: [[a,0],[0,b]].',
          difficulty: 'intermediate',
        },
      ],
    },
  ]

  const currentUnitData = courseStructure[currentUnit]
  const currentLessonData = currentUnitData.lessons[currentLesson]

  const totalLessons = courseStructure.reduce((sum, u) => sum + u.lessons.length, 0)
  const currentIndex = courseStructure.slice(0, currentUnit).reduce((s, u) => s + u.lessons.length, 0) + currentLesson
  const progressPct = ((currentIndex + 1) / totalLessons) * 100

  const nextLesson = () => {
    if (currentLesson < currentUnitData.lessons.length - 1) {
      setCurrentLesson((c) => c + 1)
    } else if (currentUnit < courseStructure.length - 1) {
      setCurrentUnit((u) => u + 1)
      setCurrentLesson(0)
    }
  }

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson((c) => c - 1)
    } else if (currentUnit > 0) {
      setCurrentUnit((u) => u - 1)
      setCurrentLesson(courseStructure[currentUnit - 1].lessons.length - 1)
    }
  }

  const difficultyColor = (d?: string) => {
    switch (d) {
      case 'beginner':
        return 'green'
      case 'intermediate':
        return 'orange'
      case 'advanced':
        return 'red'
      default:
        return 'default'
    }
  }

  const typeIcon = (t: string) => {
    if (t === 'Assessment') return <CheckCircleOutlined />
    if (t === 'Lesson') return <BookOutlined />
    return <AimOutlined />
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Sider width={300} theme="light" style={{ padding: 16, borderRight: '1px solid #f0f0f0' }}>
        <Button onClick={onBack} style={{ marginBottom: 12 }} icon={<LeftOutlined />}>Back to Study</Button>
        <Title level={4} style={{ margin: 0 }}>{guide.title}</Title>
        <Text type="secondary">{currentUnitData.unitName} • Lesson {currentLesson + 1} of {currentUnitData.lessons.length}</Text>
        <div style={{ marginTop: 12 }}>
          <Progress percent={Math.round(progressPct)} size="small" />
        </div>

        <Divider />
        <Title level={5}>Course Units</Title>
        {courseStructure.map((unit, unitIndex) => (
          <Card key={unit.unitName} size="small" style={{ marginBottom: 8 }} bodyStyle={{ padding: 8 }}>
            <Text strong style={{ fontSize: 12 }}>{unit.unitName}</Text>
            <div style={{ marginTop: 8 }}>
              {unit.lessons.map((lesson, lessonIndex) => {
                const active = unitIndex === currentUnit && lessonIndex === currentLesson
                return (
                  <div
                    key={lesson.title}
                    onClick={() => { setCurrentUnit(unitIndex); setCurrentLesson(lessonIndex) }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: active ? '#e6f7ff' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <SpaceBetween>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {typeIcon(lesson.type)}
                        <Text style={{ fontSize: 12 }}>{lesson.title}</Text>
                      </span>
                      <Tag color="blue">{lesson.xp} XP</Tag>
                    </SpaceBetween>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </Sider>

      <Content style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {typeIcon(currentLessonData.type)}
                <Text type="secondary">{currentLessonData.type}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={difficultyColor(currentLessonData.difficulty)}>{currentLessonData.difficulty}</Tag>
                <Tag>{currentLessonData.xp} XP</Tag>
              </div>
            </div>
            <Title level={3} style={{ marginTop: 8 }}>{currentLessonData.title}</Title>

            <Paragraph style={{ fontSize: 16 }}>{currentLessonData.content}</Paragraph>

            {currentLessonData.keyPoints && (
              <div style={{ marginTop: 16 }}>
                <Title level={5} style={{ marginBottom: 8 }}><AimOutlined /> Key Learning Points</Title>
                <ul>
                  {currentLessonData.keyPoints.map((p) => (
                    <li key={p} style={{ marginBottom: 6 }}>
                      <Text>{p}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentLessonData.examples && (
              <div style={{ marginTop: 16 }}>
                <Title level={5} style={{ marginBottom: 8 }}><BulbOutlined /> Examples & Applications</Title>
                <Card size="small" style={{ background: '#fffbe6' }}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{currentLessonData.examples}</Text>
                </Card>
              </div>
            )}

            <Alert
              showIcon
              type="success"
              message="Study Tip"
              icon={<InfoCircleOutlined />}
              description={
                <Text>
                  {currentLessonData.type === 'Assessment'
                    ? 'Take your time with this assessment. Review the key concepts before proceeding.'
                    : 'Practice the examples and visualize the geometric interpretations when possible.'}
                </Text>
              }
              style={{ marginTop: 16 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <Button onClick={prevLesson} disabled={currentUnit === 0 && currentLesson === 0} icon={<LeftOutlined />}>Previous</Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999' }}>
                <ClockCircleOutlined /> <Text type="secondary">Estimated time: 15-20 minutes</Text>
              </div>
              <Button type="primary" onClick={nextLesson} icon={<RightOutlined />}>
                {currentUnit === courseStructure.length - 1 && currentLesson === currentUnitData.lessons.length - 1 ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 16 }}>
          <ChatTutor
            key={`${guide.title}::${currentUnitData.unitName}::${currentLessonData.title}`}
            currentTopic={`${guide.title} - ${currentUnitData.unitName}: ${currentLessonData.title}`}
            lessonContent={currentLessonData.content}
          />
        </div>
      </Content>
    </Layout>
  )
}

function SpaceBetween({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>{children}</div>
}
