import React, { useMemo, useState } from 'react'
import { Card, Typography, Tag, Progress, Button, Space, List } from 'antd'
import { CheckCircleTwoTone, LockOutlined, UnlockOutlined, ClockCircleOutlined, RocketOutlined, StarOutlined, AimOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export interface Prerequisite {
  id: string
  title: string
  description: string
  completed: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  dependsOn: string[]
}

export function PrerequisitesTracker({ topic }: { topic: string }) {
  const [prereqs, setPrereqs] = useState<Prerequisite[]>([
    { id: 'math-basics', title: 'Basic Mathematics', description: 'Arithmetic operations, fractions, decimals, and percentages', completed: true, difficulty: 'beginner', estimatedTime: 30, dependsOn: [] },
    { id: 'algebra', title: 'Algebra Fundamentals', description: 'Variables, equations, inequalities, and linear functions', completed: true, difficulty: 'intermediate', estimatedTime: 45, dependsOn: ['math-basics'] },
    { id: 'functions', title: 'Functions and Graphs', description: 'Function notation, domain/range, and coordinate graphing', completed: true, difficulty: 'intermediate', estimatedTime: 60, dependsOn: ['algebra'] },
    { id: 'trigonometry', title: 'Basic Trigonometry', description: 'Sine, cosine, tangent, and unit circle concepts', completed: false, difficulty: 'intermediate', estimatedTime: 75, dependsOn: ['functions'] },
    { id: 'limits', title: 'Limits and Continuity', description: 'Concept of limits, one-sided limits, and continuous functions', completed: false, difficulty: 'advanced', estimatedTime: 90, dependsOn: ['functions', 'trigonometry'] },
    { id: 'derivatives-intro', title: 'Introduction to Derivatives', description: 'Definition of derivative and basic differentiation rules', completed: false, difficulty: 'advanced', estimatedTime: 120, dependsOn: ['limits'] },
  ])

  const isUnlocked = (p: Prerequisite) => p.dependsOn.every((id) => prereqs.find((q) => q.id === id)?.completed)

  const stats = useMemo(() => {
    const totalTime = prereqs.reduce((s, p) => s + p.estimatedTime, 0)
    const completedTime = prereqs.filter((p) => p.completed).reduce((s, p) => s + p.estimatedTime, 0)
    const completedCount = prereqs.filter((p) => p.completed).length
    const totalCount = prereqs.length
    const nextMilestone = prereqs.find((p) => !p.completed && isUnlocked(p))
    const progress = Math.round((completedCount / totalCount) * 100)
    return { totalTime, completedTime, completedCount, totalCount, nextMilestone, progress }
  }, [prereqs])

  const difficultyColor = (d: Prerequisite['difficulty']) => {
    if (d === 'beginner') return 'green'
    if (d === 'intermediate') return 'orange'
    return 'red'
  }

  const toggle = (id: string) => {
    setPrereqs((prev) => prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)))
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Prerequisites for {topic}</Title>
        <Text type="secondary">Master these foundational concepts to unlock advanced topics</Text>
      </div>

      {/* Progress Overview */}
      <Card style={{ background: 'linear-gradient(135deg,#f6ffed,#e6f7ff)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <AimOutlined /> <Text strong>Learning Path Progress</Text>
            </Space>
            <Tag>{stats.completedCount}/{stats.totalCount} Complete</Tag>
          </Space>
          <Progress percent={stats.progress} strokeColor="#52c41a" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>{Math.round(stats.completedTime / 60)}h</div>
              <Text type="secondary">Time Invested</Text>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{Math.round((stats.totalTime - stats.completedTime) / 60)}h</div>
              <Text type="secondary">Remaining</Text>
            </Card>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#722ed1' }}>{prereqs.filter((p) => isUnlocked(p) && !p.completed).length}</div>
              <Text type="secondary">Available</Text>
            </Card>
          </div>
        </Space>
      </Card>

      {/* Prerequisites List */}
      <List
        itemLayout="vertical"
        dataSource={prereqs}
        renderItem={(p) => {
          const unlocked = isUnlocked(p)
          return (
            <List.Item style={{ opacity: p.completed ? 1 : unlocked ? 1 : 0.6 }}>
              <Card
                style={{
                  borderColor: p.completed ? '#b7eb8f' : unlocked ? '#f0f0f0' : '#f0f0f0',
                  background: p.completed ? '#f6ffed' : unlocked ? '#fff' : '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Space>
                      {p.completed ? (
                        <CheckCircleTwoTone twoToneColor="#52c41a" />
                      ) : unlocked ? (
                        <UnlockOutlined />
                      ) : (
                        <LockOutlined />
                      )}
                      <Title level={5} style={{ margin: 0 }}>
                        {p.title}
                      </Title>
                      <Tag color={difficultyColor(p.difficulty)}>{p.difficulty}</Tag>
                      <Tag icon={<ClockCircleOutlined />}>
                        {p.estimatedTime} min
                      </Tag>
                    </Space>
                    <div>
                      <Text type="secondary">{p.description}</Text>
                    </div>
                    {p.dependsOn.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <Text type="secondary">Prerequisites:</Text>
                          <Space size={[4, 4]} wrap>
                            {p.dependsOn.map((depId) => {
                              const dep = prereqs.find((q) => q.id === depId)
                              const done = dep?.completed
                              return (
                                <Tag key={depId} color={done ? 'green' : undefined} bordered={!done}>
                                  {dep?.title}
                                </Tag>
                              )
                            })}
                          </Space>
                        </Space>
                      </div>
                    )}
                  </div>
                  <div>
                    {unlocked && !p.completed && (
                      <Button type="primary" icon={<RocketOutlined />} onClick={() => toggle(p.id)}>
                        Start Learning
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </List.Item>
          )
        }}
      />

      {/* Next Milestone */}
      {stats.nextMilestone && (
        <Card style={{ background: 'linear-gradient(135deg,#e6f7ff,#f9f0ff)' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <StarOutlined /> <Text strong>Next Milestone</Text>
            </Space>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{stats.nextMilestone.title}</div>
                <Text type="secondary">{stats.nextMilestone.description}</Text>
              </div>
              <Button type="primary" onClick={() => toggle(stats.nextMilestone!.id)}>
                Start Now
              </Button>
            </div>
          </Space>
        </Card>
      )}
    </div>
  )
}
