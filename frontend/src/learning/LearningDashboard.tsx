import { useState } from 'react'
import { Tabs, Layout, Card, Typography, Button, Progress, Row, Col, Space, List } from 'antd'
import { UploadOutlined, BulbOutlined, AimOutlined, BookOutlined, CheckCircleOutlined, RocketOutlined, RiseOutlined, FileTextOutlined, RightOutlined } from '@ant-design/icons'
import { FileUpload } from './FileUpload'
import { TextInputArea } from './TextInputArea'
import { StudyGuideGenerator } from './StudyGuideGenerator'
import { HealthCheck } from './HealthCheck'
// Prerequisites tab removed
// XP features removed
import { StudySession } from './StudySession'
import type { StudyGuide } from './types'

const { Header, Content } = Layout
const { Title, Text } = Typography

export function LearningDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState<string>("")
  const [studyContent, setStudyContent] = useState<{ text: string; topic: string; difficulty: string } | null>(null)
  const [activeStudySession, setActiveStudySession] = useState<StudyGuide | null>(null)
  const [generatorStartKey, setGeneratorStartKey] = useState<number>(0)
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false)
  const [generationLoading, setGenerationLoading] = useState<boolean>(false)
  const [activeStudyGuides, setActiveStudyGuides] = useState<StudyGuide[]>([
    {
      id: 1,
      title: 'LINEAR ALGEBRA I',
      overallMastery: 62,
      units: [
        { name: 'Vector Operations', topics: 24, mastery: 85 },
        { name: 'Matrix Fundamentals', topics: 28, mastery: 75 },
        { name: 'Linear Transformations', topics: 13, mastery: 45 },
        { name: 'Eigenvalues & Eigenvectors', topics: 11, mastery: 20 },
        { name: 'Vector Spaces', topics: 7, mastery: 15 },
      ],
    },
    {
      id: 2,
      title: 'CALCULUS II',
      overallMastery: 45,
      units: [
        { name: 'Integration Techniques', topics: 18, mastery: 60 },
        { name: 'Applications of Integration', topics: 15, mastery: 40 },
        { name: 'Sequences and Series', topics: 22, mastery: 35 },
        { name: 'Parametric Equations', topics: 8, mastery: 25 },
      ],
    },
  ])

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handleTextExtracted = (combinedText: string) => {
    setExtractedText(combinedText)
    setGenerationLoading(false)
    // Auto-generate study content from extracted text
    if (combinedText.length > 100) {
      setStudyContent({
        text: combinedText,
        topic: "Uploaded Content",
        difficulty: "intermediate"
      })
    }
  }

  const handleTextChange = (text: string, topic: string, difficulty: string) => {
    setStudyContent({ text, topic, difficulty })
    setGenerationSuccess(false)
    setGeneratorStartKey(Date.now())
  }

  const handleStudyGuideGenerated = (topic: string, sections: any[]) => {
    // Create a new study guide from the generated sections
    const newStudyGuide: StudyGuide = {
      id: Date.now(), // Use timestamp as unique ID
      title: topic.toUpperCase(),
      overallMastery: 0, // Start with 0% mastery
      units: sections.map((section) => ({
        name: section.title,
        topics: Math.max(1, Math.floor(section.content.length / 100)), // Estimate topics based on content length
        mastery: 0, // Start with 0% mastery
      })),
    }

    // Replace the first study guide with the new one
    setActiveStudyGuides(prev => [newStudyGuide, ...prev.slice(1)])
    setGenerationSuccess(true)
  }

  const todaysLessons = [
    { type: 'Lesson', title: 'Vector Addition and Scalar Multiplication', progress: 50, icon: <BookOutlined /> },
    { type: 'Assessment', title: 'Quiz 1', progress: 0, icon: <CheckCircleOutlined /> },
    { type: 'Multistep', title: 'Solving Systems of Linear Equations', progress: 0, icon: <AimOutlined /> },
    { type: 'Lesson', title: 'Matrix Multiplication Properties', progress: 0, icon: <BookOutlined /> },
    { type: 'Review', title: 'Linear Independence', progress: 0, icon: <RiseOutlined /> },
  ]

  const masteryStroke = (m: number) => {
    if (m >= 80) return '#52c41a'
    if (m >= 60) return '#faad14'
    if (m >= 40) return '#fa8c16'
    return '#f5222d'
  }

  if (activeStudySession) {
    return <StudySession guide={activeStudySession} onBack={() => setActiveStudySession(null)} />
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header style={{ background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto', padding: '12px 16px' }}>
          <Space>
            <div style={{ width: 28, height: 28, background: '#1677ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RocketOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0 }}>LearnAI Academy</Title>
            </div>
          </Space>
        </div>
      </Header>

      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Tabs defaultActiveKey="study" items={[
          {
            key: 'study',
            label: (
              <Space>
                <BulbOutlined /> Study
              </Space>
            ),
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div style={{ display: 'grid', gap: 16 }}>
                  {activeStudyGuides.map((guide) => (
                    <Card key={guide.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={5} style={{ color: '#1677ff', margin: 0 }}>{guide.title}</Title>
                        <Button type="primary" size="middle" icon={<RightOutlined />} onClick={() => setActiveStudySession(guide)}>Continue</Button>
                      </div>
                      <Text type="secondary">
                        John has demonstrated mastery of <b>{guide.overallMastery}%</b> of {guide.title}.
                      </Text>
                      <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
                        {guide.units.map((unit, idx) => (
                          <div key={unit.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text style={{ fontSize: 12 }}>{idx + 1}. {unit.name} ({unit.topics} topics)</Text>
                              <Text style={{ fontSize: 12 }}>{unit.mastery}%</Text>
                            </div>
                            <Progress percent={unit.mastery} showInfo={false} strokeColor={masteryStroke(unit.mastery)} />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
                <div style={{ display: 'grid', gap: 16 }}>
                  <HealthCheck />
                  
                  <Card>
                    <Title level={5} style={{ marginBottom: 12 }}>Today's Lessons</Title>
                    <List
                      dataSource={todaysLessons}
                      renderItem={(lesson) => (
                        <List.Item>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Space>
                              <div style={{ padding: 4, background: '#e6f4ff', borderRadius: 6 }}>{lesson.icon}</div>
                              <div>
                                <div style={{ fontWeight: 500 }}>{lesson.type}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>{lesson.title}</Text>
                              </div>
                            </Space>
                            <div style={{ textAlign: 'right' }}>
                              {lesson.progress > 0 && <Text type="secondary" style={{ fontSize: 12 }}>{lesson.progress}%</Text>}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>

                  <Card>
                    <Title level={5} style={{ marginBottom: 12, color: '#1677ff' }}>FOUNDATIONAL KNOWLEDGE</Title>
                    <Text type="secondary">John is missing <b>9 foundational topics</b> from Prealgebra.</Text>
                    <br />
                    <Text type="secondary">These topics will be remediated as John progresses through the Algebra I course.</Text>
                    <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Functions and Graphing</div>
                        <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#666' }}>
                          <div>1. Understanding Proportional Relationships Using Graphs</div>
                          <div>2. Understanding Proportional Relationships Using Tables</div>
                          <div>3. Understanding Proportional Relationships From Descriptions</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Numbers and Representation</div>
                        <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#666' }}>
                          <div>1. Working With Equivalent Ratios</div>
                          <div>2. More on Equivalent Ratios</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Arithmetic</div>
                        <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#666' }}>
                          <div>1. Adding and Subtracting Radicals</div>
                          <div>2. Finding Lowest Common Multiples Using Prime Factorization</div>
                          <div>3. The Power of Quotient Rule for Exponents</div>
                          <div>4. Combining the Rules of Exponents</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ),
          },
          {
            key: 'create',
            label: (
              <Space>
                <UploadOutlined /> Create Guide
              </Space>
            ),
            children: (
              <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 8 }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card bordered={false}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <UploadOutlined />
                          <div>
                            <div style={{ fontWeight: 600 }}>Upload Materials</div>
                            <Text type="secondary">PDFs, docs, or images</Text>
                          </div>
                        </Space>
                        <FileUpload 
                          onFilesChange={handleFilesChange} 
                          onTextExtracted={handleTextExtracted}
                          autoExtract={true}
                          generationSuccess={generationSuccess}
                        />
                      </Space>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card bordered={false}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <FileTextOutlined />
                          <div>
                            <div style={{ fontWeight: 600 }}>Describe Topic</div>
                            <Text type="secondary">Tell us what to study</Text>
                          </div>
                        </Space>
                        <TextInputArea onTextChange={handleTextChange} generationLoading={generationLoading} />
                      </Space>
                    </Card>
                  </Col>
                </Row>

                {false && (
                  <div />
                )}

                {(studyContent || (uploadedFiles.length > 0 && extractedText.length > 100)) && (
                  <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <StudyGuideGenerator
                      topic={studyContent?.topic || 'Uploaded Content'}
                      difficulty={studyContent?.difficulty || 'intermediate'}
                      files={uploadedFiles}
                      textContent={studyContent?.text || extractedText}
                      onStudyGuideGenerated={handleStudyGuideGenerated}
                      autoStartKey={generatorStartKey}
                      onGeneratingChange={setGenerationLoading}
                    />
                  </div>
                )}
              </div>
            ),
          },
          // Prerequisites tab removed
          // Progress tab removed
        ]} />
      </Content>
    </Layout>
  )
}
