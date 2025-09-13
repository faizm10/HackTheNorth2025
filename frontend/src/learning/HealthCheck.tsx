import { useState, useEffect } from 'react'
import { Card, Typography, Tag, Button, Space, Alert } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, CloudServerOutlined } from '@ant-design/icons'
import { ApiClient } from '../lib/api'

const { Text } = Typography

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
    <Card size="small" style={{ maxWidth: 400 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <CloudServerOutlined style={{ marginRight: 8 }} />
        <Text strong>System Status</Text>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text>Backend API</Text>
        <Tag 
          color={healthStatus.backend ? 'success' : 'error'}
          icon={healthStatus.backend ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {healthStatus.backend ? 'Healthy' : 'Offline'}
        </Tag>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text>File Service</Text>
        <Tag 
          color={healthStatus.fileService ? 'success' : 'error'}
          icon={healthStatus.fileService ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {healthStatus.fileService ? 'Healthy' : 'Offline'}
        </Tag>
      </div>

      {healthStatus.lastChecked && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          Last checked: {healthStatus.lastChecked.toLocaleTimeString()}
        </div>
      )}

      <Button 
        onClick={checkHealth} 
        disabled={isChecking}
        size="small" 
        icon={<ReloadOutlined />}
        style={{ width: '100%' }}
      >
        {isChecking ? 'Checking...' : 'Refresh Status'}
      </Button>

      {!allHealthy && (
        <Alert
          message="Backend Connection Required"
          description="Make sure the backend server is running on port 3001"
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </Card>
  )
}
