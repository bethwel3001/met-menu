import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FileService {
  static async saveBase64Image(base64Data, filename) {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../uploads');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, base64String, 'base64');
      
      console.log(`✅ Image saved: ${filePath}`);
      return filePath;

    } catch (error) {
      console.error('File Service Error:', error);
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  static async deleteTempFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`✅ Temporary file deleted: ${filePath}`);
    } catch (error) {
      console.warn('⚠️ Could not delete temp file:', error.message);
    }
  }

  static validateBase64Image(base64Data) {
    if (!base64Data) {
      throw new Error('No image data provided');
    }

    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid base64 image format. Expected data URL starting with "data:image/"');
    }

    // Check file size (rough estimate)
    const base64Length = base64Data.length - (base64Data.indexOf(',') + 1);
    const fileSizeInBytes = (base64Length * 3) / 4;
    
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    if (fileSizeInBytes > maxSize) {
      throw new Error(`Image size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Validate MIME type
    const mimeType = base64Data.match(/^data:(image\/\w+);/)?.[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!mimeType || !allowedTypes.includes(mimeType)) {
      throw new Error(`Invalid image type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }

  static async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      const files = await fs.readdir(uploadsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🧹 Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.warn('File cleanup error:', error.message);
    }
  }
}