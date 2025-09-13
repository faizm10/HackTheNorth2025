import React, { useState } from 'react'
import { Card, Typography, Button, Tag, Progress, List, Space } from 'antd'
import { BulbOutlined, CheckCircleOutlined, ClockCircleOutlined, InteractionOutlined, BookOutlined, AimOutlined, StarOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface StudyGuideSection {
  id: string
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  prerequisites: string[]
  completed: boolean
}

export function StudyGuideGenerator({
  topic,
  difficulty,
  files,
  textContent,
}: {
  topic: string
  difficulty: string
  files: File[]
  textContent: string
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [studyGuide, setStudyGuide] = useState<StudyGuideSection[] | null>(null)

  const generate = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 1200))
    const guide: StudyGuideSection[] = [
      {
        id: '1',
        title: 'Fundamentals and Core Concepts',
        content: `Understanding the basic principles of ${topic}. This section covers the essential building blocks you need to master before moving to more complex topics.`,
        difficulty: 'beginner',
        estimatedTime: 15,
        prerequisites: [],
        completed: false,
      },
      {
        id: '2',
        title: 'Key Terminology and Definitions',
        content: `Master the vocabulary and terminology specific to ${topic}. Learn precise definitions and how they relate to each other.`,
        difficulty: 'beginner',
        estimatedTime: 10,
        prerequisites: ['1'],
        completed: false,
      },
      {
        id: '3',
        title: 'Practical Applications',
        content: `Apply your knowledge of ${topic} to real-world scenarios with examples and case studies.`,
        difficulty: 'intermediate',
        estimatedTime: 25,
        prerequisites: ['1', '2'],
        completed: false,
      },
      {
        id: '4',
        title: 'Advanced Techniques and Methods',
        content: `Explore advanced concepts and methodology in ${topic}.`,
        difficulty: 'advanced',
        estimatedTime: 30,
        prerequisites: ['1', '2', '3'],
        completed: false,
      },
      {
        id: '5',
        title: 'Integration and Synthesis',
        content: `Integrate different aspects of ${topic} into cohesive solutions.`,
        difficulty: 'advanced',
        estimatedTime: 20,
        prerequisites: ['1', '2', '3', '4'],
        completed: false,
      },
    ]
    setStudyGuide(guide)
    setIsGenerating(false)
  }

  const toggle = (id: string) => {
    if (!studyGuide) return
    setStudyGuide(studyGuide.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))
  }

  const difficultyColor = (diff: string) => {
    if (diff === 'beginner') return 'green'
    if (diff === 'intermediate') return 'orange'
    if (diff === 'advanced') return 'red'
    return 'default'
  }

  const completed = studyGuide?.filter((s) => s.completed).length || 0
  const total = studyGuide?.length || 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (!studyGuide) {
    return (
      <Card>
        <Title level={4} style={{ marginBottom: 12 }}>
          <BulbOutlined /> AI Study Guide Generator
        </Title>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">Ready to generate a personalized study guide for:</Text>
          </div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{topic || 'Your uploaded content'}</div>
          <Space>
            <Tag>{difficulty} level</Tag>
            <Tag>{files.length} files uploaded</Tag>
          </Space>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" size="large" loading={isGenerating} onClick={generate} icon={<BulbOutlined />}>
              {isGenerating ? 'Generating Study Guide...' : 'Generate Study Guide'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <AimOutlined /> <Text strong>Study Progress</Text>
          </Space>
          <Tag>{completed}/{total} Complete</Tag>
        </Space>
        <div style={{ marginTop: 12 }}>
          <Progress percent={pct} />
        </div>
      </Card>

      <Card>
        <Title level={5}>
          <BookOutlined /> Study Guide: {topic}
        </Title>
        <List
          itemLayout="vertical"
          dataSource={studyGuide}
          renderItem={(section, index) => {
            const canStart = section.prerequisites.every((id) => studyGuide.find((s) => s.id === id)?.completed)
            return (
              <List.Item key={section.id} style={{ background: section.completed ? '#f6ffed' : undefined, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Space>
                      <Text type="secondary">Section {index + 1}</Text>
                      <Tag color={difficultyColor(section.difficulty)}>{section.difficulty}</Tag>
                    </Space>
                    <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>{section.title}</div>
                    <Text type="secondary">{section.content}</Text>
                    {section.prerequisites.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Space>
                          <InteractionOutlined />
                          <Text type="secondary">Prerequisites:</Text>
                          <Space size={[4, 4]} wrap>
                            {section.prerequisites.map((pid) => (
                              <Tag key={pid} bordered={!studyGuide.find((s) => s.id === pid)?.completed}>
                                Section {pid}
                              </Tag>
                            ))}
                          </Space>
                        </Space>
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      type={section.completed ? 'default' : 'primary'}
                      onClick={() => toggle(section.id)}
                      disabled={!canStart}
                      icon={section.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    >
                      {section.completed ? 'Complete' : `${section.estimatedTime} min`}
                    </Button>
                  </div>
                </div>
              </List.Item>
            )
          }}
        />
      </Card>

      {completed === total && total > 0 && (
        <Card style={{ background: 'linear-gradient(90deg, #f6ffed, #e6fffb)' }}>
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
            <StarOutlined style={{ fontSize: 36, color: '#faad14' }} />
            <Title level={4} style={{ margin: 0 }}>Congratulations!</Title>
            <Text>You\'ve completed your study guide for {topic}. Great work!</Text>
          </Space>
        </Card>
      )}
    </div>
  )
}
