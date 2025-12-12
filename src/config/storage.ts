import { Storage } from '@google-cloud/storage';
import path from 'path';

// Initialize Google Cloud Storage
// For now, we'll use a mock implementation until GCS is properly configured
// To use real GCS, set up a service account and provide credentials

const isDevelopment = process.env.NODE_ENV !== 'production';

// Mock storage for development (stores files locally)
class MockStorage {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async upload(file: Express.Multer.File, destination: string): Promise<string> {
    // In development, we'll return a mock URL
    // In production, this would upload to GCS and return the public URL
    const fileName = `${Date.now()}-${file.originalname}`;
    const mockUrl = `http://localhost:5000/uploads/${destination}/${fileName}`;
    
    console.log(`[MOCK GCS] Would upload file: ${file.originalname} to ${destination}/${fileName}`);
    console.log(`[MOCK GCS] Mock URL: ${mockUrl}`);
    
    return mockUrl;
  }

  async delete(fileUrl: string): Promise<void> {
    console.log(`[MOCK GCS] Would delete file: ${fileUrl}`);
  }
}

// Real GCS implementation (uncomment when ready)
class RealStorage {
  private storage: Storage;
  private bucketName: string;

  constructor(bucketName: string, keyFilename?: string) {
    this.bucketName = bucketName;
    
    // Initialize with credentials
    this.storage = new Storage({
      keyFilename: keyFilename || process.env.GCS_KEY_FILE,
      projectId: process.env.GCS_PROJECT_ID,
    });
  }

  async upload(file: Express.Multer.File, destination: string): Promise<string> {
    const fileName = `${destination}/${Date.now()}-${file.originalname}`;
    const bucket = this.storage.bucket(this.bucketName);
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('Upload error:', err);
        reject(err);
      });

      blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic();
        
        const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
        console.log(`[GCS] File uploaded: ${publicUrl}`);
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const fileName = fileUrl.split(`${this.bucketName}/`)[1];
      if (!fileName) return;

      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
      console.log(`[GCS] File deleted: ${fileName}`);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
}

// Export the appropriate storage based on environment
const bucketName = process.env.GCS_BUCKET_NAME || 'cordova-municipality-uploads';

export const storageService = isDevelopment 
  ? new MockStorage(bucketName)
  : new RealStorage(bucketName);

export default storageService;
