import { Request, Response } from 'express';
import { FileProcessor } from '../../services/fileProcessor.js';
import { processText } from '../../services/textProcessor.js';

export class FileController {
  /**
   * Upload and extract text from files
   */
  static async uploadFiles(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: 'Please upload at least one file'
        });
      }
      
      // Validate all files
      const validationErrors: string[] = [];
      files.forEach((file, index) => {
        const validation = FileProcessor.validateFile(file);
        if (!validation.valid) {
          validationErrors.push(`File ${index + 1} (${file.originalname}): ${validation.error}`);
        }
      });
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'File validation failed',
          details: validationErrors
        });
      }
      
      // Extract text from all files
      const extractionResult = await FileProcessor.extractTextFromFiles(files);
      
      if (extractionResult.successCount === 0) {
        return res.status(400).json({
          error: 'Failed to extract text from any files',
          details: extractionResult.results.map(r => r.error).filter(Boolean)
        });
      }
      
      // Check if combined text meets minimum length requirement
      if (extractionResult.combinedText.length < 100) {
        return res.status(400).json({
          error: 'Insufficient text content',
          message: 'Combined text from all files must be at least 100 characters long',
          textLength: extractionResult.combinedText.length
        });
      }
      
      res.json({
        success: true,
        data: {
          combinedText: extractionResult.combinedText,
          extractionResults: extractionResult.results,
          summary: {
            totalFiles: files.length,
            successfulExtractions: extractionResult.successCount,
            failedExtractions: extractionResult.errorCount,
            combinedTextLength: extractionResult.combinedText.length
          }
        }
      });
      
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: 'Internal server error during file processing',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Upload files, extract text, and process through the main pipeline
   */
  static async uploadAndProcess(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: 'Please upload at least one file'
        });
      }
      
      // Validate all files
      const validationErrors: string[] = [];
      files.forEach((file, index) => {
        const validation = FileProcessor.validateFile(file);
        if (!validation.valid) {
          validationErrors.push(`File ${index + 1} (${file.originalname}): ${validation.error}`);
        }
      });
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'File validation failed',
          details: validationErrors
        });
      }
      
      // Extract text from all files
      const extractionResult = await FileProcessor.extractTextFromFiles(files);
      
      if (extractionResult.successCount === 0) {
        return res.status(400).json({
          error: 'Failed to extract text from any files',
          details: extractionResult.results.map(r => r.error).filter(Boolean)
        });
      }
      
      // Check if combined text meets minimum length requirement
      if (extractionResult.combinedText.length < 100) {
        return res.status(400).json({
          error: 'Insufficient text content',
          message: 'Combined text from all files must be at least 100 characters long',
          textLength: extractionResult.combinedText.length
        });
      }
      
      // Process the combined text through the main pipeline
      console.log(`Processing extracted text: ${extractionResult.combinedText.length} characters`);
      const processResult = await processText(extractionResult.combinedText);
      
      res.json({
        success: true,
        data: {
          processedResult: processResult,
          extractionResults: extractionResult.results,
          metadata: {
            totalFiles: files.length,
            successfulExtractions: extractionResult.successCount,
            failedExtractions: extractionResult.errorCount,
            combinedTextLength: extractionResult.combinedText.length,
            chunkCount: processResult.chunks.length,
            moduleCount: processResult.modules.modules.length,
            assignmentCount: processResult.assignments.assignments.length,
            requirementCount: processResult.requirements.requirements.length,
            processedAt: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('File upload and process error:', error);
      res.status(500).json({
        error: 'Internal server error during file processing and text analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Health check for file processing service
   */
  static async healthCheck(req: Request, res: Response) {
    res.json({
      success: true,
      message: 'File processing service is healthy',
      supportedFormats: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ],
      maxFileSize: '10MB',
      timestamp: new Date().toISOString()
    });
  }
}
