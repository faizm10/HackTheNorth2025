import { useState } from 'react'
import { Card, Typography, Tag, Progress, Button, Space, Row, Col, List } from 'antd'
import { ThunderboltOutlined, StarFilled, AimOutlined, TrophyOutlined, FireOutlined, CrownOutlined, CalendarOutlined, TrophyFilled, StarOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  unlocked: boolean
  icon: string
}

interface XPData {
  currentXP: number
  dailyGoal: number
  weeklyXP: number
  totalXP: number
  level: number
  xpToNextLevel: number
  streak: number
  league: string
  rank: number
  achievements: Achievement[]
}

export function XPProgressSystem() {
  const [xpData, setXpData] = useState<XPData>({
    currentXP: 145,
    dailyGoal: 200,
    weeklyXP: 850,
    totalXP: 2340,
    level: 8,
    xpToNextLevel: 55,
    streak: 7,
    league: 'Gold',
    rank: 23,
    achievements: [
      { id: 'first-study', title: 'First Steps', description: 'Complete your first study session', xpReward: 50, unlocked: true, icon: '🎯' },
      { id: 'week-streak', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', xpReward: 100, unlocked: true, icon: '🔥' },
      { id: 'speed-learner', title: 'Speed Learner', description: 'Complete 5 lessons in one day', xpReward: 75, unlocked: true, icon: '⚡' },
      { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on 3 consecutive quizzes', xpReward: 125, unlocked: true, icon: '💯' },
      { id: 'level-10', title: 'Rising Star', description: 'Reach level 10', xpReward: 200, unlocked: false, icon: '⭐' },
      { id: 'perfect-week', title: 'Perfect Week', description: 'Meet daily goal for 7 consecutive days', xpReward: 150, unlocked: false, icon: '💎' },
      { id: 'study-master', title: 'Study Master', description: 'Complete 50 study guides', xpReward: 500, unlocked: false, icon: '👑' },
      { id: 'knowledge-seeker', title: 'Knowledge Seeker', description: 'Study for 100 total hours', xpReward: 300, unlocked: false, icon: '📚' },
    ],
  })

  const dailyProgress = Math.round((xpData.currentXP / xpData.dailyGoal) * 100)
  const levelProgress = Math.round(((200 - xpData.xpToNextLevel) / 200) * 100)

  const addXP = (amount: number) => {
    setXpData((prev) => ({ ...prev, currentXP: prev.currentXP + amount, totalXP: prev.totalXP + amount }))
  }

  const leagueColor = (league: string) => {
    switch (league.toLowerCase()) {
      case 'bronze':
        return 'orange'
      case 'silver':
        return 'default'
      case 'gold':
        return 'gold'
      case 'platinum':
        return 'blue'
      case 'diamond':
        return 'purple'
      default:
        return 'default'
    }
  }

  const weeklyActivity = [
    { day: 'Mon', xp: 180, completed: true },
    { day: 'Tue', xp: 220, completed: true },
    { day: 'Wed', xp: 150, completed: true },
    { day: 'Thu', xp: 200, completed: true },
    { day: 'Fri', xp: 175, completed: true },
    { day: 'Sat', xp: 190, completed: true },
    { day: 'Sun', xp: 145, completed: false, isToday: true },
  ]

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Your Learning Progress</Title>
        <Text type="secondary">Track your XP, maintain streaks, and unlock achievements</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ background: 'linear-gradient(135deg,#e6f7ff,#f9f0ff)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <ThunderboltOutlined /> <Text strong>Experience Points</Text>
                </Space>
                <Space>
                  <Tag color={leagueColor(xpData.league)}>
                    <CrownOutlined /> {xpData.league} League
                  </Tag>
                  <Tag>Rank #{xpData.rank}</Tag>
                </Space>
              </div>

              <Card size="small">
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <StarFilled style={{ color: '#faad14' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Level {xpData.level}</div>
                      <Text type="secondary">{xpData.xpToNextLevel} XP to level {xpData.level + 1}</Text>
                    </div>
                  </Space>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>{200 - xpData.xpToNextLevel}</div>
                    <Text type="secondary">/ 200 XP</Text>
                  </div>
                </Space>
                <div style={{ marginTop: 8 }}>
                  <Progress percent={levelProgress} strokeColor="#1677ff" />
                </div>
              </Card>

              <Card size="small">
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <AimOutlined />
                    <div>
                      <div style={{ fontWeight: 600 }}>Today's Goal</div>
                      <Text type="secondary">Keep your streak alive!</Text>
                    </div>
                  </Space>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>
                      {xpData.currentXP}/{xpData.dailyGoal} XP
                    </div>
                    <Text type="secondary">{dailyProgress}% complete</Text>
                  </div>
                </Space>
                <div style={{ marginTop: 8 }}>
                  <Progress percent={dailyProgress} />
                </div>
                {dailyProgress >= 100 && (
                  <div style={{ marginTop: 8, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrophyOutlined /> Daily goal completed! +25 bonus XP earned
                  </div>
                )}
              </Card>

              <Row gutter={12}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{xpData.totalXP.toLocaleString()}</div>
                    <Text type="secondary">Total XP</Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#fa541c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FireOutlined /> {xpData.streak}
                    </div>
                    <Text type="secondary">Day Streak</Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#722ed1' }}>{xpData.weeklyXP}</div>
                    <Text type="secondary">This Week</Text>
                  </Card>
                </Col>
              </Row>

              <Card size="small">
                <Space>
                  <CalendarOutlined /> <Text strong>Weekly Activity</Text>
                </Space>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
                  {weeklyActivity.map((a) => (
                    <div key={a.day} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{a.day}</div>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          color: a.completed ? '#fff' : a.isToday ? '#1677ff' : '#999',
                          background: a.completed ? 'linear-gradient(135deg,#73d13d,#389e0d)' : a.isToday ? 'rgba(22,119,255,0.15)' : '#f0f0f0',
                          border: a.isToday ? '2px solid #1677ff' : undefined,
                          fontWeight: 600,
                        }}
                      >
                        {a.completed ? a.xp : a.isToday ? '→' : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card>
              <Title level={5} style={{ marginBottom: 12 }}>
                <TrophyFilled /> Earn XP
              </Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button onClick={() => addXP(10)} block icon={<StarOutlined />}>Complete Lesson (+10 XP)</Button>
                <Button onClick={() => addXP(25)} block icon={<TrophyOutlined />}>Finish Quiz (+25 XP)</Button>
                <Button onClick={() => addXP(15)} block icon={<AimOutlined />}>Review Session (+15 XP)</Button>
                <Button onClick={() => addXP(50)} block icon={<TrophyOutlined />}>Perfect Score (+50 XP)</Button>
              </Space>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <TrophyOutlined /> <Text strong>Recent Achievements</Text>
                </Space>
                <Tag>
                  {xpData.achievements.filter((a) => a.unlocked).length}/{xpData.achievements.length}
                </Tag>
              </div>
              <List
                style={{ marginTop: 12 }}
                dataSource={xpData.achievements.filter((a) => a.unlocked).slice(-3)}
                renderItem={(a) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <span style={{ fontSize: 18 }}>{a.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.title}</div>
                          <Text type="secondary">{a.description}</Text>
                        </div>
                      </Space>
                      <Tag color="green">+{a.xpReward} XP</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            <Card>
              <Title level={5} style={{ marginBottom: 12 }}>All Achievements</Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                {xpData.achievements.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #f0f0f0',
                      background: a.unlocked ? 'linear-gradient(135deg,#f6ffed,#e6fffb)' : '#fafafa',
                      opacity: a.unlocked ? 1 : 0.8,
                    }}
                  >
                    <Space>
                      <span style={{ fontSize: 22 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.title}</div>
                        <Text type="secondary">{a.description}</Text>
                      </div>
                    </Space>
                    <Tag color={a.unlocked ? 'green' : 'default'}>
                      {a.unlocked ? 'Unlocked' : `${a.xpReward} XP`}
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}
