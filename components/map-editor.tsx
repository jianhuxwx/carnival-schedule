"use client"

import type React from "react"

import { useState } from "react"
import { useEventStore, type CarnivalEvent, type MapBlock } from "@/lib/event-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Tent,
  UtensilsCrossed,
  Music,
  Trophy,
  Gamepad2,
  Move,
  Save,
  Plus,
  Square,
  Trash2,
  Edit,
  Maximize2,
} from "lucide-react"

export function MapEditor() {
  const { events, updateEvent, mapBlocks, addMapBlock, updateMapBlock, deleteMapBlock, updateMapBlockSize } =
    useEventStore()
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [isDraggingBlock, setIsDraggingBlock] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingBlock, setEditingBlock] = useState<MapBlock | null>(null)
  const [newBlockLabel, setNewBlockLabel] = useState("")
  const [newBlockType, setNewBlockType] = useState<MapBlock["type"]>("wall")

  const categoryIcons = {
    game: Gamepad2,
    performance: Music,
    food: UtensilsCrossed,
    activity: Tent,
    contest: Trophy,
  }

  const categoryColors = {
    game: "bg-blue-500 text-white",
    performance: "bg-purple-500 text-white",
    food: "bg-orange-500 text-white",
    activity: "bg-green-500 text-white",
    contest: "bg-pink-500 text-white",
  }

  const blockColors = {
    wall: "bg-gray-600",
    booth: "bg-amber-600",
    stage: "bg-purple-600",
    entrance: "bg-green-600",
  }

  const getEventPosition = (event: CarnivalEvent, index: number) => {
    if (event.mapPosition) {
      return event.mapPosition
    }
    const row = Math.floor(index / 3)
    const col = index % 3
    return {
      x: 20 + col * 30,
      y: 20 + row * 30,
    }
  }

  const handleMouseDown = (eventId: string) => {
    setIsDragging(eventId)
  }

  const handleBlockMouseDown = (blockId: string) => {
    setIsDraggingBlock(blockId)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    if (isDragging) {
      const event = events.find((e) => e.id === isDragging)
      if (event) {
        updateEvent(isDragging, {
          ...event,
          mapPosition: { x: clampedX, y: clampedY },
        })
        setHasChanges(true)
      }
    }

    if (isDraggingBlock) {
      const block = mapBlocks.find((b) => b.id === isDraggingBlock)
      if (block) {
        updateMapBlock(isDraggingBlock, {
          position: { x: clampedX, y: clampedY },
        })
        setHasChanges(true)
      }
    }

    if (isResizing && resizeStart) {
      const block = mapBlocks.find((b) => b.id === isResizing)
      if (block) {
        const deltaX = x - resizeStart.x
        const deltaY = y - resizeStart.y
        const newWidth = Math.max(5, Math.min(90, block.size.width + deltaX))
        const newHeight = Math.max(3, Math.min(50, block.size.height + deltaY))

        updateMapBlockSize(isResizing, { width: newWidth, height: newHeight })
        setResizeStart({ x, y })
        setHasChanges(true)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
    setIsDraggingBlock(null)
    setIsResizing(null)
    setResizeStart(null)
  }

  const handleResizeStart = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const parentRect = (e.currentTarget.parentElement?.parentElement as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - parentRect.left) / parentRect.width) * 100
    const y = ((e.clientY - parentRect.top) / parentRect.height) * 100
    setIsResizing(blockId)
    setResizeStart({ x, y })
  }

  const handleAddBlock = () => {
    if (!newBlockLabel.trim()) return

    addMapBlock({
      type: newBlockType,
      label: newBlockLabel,
      position: { x: 50, y: 50 },
      size: { width: 20, height: 10 },
    })
    setNewBlockLabel("")
    setHasChanges(true)
  }

  const handleUpdateBlockLabel = (blockId: string, newLabel: string) => {
    updateMapBlock(blockId, { label: newLabel })
    setEditingBlock(null)
    setHasChanges(true)
  }

  const resetPositions = () => {
    events.forEach((event, index) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      updateEvent(event.id, {
        ...event,
        mapPosition: {
          x: 20 + col * 30,
          y: 20 + row * 30,
        },
      })
    })
    setHasChanges(false)
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Edit Carnival Map</h3>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="animate-pulse">
                <Save className="h-3 w-3 mr-1" />
                Changes Saved
              </Badge>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Block
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Map Block</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="block-type">Block Type</Label>
                    <Select value={newBlockType} onValueChange={(value) => setNewBlockType(value as MapBlock["type"])}>
                      <SelectTrigger id="block-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wall">Wall</SelectItem>
                        <SelectItem value="booth">Booth</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                        <SelectItem value="entrance">Entrance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block-label">Label</Label>
                    <Input
                      id="block-label"
                      value={newBlockLabel}
                      onChange={(e) => setNewBlockLabel(e.target.value)}
                      placeholder="e.g., North Wall, Main Stage"
                    />
                  </div>
                  <Button onClick={handleAddBlock} className="w-full">
                    Add Block
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={resetPositions}>
              Reset Positions
            </Button>
          </div>
        </div>

        <div
          className="relative w-full aspect-[16/10] bg-gradient-to-br from-green-100 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 rounded-lg border-2 border-dashed border-muted-foreground/20 overflow-hidden cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-editor" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-editor)" />
          </svg>

          <div className="absolute top-4 left-4 space-y-2 pointer-events-none">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              Carnival Grounds - Drag to Reposition
            </Badge>
          </div>

          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 border pointer-events-none">
            <div className="text-xs font-mono space-y-0.5 text-center">
              <div className="text-primary font-bold">N</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">W</span>
                <span className="text-muted-foreground">E</span>
              </div>
              <div className="text-muted-foreground">S</div>
            </div>
          </div>

          {mapBlocks.map((block) => {
            const isBeingDragged = isDraggingBlock === block.id
            const isBeingResized = isResizing === block.id

            return (
              <div
                key={block.id}
                className={cn(
                  "absolute transition-all group",
                  isBeingDragged ? "z-40 cursor-grabbing opacity-80" : "z-5 cursor-grab hover:opacity-90",
                  isBeingResized && "z-40",
                )}
                style={{
                  left: `${block.position.x}%`,
                  top: `${block.position.y}%`,
                  width: `${block.size.width}%`,
                  height: `${block.size.height}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseDown={() => handleBlockMouseDown(block.id)}
              >
                <div
                  className={cn(
                    "w-full h-full rounded border-2 border-white/50 flex items-center justify-center text-white font-bold text-sm shadow-lg",
                    blockColors[block.type],
                    isBeingDragged && "ring-4 ring-primary",
                    isBeingResized && "ring-4 ring-accent",
                  )}
                >
                  <span className="text-center px-2 truncate">{block.label}</span>
                </div>

                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onMouseDown={(e) => handleResizeStart(e, block.id)}
                >
                  <Maximize2 className="h-3 w-3 text-white" />
                </div>

                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pointer-events-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingBlock(block)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Block Label</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-label">Label</Label>
                          <Input
                            id="edit-label"
                            defaultValue={block.label}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateBlockLabel(block.id, e.currentTarget.value)
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => {
                            const input = document.getElementById("edit-label") as HTMLInputElement
                            handleUpdateBlockLabel(block.id, input.value)
                          }}
                          className="w-full"
                        >
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMapBlock(block.id)
                      setHasChanges(true)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}

          {events.map((event, index) => {
            const position = getEventPosition(event, index)
            const Icon = categoryIcons[event.category]
            const isBeingDragged = isDragging === event.id

            return (
              <div
                key={event.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all",
                  isBeingDragged ? "z-50 scale-125 cursor-grabbing" : "z-10 cursor-grab hover:scale-110",
                )}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onMouseDown={() => handleMouseDown(event.id)}
              >
                <div className="relative group">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                      categoryColors[event.category],
                      isBeingDragged && "ring-4 ring-primary ring-offset-2 ring-offset-background animate-pulse",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div
                    className={cn(
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border rounded-lg shadow-xl whitespace-nowrap transition-all",
                      "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    )}
                  >
                    <div className="text-sm font-semibold">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.location}</div>
                    <div className="text-xs text-primary mt-1">Click and drag to move</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-background" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border space-y-2 pointer-events-none max-w-xs">
            <div className="text-xs font-semibold mb-2">Map Elements</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(categoryIcons).map(([category, Icon]) => (
                <div key={category} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      categoryColors[category as keyof typeof categoryColors],
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="capitalize">{category}</span>
                </div>
              ))}
              {Object.entries(blockColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn("w-6 h-4 rounded flex items-center justify-center", color)}>
                    <Square className="h-2 w-2 text-white" />
                  </div>
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Click and drag elements to reposition them on the map</span>
          </div>
          <Badge variant="outline">
            {events.length} Events • {mapBlocks.length} Blocks
          </Badge>
        </div>
      </div>
    </Card>
  )
}
