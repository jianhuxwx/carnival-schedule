"use client"

import type React from "react"

import { useState } from "react"
import { useEventStore } from "@/lib/event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Clock, MapPin, Users, Ticket, Infinity } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function EventManager() {
  const { events, addEvent, updateEvent, deleteEvent, reorderEvent } = useEventStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledTime: "",
    duration: 30,
    location: "",
    participants: 0,
    ticketCost: "Free",
    category: "activity" as const,
    eventType: "scheduled" as "scheduled" | "constant",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduledTime: "",
      duration: 30,
      location: "",
      participants: 0,
      ticketCost: "Free",
      category: "activity",
      eventType: "scheduled",
    })
    setEditingEvent(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingEvent) {
      updateEvent(editingEvent, formData)
    } else {
      addEvent(formData)
    }
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        scheduledTime: event.scheduledTime,
        duration: event.duration,
        location: event.location,
        participants: event.participants,
        ticketCost: event.ticketCost,
        category: event.category,
        eventType: event.eventType || "scheduled",
      })
      setEditingEvent(eventId)
      setIsAddDialogOpen(true)
    }
  }

  const handleTimeAdjustment = (eventId: string, minutes: number) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      const currentTime = new Date(event.scheduledTime)
      currentTime.setMinutes(currentTime.getMinutes() + minutes)
      reorderEvent(eventId, currentTime.toISOString())
    }
  }

  const categoryColors = {
    game: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    performance: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    food: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    activity: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
    contest: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Management</h2>
          <p className="text-sm text-muted-foreground">Add, edit, or reschedule carnival events</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update the event details below" : "Create a new carnival event"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Face Painting Station"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the event..."
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">
                    {formData.eventType === "constant" ? "Start Time (Optional)" : "Scheduled Time"}
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={formData.scheduledTime ? new Date(formData.scheduledTime).toISOString().slice(0, 16) : ""}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData({ ...formData, scheduledTime: value ? new Date(value).toISOString() : "" })
                    }}
                    required={formData.eventType === "scheduled"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10)
                      setFormData({ ...formData, duration: Number.isNaN(parsed) ? 0 : parsed })
                    }}
                    min={5}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Tent A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Expected Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={formData.participants}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10)
                      setFormData({ ...formData, participants: Number.isNaN(parsed) ? 0 : parsed })
                    }}
                    min={0}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketCost">Tickets Required</Label>
                  <Input
                    id="ticketCost"
                    value={formData.ticketCost}
                    onChange={(e) => setFormData({ ...formData, ticketCost: e.target.value })}
                    placeholder="e.g., Free, 3, 5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="contest">Contest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value: any) => setFormData({ ...formData, eventType: value })}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled Event</SelectItem>
                    <SelectItem value="constant">Constant Event (Always Available)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Constant events are always available throughout the carnival
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingEvent ? "Update Event" : "Create Event"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events
          .sort((a, b) => {
            const timeA = Date.parse(a.scheduledTime || "")
            const timeB = Date.parse(b.scheduledTime || "")
            const safeA = Number.isNaN(timeA) ? Number.POSITIVE_INFINITY : timeA
            const safeB = Number.isNaN(timeB) ? Number.POSITIVE_INFINITY : timeB
            return safeA - safeB
          })
          .map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge variant="outline" className={categoryColors[event.category]}>
                        {event.category}
                      </Badge>
                      {event.eventType === "constant" && (
                        <Badge variant="secondary" className="gap-1">
                          <Infinity className="h-3 w-3" />
                          Constant
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-pretty">{event.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.eventType === "constant" || !event.scheduledTime
                        ? "Always Available"
                        : new Date(event.scheduledTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.participants} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>{event.ticketCost} tickets</span>
                  </div>
                </div>
                {event.eventType === "scheduled" && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Adjust Time:</span>
                    <Button variant="outline" size="sm" onClick={() => handleTimeAdjustment(event.id, -15)}>
                      -15 min
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTimeAdjustment(event.id, -5)}>
                      -5 min
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTimeAdjustment(event.id, 5)}>
                      +5 min
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleTimeAdjustment(event.id, 15)}>
                      +15 min
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
