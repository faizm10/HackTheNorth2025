import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'));
    }
  }
});

export interface ExtractedText {
  filename: string;
  text: string;
  success: boolean;
  error?: string;
}

export class FileProcessor {
  /**
   * Extract text from a single file based on its MIME type
   */
  static async extractTextFromFile(file: Express.Multer.File): Promise<ExtractedText> {
    const { originalname, mimetype, buffer } = file;
    
    try {
      let text = '';
      
      switch (mimetype) {
        case 'application/pdf':
          text = await this.extractFromPDF(buffer);
          break;
          
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.extractFromWord(buffer);
          break;
          
        case 'text/plain':
        case 'text/markdown':
          text = buffer.toString('utf-8');
          break;
          
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
      
      return {
        filename: originalname,
        text: text.trim(),
        success: true
      };
      
    } catch (error) {
      return {
        filename: originalname,
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Extract text from multiple files and combine them
   */
  static async extractTextFromFiles(files: Express.Multer.File[]): Promise<{
    combinedText: string;
    results: ExtractedText[];
    successCount: number;
    errorCount: number;
  }> {
    const results: ExtractedText[] = [];
    
    // Process all files in parallel
    const promises = files.map(file => this.extractTextFromFile(file));
    const extractedResults = await Promise.all(promises);
    
    results.push(...extractedResults);
    
    // Combine successful extractions
    const successfulExtractions = results.filter(result => result.success);
    const combinedText = successfulExtractions
      .map(result => `--- ${result.filename} ---\n${result.text}`)
      .join('\n\n');
    
    return {
      combinedText,
      results,
      successCount: successfulExtractions.length,
      errorCount: results.length - successfulExtractions.length
    };
  }
  
  /**
   * Extract text from PDF buffer
   */
  private static async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Extract text from Word document buffer
   */
  private static async extractFromWord(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Validate file size and type
   */
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.' };
    }
    
    return { valid: true };
  }
}
