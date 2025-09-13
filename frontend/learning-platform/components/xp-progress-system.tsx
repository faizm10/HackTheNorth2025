"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Trophy, Star, Zap, Target, TrendingUp, Award, Flame, Calendar, Crown, Medal } from "lucide-react"

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

interface Achievement {
  id: string
  title: string
  description: string
  xpReward: number
  unlocked: boolean
  icon: string
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
    league: "Gold",
    rank: 23,
    achievements: [
      {
        id: "first-study",
        title: "First Steps",
        description: "Complete your first study session",
        xpReward: 50,
        unlocked: true,
        icon: "🎯",
      },
      {
        id: "week-streak",
        title: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        xpReward: 100,
        unlocked: true,
        icon: "🔥",
      },
      {
        id: "speed-learner",
        title: "Speed Learner",
        description: "Complete 5 lessons in one day",
        xpReward: 75,
        unlocked: true,
        icon: "⚡",
      },
      {
        id: "perfect-score",
        title: "Perfectionist",
        description: "Get 100% on 3 consecutive quizzes",
        xpReward: 125,
        unlocked: true,
        icon: "💯",
      },
      {
        id: "level-10",
        title: "Rising Star",
        description: "Reach level 10",
        xpReward: 200,
        unlocked: false,
        icon: "⭐",
      },
      {
        id: "perfect-week",
        title: "Perfect Week",
        description: "Meet daily goal for 7 consecutive days",
        xpReward: 150,
        unlocked: false,
        icon: "💎",
      },
      {
        id: "study-master",
        title: "Study Master",
        description: "Complete 50 study guides",
        xpReward: 500,
        unlocked: false,
        icon: "👑",
      },
      {
        id: "knowledge-seeker",
        title: "Knowledge Seeker",
        description: "Study for 100 total hours",
        xpReward: 300,
        unlocked: false,
        icon: "📚",
      },
    ],
  })

  const dailyProgress = (xpData.currentXP / xpData.dailyGoal) * 100
  const levelProgress = ((200 - xpData.xpToNextLevel) / 200) * 100

  const getLeagueColor = (league: string) => {
    switch (league.toLowerCase()) {
      case "bronze":
        return "bg-amber-100 text-amber-800"
      case "silver":
        return "bg-gray-100 text-gray-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "platinum":
        return "bg-blue-100 text-blue-800"
      case "diamond":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addXP = (amount: number) => {
    setXpData((prev) => ({
      ...prev,
      currentXP: prev.currentXP + amount,
      totalXP: prev.totalXP + amount,
    }))
  }

  const weeklyActivity = [
    { day: "Mon", xp: 180, completed: true },
    { day: "Tue", xp: 220, completed: true },
    { day: "Wed", xp: 150, completed: true },
    { day: "Thu", xp: 200, completed: true },
    { day: "Fri", xp: 175, completed: true },
    { day: "Sat", xp: 190, completed: true },
    { day: "Sun", xp: 145, completed: false, isToday: true },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-balance">Your Learning Progress</h2>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Track your XP, maintain streaks, and unlock achievements as you master new topics
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main XP Overview */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Experience Points
                </span>
                <div className="flex items-center gap-2">
                  <Badge className={`${getLeagueColor(xpData.league)} px-3 py-1`}>
                    <Crown className="h-3 w-3 mr-1" />
                    {xpData.league} League
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    Rank #{xpData.rank}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Level Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Level {xpData.level}</div>
                      <div className="text-sm text-muted-foreground">
                        {xpData.xpToNextLevel} XP to level {xpData.level + 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {(200 - xpData.xpToNextLevel).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">/ 200 XP</div>
                  </div>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>

              <Separator />

              {/* Daily Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Today's Goal</div>
                      <div className="text-sm text-muted-foreground">Keep your streak alive!</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {xpData.currentXP}/{xpData.dailyGoal} XP
                    </div>
                    <div className="text-sm text-muted-foreground">{Math.round(dailyProgress)}% complete</div>
                  </div>
                </div>
                <Progress value={dailyProgress} className="h-2" />
                {dailyProgress >= 100 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                    <Award className="h-4 w-4" />
                    Daily goal completed! +25 bonus XP earned
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{xpData.totalXP.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                    <Flame className="h-5 w-5" />
                    {xpData.streak}
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{xpData.weeklyXP}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Calendar */}
          <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {weeklyActivity.map((activity, index) => (
                  <div key={activity.day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">{activity.day}</div>
                    <div
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                        activity.completed
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md"
                          : activity.isToday
                            ? "bg-primary/20 text-primary border-2 border-primary"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {activity.completed ? (
                        <>
                          <Flame className="h-3 w-3" />
                          <span className="text-xs">{activity.xp}</span>
                        </>
                      ) : activity.isToday ? (
                        <>
                          <Target className="h-3 w-3" />
                          <span className="text-xs">{activity.xp}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick XP Actions */}
          <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Earn XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" onClick={() => addXP(10)} className="w-full justify-start h-auto p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Complete Lesson</div>
                      <div className="text-xs text-muted-foreground">+10 XP</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => addXP(25)} className="w-full justify-start h-auto p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 rounded">
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Finish Quiz</div>
                      <div className="text-xs text-muted-foreground">+25 XP</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => addXP(15)} className="w-full justify-start h-auto p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-purple-100 rounded">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Review Session</div>
                      <div className="text-xs text-muted-foreground">+15 XP</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" onClick={() => addXP(50)} className="w-full justify-start h-auto p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-yellow-100 rounded">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Perfect Score</div>
                      <div className="text-xs text-muted-foreground">+50 XP</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Preview */}
          <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </span>
                <Badge variant="secondary">
                  {xpData.achievements.filter((a) => a.unlocked).length}/{xpData.achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {xpData.achievements
                .filter((a) => a.unlocked)
                .slice(-3)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <span className="text-lg">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+{achievement.xpReward} XP</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Achievements Grid */}
      <Card className="shadow-sm border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            All Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {xpData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant={achievement.unlocked ? "default" : "outline"}>
                  {achievement.unlocked ? "Unlocked" : `${achievement.xpReward} XP`}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
