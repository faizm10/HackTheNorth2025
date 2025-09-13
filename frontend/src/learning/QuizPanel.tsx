import { useMemo, useState } from 'react'
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
  const [answers, setAnswers] = useState<Array<{ q: QuizQuestion; selected: number; correct: boolean }>>([])
  const correctCount = answers.filter((a) => a.correct).length
  const progress = Math.round(((current) / questions.length) * 100)

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
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <QuestionCircleOutlined />
            <Text strong>Knowledge Check</Text>
          </Space>
          <Text type="secondary">{Math.min(current + 1, questions.length)}/{questions.length}</Text>
        </Space>
        <div style={{ marginTop: 8 }}>
          <Progress percent={progress} size="small" />
        </div>
      </Card>

      {/* Completed Q&A stack */}
      {answers.map(({ q, selected, correct }) => (
        <Card key={q.id}>
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
        </Card>
      ))}

      {/* Current question (if any) */}
      {current < questions.length ? (
        <Card>
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

            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button type="primary" onClick={submit} disabled={selected === null}>Submit</Button>
            </Space>
          </Space>
        </Card>
      ) : (
        <Card>
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
        </Card>
      )}
    </Space>
  )
}
