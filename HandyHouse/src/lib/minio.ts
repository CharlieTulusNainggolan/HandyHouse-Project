import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'adminpassword',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'erp-documents';

export const uploadFileToMinIO = async (
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  bucketName: string = BUCKET_NAME
) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }

    const objectName = `app/${Date.now()}-${fileName}`;
    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType
    });

    const publicUrl = process.env.MINIO_PUBLIC_URL || process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || 'http://s3.localhost';
    return `${publicUrl}/${bucketName}/${objectName}`;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

export default minioClient;
