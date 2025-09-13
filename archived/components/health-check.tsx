"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, Server } from "lucide-react"
import { ApiClient } from "@/lib/api"

interface HealthStatus {
  backend: boolean
  fileService: boolean
  lastChecked: Date | null
}

export function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    backend: false,
    fileService: false,
    lastChecked: null,
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    
    try {
      const [backendHealth, fileServiceHealth] = await Promise.all([
        ApiClient.checkHealth(),
        ApiClient.checkFileServiceHealth(),
      ])

      setHealthStatus({
        backend: backendHealth.success,
        fileService: fileServiceHealth.success,
        lastChecked: new Date(),
      })
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthStatus({
        backend: false,
        fileService: false,
        lastChecked: new Date(),
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const allHealthy = healthStatus.backend && healthStatus.fileService

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backend API</span>
          <Badge variant={healthStatus.backend ? "default" : "destructive"} className="flex items-center gap-1">
            {healthStatus.backend ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {healthStatus.backend ? "Healthy" : "Offline"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">File Service</span>
          <Badge variant={healthStatus.fileService ? "default" : "destructive"} className="flex items-center gap-1">
            {healthStatus.fileService ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {healthStatus.fileService ? "Healthy" : "Offline"}
          </Badge>
        </div>

        {healthStatus.lastChecked && (
          <div className="text-xs text-muted-foreground">
            Last checked: {healthStatus.lastChecked.toLocaleTimeString()}
          </div>
        )}

        <Button 
          onClick={checkHealth} 
          disabled={isChecking}
          size="sm" 
          variant="outline" 
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </>
          )}
        </Button>

        {!allHealthy && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Make sure the backend server is running on port 3001
          </div>
        )}
      </CardContent>
    </Card>
  )
}
