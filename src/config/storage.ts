import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'ap-southeast-1',
  endpoint: process.env.STORAGE_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for Supabase S3
});

class S3Storage {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.STORAGE_BUCKET_NAME || 'portal-uploads';
  }

  async upload(file: Express.Multer.File, destination: string): Promise<string> {
    const fileExt = file.originalname.split('.').pop() || '';
    const uniqueId = uuidv4();
    const fileName = `${destination}/${Date.now()}-${uniqueId}.${fileExt}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: '3600',
    });

    console.log(`[S3] Starting upload to bucket: ${this.bucketName}, key: ${fileName}`);
    try {
      await s3Client.send(command);
      
      // Construct public URL
      const endpoint = process.env.STORAGE_ENDPOINT_URL || '';
      const baseUrl = endpoint.replace('/s3', '/object/public');
      const publicUrl = `${baseUrl}/${this.bucketName}/${fileName}`;
      
      console.log(`[S3] File uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('S3 SDK Error:', error);
      throw error;
    }
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split(`/${this.bucketName}/`);
      if (urlParts.length < 2) return;
      const fileKey = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await s3Client.send(command);
      console.log(`[S3] File deleted: ${fileKey}`);
    } catch (error) {
      console.error('S3 Delete Error:', error);
    }
  }
}

export const storageService = new S3Storage();
export default storageService;
