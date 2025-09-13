import express from 'express';
import { FileController } from '../controllers/fileController.js';
import { upload } from '../../services/fileProcessor.js';

const router = express.Router();

// Health check endpoint
router.get('/health', FileController.healthCheck);

// Upload files and extract text only
router.post('/upload', upload.array('files', 10), FileController.uploadFiles);

// Upload files, extract text, and process through main pipeline
router.post('/upload-and-process', upload.array('files', 10), FileController.uploadAndProcess);

export default router;
