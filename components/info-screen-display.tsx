"use client"

import { useEffect, useState } from "react"
import { useEventStore } from "@/lib/event-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Users, Ticket, Sparkles, ChevronRight, Timer, Infinity } from "lucide-react"
import { cn } from "@/lib/utils"
import { CarnivalMap } from "@/components/carnival-map"
import { formatTimePST } from "@/lib/utils"

interface InfoScreenDisplayProps {
  currentTime: Date
}

export function InfoScreenDisplay({ currentTime }: InfoScreenDisplayProps) {
  const { events, updateEventStatus } = useEventStore()
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [lockedEventId, setLockedEventId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(0)

  const displayableEvents = events.filter((e) => {
    if (e.eventType === "constant") return true
    return e.status === "upcoming" || e.status === "active"
  })

  useEffect(() => {
    if (lockedEventId) return
    if (displayableEvents.length === 0) return

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % displayableEvents.length)
    }, 15000) // Exactly 15 seconds

    return () => clearInterval(interval)
  }, [displayableEvents.length, lockedEventId])

  useEffect(() => {
    events.forEach((event) => {
      if (event.eventType === "constant") return

      const eventTime = new Date(event.scheduledTime)
      const timeDiff = eventTime.getTime() - currentTime.getTime()
      const minutesUntil = Math.floor(timeDiff / 60000)
      const secondsUntil = Math.floor(timeDiff / 1000)

      if (minutesUntil < 5 && minutesUntil >= 0 && event.status === "upcoming" && !lockedEventId) {
        setLockedEventId(event.id)
        setCountdown(secondsUntil)
      }

      if (lockedEventId === event.id && secondsUntil > 0) {
        setCountdown(secondsUntil)
      }

      if (minutesUntil <= 0 && minutesUntil > -1 && event.status === "upcoming") {
        updateEventStatus(event.id, "active")
        setActiveEventId(event.id)
        setShowFullDetails(true)
        setLockedEventId(null)

        setTimeout(() => {
          setShowFullDetails(false)
          setActiveEventId(null)
        }, 30000)
      }

      if (timeDiff < -event.duration * 60000 && event.status === "active") {
        updateEventStatus(event.id, "completed")
      }
    })
  }, [currentTime, events, updateEventStatus, lockedEventId])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeUntil = (scheduledTime: string, duration: number, eventType?: string) => {
    if (eventType === "constant") return "ALWAYS AVAILABLE"

    const eventTime = new Date(scheduledTime)
    const diff = eventTime.getTime() - currentTime.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (minutes < 0 && diff >= -duration * 60000) return "NOW"
    if (minutes < 60) return `in ${minutes} min`
    return `in ${hours}h ${minutes % 60}m`
  }

  const isUpcoming = (scheduledTime: string, eventType?: string) => {
    if (eventType === "constant") return false

    const eventTime = new Date(scheduledTime)
    const diff = eventTime.getTime() - currentTime.getTime()
    const minutes = Math.floor(diff / 60000)
    return minutes <= 5 && minutes > 0
  }

  const categoryColors = {
    game: "bg-blue-500",
    performance: "bg-purple-500",
    food: "bg-orange-500",
    activity: "bg-green-500",
    contest: "bg-pink-500",
  }

  const upcomingEvents = displayableEvents
    .filter((e) => e.eventType !== "constant" && e.status === "upcoming")
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())

  const activeScheduledEvents = displayableEvents.filter((e) => e.eventType !== "constant" && e.status === "active")
  const constantEvents = events.filter((e) => e.eventType === "constant")
  const lockedEvent = lockedEventId ? events.find((e) => e.id === lockedEventId) : null
  const featuredEvent = lockedEvent || displayableEvents[currentEventIndex]
  const activeEvent = activeScheduledEvents.find((e) => e.id === activeEventId)

  return (
    <div className="space-y-8">
      {showFullDetails && activeEvent && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/95 via-secondary/95 to-accent/95 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 animate-blink-border">
            <div className="max-w-7xl w-full space-y-8">
              <div className="text-center space-y-4 animate-pulse">
                <Badge className="text-3xl px-8 py-4 bg-white text-primary font-bold animate-bounce">
                  <Sparkles className="h-8 w-8 mr-3 inline" />
                  STARTING NOW!
                  <Sparkles className="h-8 w-8 ml-3 inline" />
                </Badge>
                <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl text-balance">
                  {activeEvent.title}
                </h1>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <Card className="bg-white/95 backdrop-blur p-6 md:p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xl md:text-2xl">
                      <Clock className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-bold">
                          {formatTimePST(activeEvent.scheduledTime, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          PST
                        </div>
                        <div className="text-base md:text-lg text-muted-foreground">{activeEvent.duration} minutes</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xl md:text-2xl">
                      <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
                      <div className="font-bold break-words">{activeEvent.location}</div>
                    </div>

                    <div className="flex items-center gap-4 text-xl md:text-2xl">
                      <Ticket className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
                      <div className="font-bold">{activeEvent.ticketCost} tickets</div>
                    </div>

                    <div className="flex items-center gap-4 text-xl md:text-2xl">
                      <Users className="h-8 w-8 md:h-10 md:w-10 text-primary flex-shrink-0" />
                      <div className="font-bold">{activeEvent.participants} spots</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-lg md:text-xl text-pretty leading-relaxed">{activeEvent.description}</p>
                  </div>
                </Card>

                <Card className="bg-white/95 backdrop-blur p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Location Map</h3>
                  <CarnivalMap highlightedEvent={activeEvent} />
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
          <div className="p-8 md:p-10">
            <CarnivalMap highlightedEvent={featuredEvent} />
          </div>
        </Card>

        {upcomingEvents.length === 0 && activeScheduledEvents.length === 0 && constantEvents.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
            <div className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-3xl font-bold mb-2">No Active Events</h2>
              <p className="text-xl text-muted-foreground">Check back soon for upcoming activities!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeScheduledEvents.length > 0 && !showFullDetails && (
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8 animate-bounce" />
                      <div>
                        <h3 className="text-2xl font-bold">Happening Now</h3>
                        <p className="text-lg opacity-90">{activeScheduledEvents.length} active scheduled events</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {activeScheduledEvents.map((event) => (
                        <Badge key={event.id} className="text-base px-3 py-1 bg-white text-green-600 font-bold">
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {featuredEvent && !showFullDetails && (
              <Card
                className={cn(
                  "bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 overflow-hidden",
                  lockedEvent && "border-accent animate-blink-border",
                )}
              >
                <div className="p-6 md:p-8">
                  {lockedEvent && (
                    <div className="mb-4 text-center">
                      <Badge className="text-xl md:text-2xl px-4 py-2 bg-accent text-accent-foreground animate-pulse">
                        <Timer className="h-5 w-5 md:h-6 md:w-6 mr-2 inline animate-spin" />
                        STARTING IN {formatCountdown(countdown)}
                        <Timer className="h-5 w-5 md:h-6 md:w-6 ml-2 inline animate-spin" />
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn("text-base px-3 py-1", categoryColors[featuredEvent.category], "text-white")}
                        >
                          {featuredEvent.category.toUpperCase()}
                        </Badge>
                        {featuredEvent.eventType === "constant" && (
                          <Badge className="text-base px-3 py-1 bg-purple-500 text-white">
                            <Infinity className="h-4 w-4 mr-1 inline" />
                            CONSTANT
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-balance">{featuredEvent.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {getTimeUntil(featuredEvent.scheduledTime, featuredEvent.duration, featuredEvent.eventType)}
                      </div>
                      {featuredEvent.eventType !== "constant" && (
                        <div className="text-lg md:text-xl text-muted-foreground">
                          {formatTimePST(featuredEvent.scheduledTime, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          PST
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-pretty mb-6 leading-relaxed">{featuredEvent.description}</p>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Location</div>
                        <div className="text-base md:text-lg font-bold truncate">{featuredEvent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Tickets</div>
                        <div className="text-base md:text-lg font-bold">{featuredEvent.ticketCost}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                        <div className="text-base md:text-lg font-bold">{featuredEvent.participants}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="text-base md:text-lg font-bold">{featuredEvent.duration} min</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold">Upcoming Events</h2>
            <div className="text-2xl text-muted-foreground">{upcomingEvents.length} events</div>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const isAlert = isUpcoming(event.scheduledTime, event.eventType)
              const isFeatured = displayableEvents[currentEventIndex]?.id === event.id

              return (
                <Card
                  key={event.id}
                  className={cn(
                    "transition-all duration-500",
                    isFeatured && "ring-4 ring-primary shadow-2xl scale-[1.02]",
                    isAlert && "animate-blink-border bg-accent/5",
                  )}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "flex-shrink-0 text-center p-4 rounded-xl min-w-[140px]",
                          isAlert ? "bg-accent text-accent-foreground animate-pulse" : "bg-muted",
                        )}
                      >
                        <div className="text-3xl font-black">
                          {new Date(event.scheduledTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Los_Angeles",
                          })}
                        </div>
                        <div className="text-lg font-semibold mt-1">
                          {getTimeUntil(event.scheduledTime, event.duration, event.eventType)}
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                            <p className="text-xl text-muted-foreground text-pretty">{event.description}</p>
                          </div>
                          <Badge className={cn("text-base px-3 py-1", categoryColors[event.category], "text-white")}>
                            {event.category}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-base md:text-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">{event.ticketCost} tickets</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">{event.participants} spots</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold">{event.duration} min</span>
                          </div>
                        </div>
                      </div>

                      {isFeatured && <ChevronRight className="h-12 w-12 text-primary animate-pulse flex-shrink-0" />}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {constantEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <Infinity className="h-10 w-10 text-primary" />
              Always Available Events
            </h2>
            <div className="text-2xl text-muted-foreground">{constantEvents.length} events</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {constantEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Badge className="mb-2 bg-purple-500 text-white">
                        <Infinity className="h-3 w-3 mr-1 inline" />
                        CONSTANT
                      </Badge>
                      <h3 className="text-2xl font-bold">{event.title}</h3>
                    </div>
                    <Badge className={cn("text-sm px-2 py-1", categoryColors[event.category], "text-white")}>
                      {event.category}
                    </Badge>
                  </div>

                  <p className="text-lg text-muted-foreground mb-4">{event.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{event.location}</span>
                    </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">{event.ticketCost} tickets</span>
                          </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{event.participants} spots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{event.duration} min</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
