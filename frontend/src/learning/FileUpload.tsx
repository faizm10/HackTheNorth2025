import { useState } from 'react'
import { Upload, Card, Typography, List, Button, Space } from 'antd'
import { InboxOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { Text } = Typography

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
}: {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
}) {
  const [files, setFiles] = useState<File[]>([])

  const handleAddFiles = (incoming: File[]) => {
    const next = [...files, ...incoming].slice(0, maxFiles)
    setFiles(next)
    onFilesChange(next)
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
          <Text strong>Uploaded Files ({files.length})</Text>
          <List
            size="small"
            dataSource={files}
            renderItem={(file, idx) => (
              <List.Item
                actions={[
                  <Button key="remove" type="text" icon={<DeleteOutlined />} onClick={() => removeAt(idx)} />,
                ]}
              >
                <Space>
                  <FileOutlined />
                  <Text>{file.name}</Text>
                  <Text type="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  )
}
