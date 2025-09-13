import { useMemo, useState, useEffect, useRef } from 'react'
import { Card, Typography, Space, Progress, Radio, Button, Result, Tag, Alert, Divider } from 'antd'
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

export function QuizPanel({ topic, lessonTitle, content, onComplete }: { topic: string; lessonTitle: string; content: string; onComplete?: (r: { passed: boolean; correct: number; total: number; percent: number }) => void }) {
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
  const [answers, setAnswers] = useState<Array<{ q: QuizQuestion; selected: number; correct: boolean }>>([])
  const correctCount = answers.filter((a) => a.correct).length
  const progress = Math.round(((current) / questions.length) * 100)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [reported, setReported] = useState(false)

  const submit = () => {
    const q = questions[current]
    if (!q || selected === null) return
    const isCorrect = selected === q.answerIndex
    setAnswers((prev) => [...prev, { q, selected, correct: isCorrect }])
    setSelected(null)
    if (current < questions.length - 1) setCurrent((c) => c + 1)
    else setCurrent((c) => c + 1) // move past last to show summary
  }

  const restart = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setReported(false)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [answers, current])

  // Report completion once when quiz ends
  useEffect(() => {
    if (!onComplete) return
    const done = current >= questions.length
    if (done && !reported) {
      const total = questions.length
      const correct = correctCount
      const percent = Math.round((correct / total) * 100)
      const passed = percent >= 70
      onComplete({ passed, correct, total, percent })
      setReported(true)
    }
  }, [current, questions.length, correctCount, onComplete, reported])

  return (
    <Card
      title={(
        <Space>
          <QuestionCircleOutlined />
          <Text strong>Knowledge Check</Text>
        </Space>
      )}
      extra={<Text type="secondary">{Math.min(current + 1, questions.length)}/{questions.length}</Text>}
      bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column', height: '70vh' }}
    >
      <div style={{ marginBottom: 8 }}>
        <Progress percent={progress} size="small" />
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
          {/* Completed Q&A stack */}
          {answers.map(({ q, correct }) => (
            <div key={q.id} style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {q.tag && <Tag>{q.tag}</Tag>}
                  <Text strong>{q.prompt}</Text>
                </Space>
                <Divider style={{ margin: '8px 0' }} />
                <Alert
                  showIcon
                  type={correct ? 'success' : 'error'}
                  message={
                    <Space>
                      {correct ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                      {correct ? 'Correct' : 'Not quite'}
                    </Space>
                  }
                  description={q.explanation}
                />
              </Space>
            </div>
          ))}

          {/* Current question (or summary) at the bottom of the scroll area */}
          {current < questions.length ? (
            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {questions[current].tag && <Tag>{questions[current].tag}</Tag>}
                  <Text strong>{questions[current].prompt}</Text>
                </Space>
                <Radio.Group onChange={(e) => setSelected(e.target.value)} value={selected} style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {questions[current].options.map((opt, idx) => (
                      <Radio key={idx} value={idx}>{opt}</Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Space>
            </div>
          ) : (
            <div>
              {(() => {
                const pct = Math.round((correctCount / questions.length) * 100)
                return (
                  <Result
                    status={pct >= 70 ? 'success' : 'warning'}
                    title={pct >= 70 ? 'Great job!' : 'Nice effort!'}
                    subTitle={`You answered ${correctCount} of ${questions.length} correctly (${pct}%).`}
                    extra={<Button onClick={restart} icon={<RedoOutlined />}>Retry Quiz</Button>}
                  />
                )
              })()}
            </div>
          )}
        <div ref={endRef} />
      </div>

      {/* Fixed footer with the action button so location doesn't change */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        {current < questions.length ? (
          <Button type="primary" onClick={submit} disabled={selected === null}>Submit</Button>
        ) : (
          <Button onClick={restart} icon={<RedoOutlined />}>Retry Quiz</Button>
        )}
      </div>
    </Card>
  )
}
