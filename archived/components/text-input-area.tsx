"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lightbulb, Target } from "lucide-react"

interface TextInputAreaProps {
  onTextChange: (text: string, topic: string, difficulty: string) => void
}

export function TextInputArea({ onTextChange }: TextInputAreaProps) {
  const [text, setText] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("intermediate")

  const handleSubmit = () => {
    if (text.trim() || topic.trim()) {
      onTextChange(text, topic, difficulty)
    }
  }

  const difficultyLevels = [
    { value: "beginner", label: "Beginner", icon: BookOpen },
    { value: "intermediate", label: "Intermediate", icon: Target },
    { value: "advanced", label: "Advanced", icon: Lightbulb },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Learning Content Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Topic or Subject</label>
          <Textarea
            placeholder="e.g., Calculus derivatives, Python functions, World War II..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Additional Context or Questions</label>
          <Textarea
            placeholder="Paste text content, specific questions, or areas you want to focus on..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Difficulty Level</label>
          <div className="flex gap-2">
            {difficultyLevels.map(({ value, label, icon: Icon }) => (
              <Badge
                key={value}
                variant={difficulty === value ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 hover:bg-primary/10"
                onClick={() => setDifficulty(value)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={!text.trim() && !topic.trim()}>
          Generate Study Guide
        </Button>
      </CardContent>
    </Card>
  )
}
