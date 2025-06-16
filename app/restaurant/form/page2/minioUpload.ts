import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const minioConfig = {
  region: 'us-east-1',
  endpoint: 'https://archivosminio.lacocinaquevende.com',
  credentials: {
    accessKeyId: 'g491QCKR1vu2flZlfT2e',
    secretAccessKey: '7ua84gIwfqKGYlm2uuTBcselwhQ8P1yKXP3tli4H',
  },
  forcePathStyle: true,
};

const s3 = new S3Client(minioConfig);

export async function uploadToMinio({
  file,
  bucket,
  folder = '',
}: {
  file: File;
  bucket: string;
  folder?: string;
}): Promise<string> {
  const fileName = `${folder}${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const arrayBuffer = await file.arrayBuffer();
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: new Uint8Array(arrayBuffer),
    ContentType: file.type,
    ACL: 'public-read',
  };
  await s3.send(new PutObjectCommand(params));
  // URL pública
  return `https://archivosminio.lacocinaquevende.com/${bucket}/${fileName}`;
} 