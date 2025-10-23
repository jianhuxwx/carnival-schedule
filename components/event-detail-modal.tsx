"use client"

import type { CarnivalEvent } from "@/lib/event-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users, Calendar, Timer, Sparkles, Ticket } from "lucide-react"
import { CarnivalMap } from "@/components/carnival-map"
import { formatTimePST } from "@/lib/utils"

interface EventDetailModalProps {
  event: CarnivalEvent
  onClose: () => void
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const categoryColors = {
    game: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    performance: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    food: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    activity: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
    contest: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  }

  const categoryGradients = {
    game: "from-blue-500/20 via-blue-400/10 to-transparent",
    performance: "from-purple-500/20 via-purple-400/10 to-transparent",
    food: "from-orange-500/20 via-orange-400/10 to-transparent",
    activity: "from-green-500/20 via-green-400/10 to-transparent",
    contest: "from-pink-500/20 via-pink-400/10 to-transparent",
  }

  const formatTime = (date: string) => {
    return formatTimePST(date, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: string) => {
    return formatTimePST(date, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getEndTime = () => {
    const start = new Date(event.scheduledTime)
    const end = new Date(start.getTime() + event.duration * 60000)
    return formatTime(end.toISOString())
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient background */}
        <div
          className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${categoryGradients[event.category]} -z-10`}
        />

        <div className="p-6 md:p-8">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-3xl md:text-4xl font-bold text-balance mb-3">{event.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={categoryColors[event.category]}>
                    {event.category}
                  </Badge>
                  {event.status === "active" && (
                    <Badge className="bg-primary text-primary-foreground animate-pulse">
                      <Sparkles className="h-3 w-3 mr-1" />
                      LIVE NOW
                    </Badge>
                  )}
                  {event.status === "completed" && <Badge variant="secondary">Completed</Badge>}
                </div>
              </div>
            </div>
            <DialogDescription className="text-base md:text-lg text-pretty leading-relaxed">
              {event.description}
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-6" />

          {/* Event Details Grid */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">Date & Time</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(event.scheduledTime)}</p>
                    <p className="text-base md:text-lg font-mono font-semibold mt-1">
                      {formatTime(event.scheduledTime)} - {getEndTime()} PST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10 flex-shrink-0">
                    <Timer className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Duration</h3>
                    <p className="text-base md:text-lg font-semibold">{event.duration} minutes</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.floor(event.duration / 60) > 0 &&
                        `${Math.floor(event.duration / 60)} hour${Math.floor(event.duration / 60) > 1 ? "s" : ""} `}
                      {event.duration % 60 > 0 && `${event.duration % 60} min`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-base md:text-lg font-semibold break-words">{event.location}</p>
                    <p className="text-sm text-muted-foreground mt-1">See map below</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-1/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/10 flex-shrink-0">
                    <Ticket className="h-5 w-5 text-chart-1" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Tickets Required</h3>
                    <p className="text-base md:text-lg font-semibold">{event.ticketCost}</p>
                    <p className="text-sm text-muted-foreground mt-1">Entry requirement</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-chart-2/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10 flex-shrink-0">
                    <Users className="h-5 w-5 text-chart-2" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Participants</h3>
                    <p className="text-base md:text-lg font-semibold">{event.participants} people</p>
                    <p className="text-sm text-muted-foreground mt-1">Expected attendance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Carnival Map */}
          <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Carnival Map
            </h3>
            <CarnivalMap highlightedEvent={event} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
