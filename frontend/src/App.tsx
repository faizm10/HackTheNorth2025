import { useState } from 'react'
import { Modal, Form, Upload, Input, Button, message } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import './App.css'

const { TextArea } = Input

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form values:', values)
        message.success('Form submitted successfully!')
        form.resetFields()
        setIsModalVisible(false)
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.txt,.doc,.docx,.rtf',
    beforeUpload: (file) => {
      const isTextDocument = file.type === 'application/pdf' || 
                             file.type === 'text/plain' || 
                             file.type === 'application/msword' ||
                             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                             file.type === 'application/rtf' ||
                             file.name.toLowerCase().endsWith('.pdf') ||
                             file.name.toLowerCase().endsWith('.txt') ||
                             file.name.toLowerCase().endsWith('.doc') ||
                             file.name.toLowerCase().endsWith('.docx') ||
                             file.name.toLowerCase().endsWith('.rtf')
      
      if (!isTextDocument) {
        message.error('You can only upload text documents (PDF, TXT, DOC, DOCX, RTF)!')
        return false
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!')
        return false
      }
      
      return false // Prevent automatic upload, just store the file
    },
    onRemove: () => {
      form.setFieldsValue({ file: undefined })
    },
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Document Upload Form</h1>
      <Button 
        type="primary" 
        icon={<FileTextOutlined />} 
        onClick={showModal}
        size="large"
      >
        Open Document Form
      </Button>

      <Modal
        title="Document Upload Form"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText="Submit"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          name="document_form"
        >
          <Form.Item
            name="file"
            label="Select Document"
            rules={[{ required: true, message: 'Please select a document!' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                Click to Upload Document
              </Button>
            </Upload>
            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
              Supported formats: PDF, TXT, DOC, DOCX, RTF (Max 10MB)
            </div>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter any additional information or description..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default App
