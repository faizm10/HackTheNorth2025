import { useEffect, useRef, useState } from 'react'
import type { KeyboardEventHandler } from 'react'
import { Card, Input, Button, List, Avatar, Typography, Space, Tag } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Text } = Typography

export interface ChatMessage {
  id: string
  type: 'user' | 'tutor'
  content: string
  timestamp: Date
}

interface ChatTutorProps {
  currentTopic: string
  lessonContent: string
}

export function ChatTutor({ currentTopic, lessonContent }: ChatTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'tutor',
      content: `Hello! I'm your AI tutor for "${currentTopic}". Ask me anything about this lesson.`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateTutorResponse = (text: string) => {
    const lower = text.toLowerCase()

    if (lower.includes('vector')) {
      return 'A vector has both magnitude and direction. In 2D, you can represent it as (x, y). Its magnitude is sqrt(x^2 + y^2).'
    }
    if (lower.includes('matrix')) {
      return 'A matrix is a rectangular array of numbers. Matrix multiplication corresponds to composing linear transformations.'
    }
    if (lower.includes('example')) {
      return 'Example: (3,4) + (1,2) = (4,6). The magnitude of (3,4) is 5.'
    }

    const snippet = (lessonContent || '').trim().slice(0, 160)
    return `Great question! Here's a concise explanation grounded in our current lesson. ${snippet ? `Context: "${snippet}${lessonContent.length > 160 ? '…' : ''}"` : ''} Would you like an example or a step-by-step walkthrough?`
  }

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    setTimeout(() => {
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        type: 'tutor',
        content: generateTutorResponse(trimmed),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, tutorMsg])
      setIsLoading(false)
    }, 900)
  }

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    'Can you give me an example?',
    'Why is this important?',
    'How do I calculate this?',
    "I'm confused about this step",
  ]

  return (
    <Card
      title={
        <Space size={8}>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <Text strong>AI Tutor</Text>
          <Tag color="blue">{currentTopic}</Tag>
        </Space>
      }
      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: 360 }}
    >
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={m.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ background: m.type === 'user' ? '#1890ff' : '#52c41a' }}
                  />
                }
                title={<Text strong style={{ fontSize: 12 }}>{m.type === 'user' ? 'You' : 'AI Tutor'}</Text>}
                description={<div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>}
              />
            </List.Item>
          )}
        />
        {isLoading && (
          <Space style={{ marginTop: 8 }}>
            <Avatar icon={<RobotOutlined />} style={{ background: '#52c41a' }} />
            <Text type="secondary" italic>
              AI Tutor is typing...
            </Text>
          </Space>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <Space wrap style={{ margin: '8px 0' }}>
          {suggestions.map((q) => (
            <Button key={q} size="small" onClick={() => setInputValue(q)}>
              {q}
            </Button>
          ))}
        </Space>
      )}

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder="Ask about this lesson..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
          Send
        </Button>
      </Space.Compact>
    </Card>
  )
}
