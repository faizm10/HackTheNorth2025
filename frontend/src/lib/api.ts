// API configuration and utility functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  // File upload endpoints
  FILES: {
    HEALTH: `${API_BASE_URL}/api/files/health`,
    UPLOAD: `${API_BASE_URL}/api/files/upload`,
    UPLOAD_AND_PROCESS: `${API_BASE_URL}/api/files/upload-and-process`,
  },
  // Text processing endpoints
  PROCESS: `${API_BASE_URL}/api/process`,
  // General health check
  HEALTH: `${API_BASE_URL}/health`,
} as const

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ExtractionResult {
  filename: string
  text: string
  success: boolean
  error?: string
}

export interface FileUploadResponse {
  combinedText: string
  extractionResults: ExtractionResult[]
  summary: {
    totalFiles: number
    successfulExtractions: number
    failedExtractions: number
    combinedTextLength: number
  }
}

export interface ProcessedResult {
  chunks: Array<{
    id: string
    text: string
  }>
  modules: {
    modules: Array<{
      id: string
      title: string
      summary: string
    }>
  }
  assignments: {
    assignments: Array<{
      chunk_id: string
      module_id: string
      confidence: number
    }>
  }
  requirements: {
    requirements: Array<{
      id: string
      description: string
      priority: string
      category: string
      module_id: string
      chunk_id: string
    }>
  }
}

export interface UploadAndProcessResponse {
  processedResult: ProcessedResult
  extractionResults: ExtractionResult[]
  metadata: {
    totalFiles: number
    successfulExtractions: number
    failedExtractions: number
    combinedTextLength: number
    chunkCount: number
    moduleCount: number
    assignmentCount: number
    requirementCount: number
    processedAt: string
  }
}

// API utility functions
export class ApiClient {
  static async uploadFiles(files: File[]): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch(API_ENDPOINTS.FILES.UPLOAD, {
      method: 'POST',
      body: formData,
    })

    return response.json()
  }

  static async uploadAndProcess(files: File[]): Promise<ApiResponse<UploadAndProcessResponse>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch(API_ENDPOINTS.FILES.UPLOAD_AND_PROCESS, {
      method: 'POST',
      body: formData,
    })

    return response.json()
  }

  static async processText(text: string): Promise<ApiResponse<ProcessedResult>> {
    const response = await fetch(API_ENDPOINTS.PROCESS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    return response.json()
  }

  static async checkHealth(): Promise<ApiResponse> {
    const response = await fetch(API_ENDPOINTS.HEALTH)
    return response.json()
  }

  static async checkFileServiceHealth(): Promise<ApiResponse> {
    const response = await fetch(API_ENDPOINTS.FILES.HEALTH)
    return response.json()
  }
}
