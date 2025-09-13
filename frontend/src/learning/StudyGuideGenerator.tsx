import { useEffect, useState } from 'react'
import { Card, Typography, Button, Tag, Progress, List, Space, Alert } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, InteractionOutlined, BookOutlined, AimOutlined, StarOutlined } from '@ant-design/icons'
import { ApiClient, type ProcessedResult } from '../lib/api'

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
  onStudyGuideGenerated,
  autoStartKey,
  onGeneratingChange,
}: {
  topic: string
  difficulty: string
  files: File[]
  textContent: string
  onStudyGuideGenerated?: (topic: string, sections: StudyGuideSection[]) => void
  autoStartKey?: number
  onGeneratingChange?: (loading: boolean) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [studyGuide, setStudyGuide] = useState<StudyGuideSection[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Allow parent to trigger generation (upper button)
  useEffect(() => {
    if (autoStartKey === undefined) return
    if (studyGuide) return
    if (isGenerating) return
    // Kick off generation
    void generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartKey])

  const generate = async () => {
    setIsGenerating(true)
    if (onGeneratingChange) onGeneratingChange(true)
    setError(null)
    // status banners removed; keep UI clean during generation

    try {
      let finalText = textContent

      // If we have files but no text content, extract text from files first
      if (files.length > 0 && (!textContent || textContent.length < 100)) {
        
        const extractionResult = await ApiClient.uploadAndProcess(files)

        if (!extractionResult.success) {
          throw new Error(extractionResult.error || 'Failed to extract text from files')
        }

        if (extractionResult.data) {
          // Use the processed result directly
          const processedData = extractionResult.data.processedResult
          const studyGuideSections = convertToStudyGuideSections(processedData, topic)
          setStudyGuide(studyGuideSections)
          // Notify parent component about the generated study guide
          if (onStudyGuideGenerated) {
            onStudyGuideGenerated(topic, studyGuideSections)
          }
          setIsGenerating(false)
          return
        }
      }

      // If we have text content, process it directly
      if (finalText && finalText.length > 100) {
        
        const processResult = await ApiClient.processText(finalText)

        if (!processResult.success) {
          throw new Error(processResult.error || 'Failed to process text')
        }

        if (processResult.data) {
          const studyGuideSections = convertToStudyGuideSections(processResult.data, topic)
          setStudyGuide(studyGuideSections)
          // Notify parent component about the generated study guide
          if (onStudyGuideGenerated) {
            onStudyGuideGenerated(topic, studyGuideSections)
          }
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
      if (onGeneratingChange) onGeneratingChange(false)
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

  const toggle = (id: string) => {
    if (!studyGuide) return
    setStudyGuide(studyGuide.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))
  }

  // Difficulty tags hidden per design; color mapping removed

  const completed = studyGuide?.filter((s) => s.completed).length || 0
  const total = studyGuide?.length || 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (!studyGuide) {
    // Hide generating/spinner UI entirely; only show errors if they occur
    if (!error) return null
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
          />
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }} data-difficulty={difficulty}>
      {/* Success banner moved to parent layout; no in-component success banner */}
      
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
                      {section.completed ? 'Complete' : 'Mark Complete'}
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
