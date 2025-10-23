"use client"

import { useEffect, useState } from "react"
import { useEventStore, type CarnivalEvent } from "@/lib/event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Users, Bell, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { EventDetailModal } from "@/components/event-detail-modal"

interface ScheduleBoardProps {
  currentTime: Date
}

export function ScheduleBoard({ currentTime }: ScheduleBoardProps) {
  const { events, updateEventStatus } = useEventStore()
  const [selectedEvent, setSelectedEvent] = useState<CarnivalEvent | null>(null)
  const [alertedEvents, setAlertedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Check for events that should trigger alerts (5 minutes before)
    events.forEach((event) => {
      const eventTime = new Date(event.scheduledTime)
      const timeDiff = eventTime.getTime() - currentTime.getTime()
      const minutesUntil = Math.floor(timeDiff / 60000)

      // Alert 5 minutes before
      if (minutesUntil <= 5 && minutesUntil > 0 && !alertedEvents.has(event.id) && event.status === "upcoming") {
        setAlertedEvents((prev) => new Set(prev).add(event.id))
      }

      // Auto-open modal when event time arrives
      if (minutesUntil <= 0 && minutesUntil > -1 && event.status === "upcoming") {
        updateEventStatus(event.id, "active")
        setSelectedEvent(event)
      }

      // Mark as completed after duration
      if (timeDiff < -event.duration * 60000 && event.status === "active") {
        updateEventStatus(event.id, "completed")
      }
    })
  }, [currentTime, events, alertedEvents, updateEventStatus])

  const getTimeUntil = (scheduledTime: string) => {
    const eventTime = new Date(scheduledTime)
    const diff = eventTime.getTime() - currentTime.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (minutes < 0) return "In Progress"
    if (minutes < 60) return `${minutes}m`
    return `${hours}h ${minutes % 60}m`
  }

  const isUpcoming = (scheduledTime: string) => {
    const eventTime = new Date(scheduledTime)
    const diff = eventTime.getTime() - currentTime.getTime()
    const minutes = Math.floor(diff / 60000)
    return minutes <= 5 && minutes > 0
  }

  const isActive = (event: CarnivalEvent) => {
    return event.status === "active"
  }

  const categoryColors = {
    game: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    performance: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    food: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
    activity: "from-green-500/20 to-green-600/20 border-green-500/30",
    contest: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
  }

  const categoryBadgeColors = {
    game: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    performance: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    food: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    activity: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
    contest: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  }

  const upcomingEvents = events.filter((e) => e.status === "upcoming")
  const activeEvents = events.filter((e) => e.status === "active")
  const completedEvents = events.filter((e) => e.status === "completed")

  return (
    <>
      <div className="space-y-6">
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Happening Now</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeEvents
                .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                .map((event) => (
                  <Card
                    key={event.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]",
                      "bg-gradient-to-br border-2",
                      categoryColors[event.category],
                      "animate-pulse-slow",
                    )}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground animate-bounce">LIVE</Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-pretty">{event.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(event.scheduledTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.participants}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-bold">Upcoming Events</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents
              .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
              .map((event) => {
                const isAlert = isUpcoming(event.scheduledTime)
                return (
                  <Card
                    key={event.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                      isAlert && "ring-2 ring-accent animate-pulse border-accent",
                    )}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {isAlert && (
                      <div className="absolute top-2 right-2 animate-bounce">
                        <Bell className="h-5 w-5 text-accent fill-accent" />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <Badge variant="outline" className={categoryBadgeColors[event.category]}>
                          {event.category}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-pretty text-sm">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(event.scheduledTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(isAlert && "bg-accent/20 text-accent-foreground font-semibold")}
                        >
                          {getTimeUntil(event.scheduledTime)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{event.participants}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>

        {/* Completed Events */}
        {completedEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold text-muted-foreground">Completed</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {completedEvents
                .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
                .map((event) => (
                  <Card
                    key={event.id}
                    className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm line-clamp-1">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.scheduledTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  )
}
