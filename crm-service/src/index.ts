import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS crm_documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error("Failed to create table", err));

// Setup S3 Client (MinIO)
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || '9000'}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'adminpassword',
  },
});

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/crm/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const bucketName = 'crm-assets';
    const objectName = `crm/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = process.env.MINIO_PUBLIC_URL || 'http://s3.localhost';
    const url = `${publicUrl}/${bucketName}/${objectName}`;
    
    // Save to Postgres Database
    await pool.query('INSERT INTO crm_documents (filename, url) VALUES ($1, $2)', [req.file.originalname, url]);

    res.status(200).json({ status: 'success', message: 'File uploaded and saved to DB', url });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to upload file' });
  }
});

app.get('/api/crm/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'ok', service: 'CRM Service', dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.get('/api/crm/customers', (req, res) => {
  res.status(200).json([{ id: 1, name: 'Customer A' }, { id: 2, name: 'Customer B' }]);
});

app.listen(port, () => {
  console.log(`CRM Service is running on port ${port}`);
});
