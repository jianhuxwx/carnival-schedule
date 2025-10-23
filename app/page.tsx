"use client"

import { useState, useEffect } from "react"
import { InfoScreenDisplay } from "@/components/info-screen-display"
import { EventManager } from "@/components/event-manager"
import { MapEditor } from "@/components/map-editor"
import { LiveClock } from "@/components/live-clock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings, Map, Lock } from "lucide-react"
import { useEventStore } from "@/lib/event-store"

export default function CarnivalSchedulePage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const initializeFromApi = useEventStore((s) => s.initializeFromApi)

  const ADMIN_PASSWORD = "classof2028athenian"

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(!showAdmin)
    } else {
      setShowPasswordDialog(true)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setShowAdmin(true)
      setShowPasswordDialog(false)
      setPassword("")
    } else {
      alert("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowAdmin(false)
    setPassword("")
  }

  useEffect(() => {
    // ensure shared state is loaded from API
    initializeFromApi().catch(() => {})
  }, [initializeFromApi])

  useEffect(() => {
    // Set client flag and initial time
    setIsClient(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-4 md:p-8 lg:p-12 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-6xl md:text-7xl font-black text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Fall Carnival
              </h1>
              <p className="text-2xl text-muted-foreground mt-3 text-pretty">Live event updates and information</p>
            </div>
            <div className="flex items-center gap-4">
              {isClient && currentTime && <LiveClock currentTime={currentTime} />}
              <Button variant="outline" size="lg" onClick={handleAdminClick} className="gap-2">
                {isAuthenticated ? (
                  <>
                    <Settings className="h-5 w-5" />
                    {showAdmin ? "Public View" : "Admin"}
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Admin
                  </>
                )}
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <Lock className="h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Display */}
        {showAdmin ? (
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="events" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage Events
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2">
                <Map className="h-4 w-4" />
                Edit Map
              </TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <EventManager />
            </TabsContent>
            <TabsContent value="map">
              <MapEditor />
            </TabsContent>
          </Tabs>
        ) : (
          isClient && currentTime && <InfoScreenDisplay currentTime={currentTime} />
        )}

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Admin Access Required
              </DialogTitle>
              <DialogDescription>
                Please enter the admin password to access the management dashboard.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Access Admin</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
