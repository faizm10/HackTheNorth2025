import { useState } from 'react'
import { Upload, Card, Typography, List, Button, Space, Alert, Spin } from 'antd'
import { InboxOutlined, FileOutlined, DeleteOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { ApiClient, type ExtractionResult } from '../lib/api'

const { Dragger } = Upload
const { Text } = Typography

export function FileUpload({
  onFilesChange,
  onTextExtracted,
  maxFiles = 5,
  autoExtract = false,
}: {
  onFilesChange: (files: File[]) => void
  onTextExtracted?: (combinedText: string, extractionResults: ExtractionResult[]) => void
  maxFiles?: number
  autoExtract?: boolean
}) {
  const [files, setFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResults, setExtractionResults] = useState<ExtractionResult[]>([])
  const [extractionError, setExtractionError] = useState<string | null>(null)

  const extractTextFromFiles = async (filesToExtract: File[]) => {
    if (!onTextExtracted || filesToExtract.length === 0) return

    setIsExtracting(true)
    setExtractionError(null)

    try {
      const result = await ApiClient.uploadFiles(filesToExtract)

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract text from files')
      }

      if (result.data) {
        setExtractionResults(result.data.extractionResults)
        onTextExtracted(result.data.combinedText, result.data.extractionResults)
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      setExtractionError(error instanceof Error ? error.message : 'Failed to extract text')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAddFiles = (incoming: File[]) => {
    const next = [...files, ...incoming].slice(0, maxFiles)
    setFiles(next)
    onFilesChange(next)
    
    if (autoExtract && next.length > 0) {
      extractTextFromFiles(next)
    }
  }

  const props = {
    multiple: true,
    accept: '.pdf,.txt,.docx',
    beforeUpload: (file: File) => {
      handleAddFiles([file])
      return false
    },
    showUploadList: false,
  }

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx)
    setFiles(next)
    onFilesChange(next)
    
    // Update extraction results
    const newResults = extractionResults.filter((_, i) => i !== idx)
    setExtractionResults(newResults)
    
    // Re-extract text if auto-extract is enabled
    if (autoExtract && next.length > 0) {
      extractTextFromFiles(next)
    } else if (next.length === 0) {
      setExtractionResults([])
      setExtractionError(null)
    }
  }

  const handleManualExtract = async () => {
    if (files.length > 0) {
      await extractTextFromFiles(files)
    }
  }

  return (
    <div>
      <Card size="small" style={{ borderStyle: 'dashed' }}>
        <Dragger {...props} style={{ padding: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Upload your learning materials</p>
          <p className="ant-upload-hint">Drag and drop files here or click to browse (PDF, TXT, DOCX)</p>
        </Dragger>
      </Card>

      {files.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>Uploaded Files ({files.length})</Text>
            {!autoExtract && (
              <Button 
                type="primary" 
                onClick={handleManualExtract} 
                disabled={isExtracting}
                icon={isExtracting ? <LoadingOutlined /> : <CheckCircleOutlined />}
              >
                {isExtracting ? 'Extracting...' : 'Extract Text'}
              </Button>
            )}
          </div>
          
          <List
            size="small"
            dataSource={files}
            renderItem={(file, idx) => {
              const result = extractionResults[idx]
              return (
                <List.Item
                  actions={[
                    <Button key="remove" type="text" icon={<DeleteOutlined />} onClick={() => removeAt(idx)} />,
                  ]}
                >
                  <Space>
                    <FileOutlined />
                    <Text>{file.name}</Text>
                    <Text type="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                    {result && (
                      <>
                        {result.success ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                        )}
                      </>
                    )}
                    {isExtracting && !result && (
                      <Spin size="small" />
                    )}
                  </Space>
                </List.Item>
              )
            }}
          />
          
          {extractionError && (
            <Alert
              message="Extraction Error"
              description={extractionError}
              type="error"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
          
          {extractionResults.length > 0 && extractionResults.every(r => r.success) && (
            <Alert
              message="Text extraction successful!"
              description={`Extracted ${extractionResults.reduce((total, result) => total + result.text.length, 0)} characters from ${extractionResults.length} file${extractionResults.length > 1 ? 's' : ''}`}
              type="success"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      )}
    </div>
  )
}
