"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
}

export function FileUpload({
  onFilesChange,
  acceptedTypes = [".pdf", ".txt", ".docx"],
  maxFiles = 5,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, maxFiles)
      setUploadedFiles(newFiles)
      onFilesChange(newFiles)
    },
    [uploadedFiles, maxFiles, onFilesChange],
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
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
