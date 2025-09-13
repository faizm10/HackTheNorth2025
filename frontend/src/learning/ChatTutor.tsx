import { useEffect, useRef, useState } from 'react'
import type { KeyboardEventHandler } from 'react'
import { Card, Input, Button, List, Avatar, Typography, Space, Tag, Select, Switch, Tooltip } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined, CopyOutlined, ReloadOutlined, DeleteOutlined, ReadOutlined, BulbOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons'
import { message as antdMessage } from 'antd'

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
  const [mode, setMode] = useState<'explain' | 'examples' | 'steps' | 'quiz'>('explain')
  const [detail, setDetail] = useState<'concise' | 'normal' | 'deep'>('normal')
  const [useContext, setUseContext] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const findContextSnippet = (query: string) => {
    if (!useContext || !lessonContent) return ''
    const lc = (lessonContent || '').replace(/\n+/g, ' ').trim()
    const sentences = lc.split(/(?<=[.!?])\s+/)
    const q = query.toLowerCase()
    const keywords = Array.from(new Set(q.split(/[^a-z0-9]+/).filter(Boolean))).slice(0, 6)
    const match = sentences.find((s) => keywords.some((k) => s.toLowerCase().includes(k))) || sentences[0]
    return (match || '').slice(0, 240)
  }

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
    // Mode- and detail-aware response template
    const detailBlurb =
      detail === 'concise'
        ? 'In short: '
        : detail === 'deep'
        ? 'Let’s go deeper: '
        : ''

    const base =
      mode === 'explain'
        ? `${detailBlurb}Here’s an explanation focusing on the core idea and common pitfalls.`
        : mode === 'examples'
        ? `${detailBlurb}Let’s look at a few examples that connect directly to this concept.`
        : mode === 'steps'
        ? `${detailBlurb}Here is a step-by-step approach you can follow.`
        : `${detailBlurb}I’ll quiz you with a quick question to check understanding.`

    const ctx = findContextSnippet(text)
    const ctxLine = ctx ? `\n\nLesson context: "${ctx}${ctx.length >= 240 ? '…' : ''}"` : ''
    const followUp =
      mode === 'quiz'
        ? '\n\nYour turn: Try answering, and I\'ll give hints if you\'d like.'
        : '\n\nWould you like an example, a visual intuition, or a practice problem next?'

    return `${base}${ctxLine}${followUp}`
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
    'Summarize the key idea',
    'Give me an analogy',
    'Step-by-step solution',
    'Create a quick practice problem',
    'Quiz me on this',
  ]

  const regenerateLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.type === 'user')
    if (!lastUser) return
    setIsLoading(true)
    setTimeout(() => {
      const tutorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        type: 'tutor',
        content: generateTutorResponse(lastUser.content),
        timestamp: new Date(),
      }
      // Replace last tutor message or append
      setMessages((prev) => {
        const idx = [...prev].reverse().findIndex((m) => m.type === 'tutor')
        if (idx === -1) return [...prev, tutorMsg]
        const realIdx = prev.length - 1 - idx
        const next = prev.slice()
        next[realIdx] = tutorMsg
        return next
      })
      setIsLoading(false)
    }, 900)
  }

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'tutor',
        content: `New chat for "${currentTopic}". What would you like to focus on?`,
        timestamp: new Date(),
      },
    ])
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      antdMessage.success('Copied to clipboard')
    } catch {
      antdMessage.error('Copy failed')
    }
  }

  return (
    <Card
      title={
        <Space size={8}>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <Text strong>AI Tutor</Text>
          <Tag color="blue">{currentTopic}</Tag>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Use lesson context">
            <Switch checked={useContext} onChange={setUseContext} />
          </Tooltip>
          <Tooltip title="Response mode">
            <Select
              size="small"
              style={{ width: 130 }}
              value={mode}
              onChange={(v) => setMode(v)}
              options={[
                { value: 'explain', label: (<span><ReadOutlined /> Explain</span>) },
                { value: 'examples', label: (<span><BulbOutlined /> Examples</span>) },
                { value: 'steps', label: (<span><SettingOutlined /> Steps</span>) },
                { value: 'quiz', label: (<span><QuestionCircleOutlined /> Quiz</span>) },
              ]}
            />
          </Tooltip>
          <Tooltip title="Detail level">
            <Select
              size="small"
              style={{ width: 110 }}
              value={detail}
              onChange={(v) => setDetail(v)}
              options={[
                { value: 'concise', label: 'Concise' },
                { value: 'normal', label: 'Normal' },
                { value: 'deep', label: 'Deep' },
              ]}
            />
          </Tooltip>
          <Tooltip title="Reset chat">
            <Button icon={<DeleteOutlined />} onClick={resetChat} size="small" />
          </Tooltip>
        </Space>
      }
      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: 420 }}
    >
      {/* Quick actions */}
      <Space wrap style={{ marginBottom: 8 }}>
        {suggestions.map((q) => (
          <Button key={q} size="small" onClick={() => setInputValue(q)}>
            {q}
          </Button>
        ))}
      </Space>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item style={{ padding: '8px 0' }}
              actions={[
                <Tooltip title="Copy" key="copy"><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(m.content)} /></Tooltip>,
              ]}
            >
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

      {/* Input Area */}
      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder="Ask about this lesson..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button icon={<ReloadOutlined />} onClick={regenerateLast} disabled={isLoading || messages.filter(m => m.type==='user').length===0}>
          Regenerate
        </Button>
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
          Send
        </Button>
      </Space.Compact>
    </Card>
  )
}
