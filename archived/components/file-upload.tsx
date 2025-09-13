"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiClient, type ExtractionResult } from "@/lib/api"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  onTextExtracted?: (combinedText: string, extractionResults: any[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  autoExtract?: boolean
}

// ExtractionResult is now imported from @/lib/api

export function FileUpload({
  onFilesChange,
  onTextExtracted,
  acceptedTypes = [".pdf", ".txt", ".docx"],
  maxFiles = 5,
  autoExtract = true,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResults, setExtractionResults] = useState<ExtractionResult[]>([])
  const [extractionError, setExtractionError] = useState<string | null>(null)

  const extractTextFromFiles = async (files: File[]) => {
    if (!onTextExtracted || files.length === 0) return

    setIsExtracting(true)
    setExtractionError(null)

    try {
      const result = await ApiClient.uploadFiles(files)

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, maxFiles)
      setUploadedFiles(newFiles)
      onFilesChange(newFiles)
      
      if (autoExtract && newFiles.length > 0) {
        await extractTextFromFiles(newFiles)
      }
    },
    [uploadedFiles, maxFiles, onFilesChange, autoExtract],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: maxFiles - uploadedFiles.length,
  })

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesChange(newFiles)
    
    // Update extraction results
    const newResults = extractionResults.filter((_, i) => i !== index)
    setExtractionResults(newResults)
    
    // Re-extract text if auto-extract is enabled
    if (autoExtract && newFiles.length > 0) {
      extractTextFromFiles(newFiles)
    } else if (newFiles.length === 0) {
      setExtractionResults([])
      setExtractionError(null)
    }
  }

  const handleManualExtract = async () => {
    if (uploadedFiles.length > 0) {
      await extractTextFromFiles(uploadedFiles)
    }
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        )}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop files here" : "Upload your learning materials"}
              </p>
              <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF, TXT, DOCX • Max {maxFiles} files</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Uploaded Files ({uploadedFiles.length})</h4>
            <Button 
              onClick={handleManualExtract} 
              disabled={isExtracting}
              size="sm"
              className={`${
                extractionResults.length > 0 && extractionResults.every(r => r.success)
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : extractionResults.length > 0 && extractionResults.every(r => r.success) ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Re-extract Text
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Extract Text
                </>
              )}
            </Button>
          </div>
          
          {uploadedFiles.map((file, index) => {
            const result = extractionResults[index]
            return (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{file.name}</p>
                        {result && (
                          <>
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </>
                        )}
                        {isExtracting && !result && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {result && result.success && (
                        <p className="text-xs text-green-600 mt-1">
                          Extracted {result.text.length} characters
                        </p>
                      )}
                      {result && !result.success && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
          
          {extractionError && (
            <Card className="p-3 border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{extractionError}</p>
              </div>
            </Card>
          )}
          
          {extractionResults.length > 0 && extractionResults.every(r => r.success) && (
            <Card className="p-3 border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800">Text extraction successful!</p>
                  <p className="text-xs text-green-600">
                    Extracted {extractionResults.reduce((total, result) => total + result.text.length, 0)} characters from {extractionResults.length} file{extractionResults.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
