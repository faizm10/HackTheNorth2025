import { useState } from 'react'
import { Card, Input, Button, Typography, Statistic, Row, Col, Spin, message, Tag } from 'antd'
import { RocketOutlined, ThunderboltOutlined } from '@ant-design/icons'
import './App.css'

const { TextArea } = Input
const { Title, Text } = Typography

interface ProcessedData {
  data: {
    modules: { modules: Array<{ title: string; summary: string }> }
    requirements: { requirements: Array<{ description: string; priority: string; category: string; module_id: string; chunk_id: string }> }
    chunks: Array<{ id: string; text: string }>
    assignments: { assignments: Array<{ chunk_id: string; module_id: string; confidence: number }> }
  }
  metadata: {
    textLength: number
    chunkCount: number
    moduleCount: number
    assignmentCount: number
    requirementCount: number
  }
}

function App() {
  const [text, setText] = useState(`Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. The field has revolutionized numerous industries and continues to evolve rapidly.

There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled training data to learn a mapping between inputs and outputs. Common algorithms include linear regression, decision trees, and neural networks.

Unsupervised learning finds hidden patterns in data without labeled examples, using techniques like clustering and dimensionality reduction. Reinforcement learning involves an agent learning through interaction with an environment, receiving rewards or penalties for its actions.

Before applying machine learning algorithms, data must be preprocessed. This includes handling missing values, encoding categorical variables, scaling numerical features, and splitting data into training and testing sets. Feature engineering is also crucial, involving the creation of new features that may improve model performance.`)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProcessedData | null>(null)
  const [apiUrl, setApiUrl] = useState('http://localhost:3001/api/process')

  const processText = async () => {
    const trimmedText = text.trim()
    
    if (!trimmedText) {
      message.error('Please enter some text to process.')
      return
    }
    
    if (trimmedText.length < 100) {
      message.error('Text must be at least 100 characters long.')
      return
    }
    
    setLoading(true)
    setResults(null)
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedText })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }
      
      setResults(data)
      message.success('Text processed successfully!')
      
    } catch (error) {
      console.error('Processing error:', error)
      message.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend server is running on port 3001.`)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '30px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '30px' }}>
          <RocketOutlined /> Text Processing API Tester
        </Title>
        
        <div style={{ marginBottom: '20px' }}>
          <Text strong>API Endpoint:</Text>
          <Input 
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            style={{ marginTop: '8px' }}
            placeholder="http://localhost:3001/api/process"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <Text strong>Enter your text content:</Text>
          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            style={{ marginTop: '8px', fontFamily: 'monospace' }}
            placeholder="Paste your text here to process it into learning modules, chunks, assignments, and requirements..."
          />
        </div>
        
        <Button 
          type="primary" 
          icon={<ThunderboltOutlined />}
          onClick={processText}
          loading={loading}
          size="large"
          block
        >
          {loading ? 'Processing...' : 'Process Text'}
        </Button>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px', color: '#666' }}>
              ⏳ Processing your text with AI... This may take a few seconds.
            </div>
          </div>
        )}
      </Card>

      {results && (
        <div>
          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: '30px' }}>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Characters" 
                  value={results.metadata.textLength}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Chunks" 
                  value={results.metadata.chunkCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Modules" 
                  value={results.metadata.moduleCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Assignments" 
                  value={results.metadata.assignmentCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic 
                  title="Requirements" 
                  value={results.metadata.requirementCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Learning Modules */}
          <Card title="📚 Learning Modules" style={{ marginBottom: '20px' }}>
            {results.data.modules.modules.map((module, index) => (
              <Card 
                key={index}
                type="inner" 
                title={module.title}
                style={{ marginBottom: '10px' }}
              >
                <Text>{module.summary}</Text>
              </Card>
            ))}
          </Card>

          {/* Learning Requirements */}
          <Card title="📋 Learning Requirements" style={{ marginBottom: '20px' }}>
            {results.data.requirements.requirements.map((req, index) => (
              <Card 
                key={index}
                type="inner"
                style={{ marginBottom: '10px' }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>{req.description}</Text>
                </div>
                <div>
                  <Tag color={getPriorityColor(req.priority)}>{req.priority.toUpperCase()}</Tag>
                  <Text type="secondary" style={{ marginLeft: '10px' }}>{req.category}</Text>
                  <Text style={{ marginLeft: '16px' }}>Module: <Text strong>{req.module_id}</Text></Text>
                  <Text style={{ marginLeft: '12px' }}>Chunk: <Text strong>{req.chunk_id}</Text></Text>
                </div>
              </Card>
            ))}
          </Card>

          {/* Text Chunks */}
          <Card title="📄 Text Chunks" style={{ marginBottom: '20px' }}>
            {results.data.chunks.map((chunk, index) => (
              <Card 
                key={index}
                type="inner"
                title={chunk.id}
                style={{ marginBottom: '10px' }}
              >
                <Text>
                  {chunk.text.length > 200 ? `${chunk.text.substring(0, 200)}...` : chunk.text}
                </Text>
              </Card>
            ))}
          </Card>

          {/* Chunk Assignments */}
          <Card title="🔗 Chunk Assignments" style={{ marginBottom: '20px' }}>
            {results.data.assignments.assignments.map((assignment, index) => (
              <Card 
                key={index}
                type="inner"
                style={{ marginBottom: '10px' }}
              >
                <Text strong>{assignment.chunk_id}</Text> → Module {assignment.module_id}
                <Text type="secondary" style={{ marginLeft: '10px' }}>
                  (Confidence: {(assignment.confidence * 100).toFixed(1)}%)
                </Text>
              </Card>
            ))}
          </Card>

          {/* Raw API Response */}
          <Card title="🔍 Raw API Response" style={{ marginBottom: '20px' }}>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '6px', 
              overflow: 'auto', 
              fontSize: '12px',
              border: '1px solid #e9ecef',
              maxHeight: '400px'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
