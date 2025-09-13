import React, { useState } from 'react'
import { Card, Typography, Input, Button, Tag, Space } from 'antd'
import { BookOutlined, AimOutlined, BulbOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Title, Text } = Typography

export function TextInputArea({ onTextChange }: { onTextChange: (text: string, topic: string, difficulty: string) => void }) {
  const [text, setText] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')

  const difficultyLevels: Array<{ value: 'beginner' | 'intermediate' | 'advanced'; label: string; icon: React.ReactNode }> = [
    { value: 'beginner', label: 'Beginner', icon: <BookOutlined /> },
    { value: 'intermediate', label: 'Intermediate', icon: <AimOutlined /> },
    { value: 'advanced', label: 'Advanced', icon: <BulbOutlined /> },
  ]

  const handleSubmit = () => {
    if (text.trim() || topic.trim()) {
      onTextChange(text, topic, difficulty)
    }
  }

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 16 }}>
        <BookOutlined /> Learning Content Input
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Topic or Subject</Text>
        <TextArea
          placeholder="e.g., Calculus derivatives, Python functions, World War II..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ marginTop: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Additional Context or Questions</Text>
        <TextArea
          placeholder="Paste text content, specific questions, or areas you want to focus on..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ marginTop: 8 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong>Difficulty Level</Text>
        <div style={{ marginTop: 8 }}>
          <Space>
            {difficultyLevels.map((d) => (
              <Tag.CheckableTag
                key={d.value}
                checked={difficulty === d.value}
                onChange={() => setDifficulty(d.value)}
                style={{ padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 6 }}
              >
                <Space>
                  {d.icon}
                  <span>{d.label}</span>
                </Space>
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>
      </div>

      <Button type="primary" block disabled={!text.trim() && !topic.trim()} onClick={handleSubmit}>
        Generate Study Guide
      </Button>
    </Card>
  )
}
