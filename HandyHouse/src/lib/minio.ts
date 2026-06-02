import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'adminpassword',
});

const BUCKET_NAME = 'erp-documents';

export const uploadFileToMinIO = async (fileName: string, fileBuffer: Buffer, mimeType: string) => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    }

    const objectName = `app/${Date.now()}-${fileName}`;
    await minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': mimeType
    });

    return `/${BUCKET_NAME}/${objectName}`;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

export default minioClient;
