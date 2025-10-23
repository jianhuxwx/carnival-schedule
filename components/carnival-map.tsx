"use client"

import { useState } from "react"
import { useEventStore, type CarnivalEvent } from "@/lib/event-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Tent, UtensilsCrossed, Music, Trophy, Gamepad2, ZoomIn, ZoomOut } from "lucide-react"

interface CarnivalMapProps {
  highlightedEvent?: CarnivalEvent
}

export function CarnivalMap({ highlightedEvent }: CarnivalMapProps) {
  const { events, mapBlocks } = useEventStore()
  const [zoom, setZoom] = useState(100)

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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 20, 60))
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
      

      <div className="relative w-full aspect-[16/10] overflow-auto rounded-lg border-2 border-dashed border-muted-foreground/20">
        <div
          className="relative w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 transition-transform duration-300"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
        >
          {/* Map Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Compass */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 border z-30">
            <div className="text-xs font-mono space-y-0.5 text-center">
              <div className="text-primary font-bold">N</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">W</span>
                <span className="text-muted-foreground">E</span>
              </div>
              <div className="text-muted-foreground">S</div>
            </div>
          </div>

          {mapBlocks.map((block) => (
            <div
              key={block.id}
              className="absolute z-0"
              style={{
                left: `${block.position.x}%`,
                top: `${block.position.y}%`,
                width: `${block.size.width}%`,
                height: `${block.size.height}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={cn(
                  "w-full h-full rounded border-2 border-white/50 flex items-center justify-center text-white font-bold text-xs shadow-lg",
                  blockColors[block.type],
                )}
              >
                <span className="text-center px-2 truncate">{block.label}</span>
              </div>
            </div>
          ))}

          {/* Event markers at z-10 and z-20 when highlighted */}
          {events.map((event, index) => {
            const position = getEventPosition(event, index)
            const Icon = categoryIcons[event.category]
            const isHighlighted = highlightedEvent?.id === event.id
            const isActive = event.status === "active"

            return (
              <div
                key={event.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10",
                  isHighlighted && "z-20 scale-125",
                  isActive && "animate-bounce",
                )}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >
                <div className="relative group">
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-12 whitespace-nowrap">
                    
                  </div>

                  {/* Marker Pin */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer",
                      categoryColors[event.category],
                      isHighlighted && "ring-4 ring-primary ring-offset-2 ring-offset-background",
                      isActive && "ring-2 ring-accent animate-pulse",
                      "hover:scale-110",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Tooltip */}
                  <div
                    className={cn(
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border rounded-lg shadow-xl whitespace-nowrap transition-all",
                      isHighlighted
                        ? "opacity-100 visible"
                        : "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    )}
                  >
                    <div className="text-sm font-semibold">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.location}</div>
                    {isActive && <Badge className="mt-1 bg-primary text-primary-foreground text-xs">LIVE</Badge>}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-background" />
                    </div>
                  </div>

                  {/* Pulsing Ring for Active Events */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-75">
                      <div className={cn("w-full h-full rounded-full", categoryColors[event.category])} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Interactive carnival map showing all event locations</span>
        </div>
        <Badge variant="outline">
          {events.length} Events • {mapBlocks.length} Blocks
        </Badge>
      </div>
    </Card>
  )
}
