import { useMemo, useState } from 'react'
import { Card, Typography, Space, Progress, Radio, Button, Result, Tag, Alert } from 'antd'
import { QuestionCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, RedoOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  explanation?: string
  tag?: string
}

export function QuizPanel({ topic, lessonTitle, content }: { topic: string; lessonTitle: string; content: string }) {
  const questions: QuizQuestion[] = useMemo(() => {
    // Simple heuristic to craft questions from topic/content
    const base = topic || lessonTitle || 'This lesson'
    const snippet = (content || '').replace(/\n+/g, ' ').trim().slice(0, 120)
    return [
      {
        id: 'q1',
        prompt: `Which statement best describes ${base}?`,
        options: [
          `${base} concerns properties unrelated to the lesson`,
          `${base} focuses on core ideas from the lesson content`,
          `${base} is only about memorization`,
          `${base} has no practical applications`,
        ],
        answerIndex: 1,
        explanation: `The lesson emphasizes understanding core ideas rather than rote memorization, and connects to practical uses.${snippet ? `\n\nBased on lesson: "${snippet}${snippet.length>=120?'…':''}"` : ''}`,
        tag: 'Concept',
      },
      {
        id: 'q2',
        prompt: 'Choose the most accurate next step when stuck on a problem:',
        options: [
          'Ignore the problem and move on',
          'Reframe the question and break it into smaller steps',
          'Try random answers until one works',
          'Copy a solution without understanding',
        ],
        answerIndex: 1,
        explanation: 'Breaking problems into steps helps you reason, find missing pieces, and improve transfer to new problems.',
        tag: 'Strategy',
      },
      {
        id: 'q3',
        prompt: 'What is a good way to validate your understanding?',
        options: [
          'Explain the idea in your own words or teach it to someone else',
          'Rely solely on memorized formulas',
          'Skip practice questions',
          'Focus only on speed',
        ],
        answerIndex: 0,
        explanation: 'Explaining concepts in your own words reveals gaps and solidifies understanding.',
        tag: 'Metacognition',
      },
    ]
  }, [topic, lessonTitle])

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState<null | boolean>(null)

  const q = questions[current]
  const progress = Math.round(((current) / questions.length) * 100)

  const submit = () => {
    if (selected === null) return
    const isCorrect = selected === q.answerIndex
    setShowFeedback(isCorrect)
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  const next = () => {
    setShowFeedback(null)
    setSelected(null)
    if (current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setCorrectCount(0)
    setShowFeedback(null)
  }

  if (current >= questions.length) {
    const pct = Math.round((correctCount / questions.length) * 100)
    return (
      <Card>
        <Result
          status={pct >= 70 ? 'success' : 'warning'}
          title={pct >= 70 ? 'Great job!' : 'Nice effort!'}
          subTitle={`You answered ${correctCount} of ${questions.length} correctly (${pct}%).`}
          extra={<Button onClick={restart} icon={<RedoOutlined />}>Retry Quiz</Button>}
        />
      </Card>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <QuestionCircleOutlined />
            <Text strong>Knowledge Check</Text>
          </Space>
          <Text type="secondary">{current + 1}/{questions.length}</Text>
        </Space>
        <div style={{ marginTop: 8 }}>
          <Progress percent={progress} size="small" />
        </div>
      </Card>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            {q.tag && <Tag>{q.tag}</Tag>}
            <Text strong>{q.prompt}</Text>
          </Space>

          <Radio.Group onChange={(e) => setSelected(e.target.value)} value={selected} style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {q.options.map((opt, idx) => (
                <Radio key={idx} value={idx}>{opt}</Radio>
              ))}
            </Space>
          </Radio.Group>

          {showFeedback !== null && (
            <div>
              {showFeedback ? (
                <Alert
                  showIcon
                  type="success"
                  message={<Space><CheckCircleTwoTone twoToneColor="#52c41a" /> Correct</Space>}
                  description={q.explanation}
                />
              ) : (
                <Alert
                  showIcon
                  type="error"
                  message={<Space><CloseCircleTwoTone twoToneColor="#ff4d4f" /> Not quite</Space>}
                  description={q.explanation}
                />
              )}
            </div>
          )}

          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <div />
            {showFeedback === null ? (
              <Button type="primary" onClick={submit} disabled={selected === null}>Submit</Button>
            ) : (
              <Button type="primary" onClick={next}>Next</Button>
            )}
          </Space>
        </Space>
      </Card>
    </Space>
  )
}
