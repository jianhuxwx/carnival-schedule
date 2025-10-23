"use client"

import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { formatTimePST } from "@/lib/utils"

interface LiveClockProps {
  currentTime: Date
}

export function LiveClock({ currentTime }: LiveClockProps) {
  const formatTime = (date: Date) => {
    return formatTimePST(date, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return formatTimePST(date, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="px-6 py-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-foreground">{formatTime(currentTime)}</div>
          <div className="text-xs text-muted-foreground">{formatDate(currentTime)} PST</div>
        </div>
      </div>
    </Card>
  )
}
