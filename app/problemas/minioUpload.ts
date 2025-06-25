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

function normalizeFileName(name: string): string {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-zA-Z0-9._-]/g, '_') // solo letras, números, punto, guion y guion bajo
    .replace(/_+/g, '_'); // evitar múltiples guiones bajos
}

export async function uploadToMinio({
  file,
  bucket,
  folder = '',
}: {
  file: File;
  bucket: string;
  folder?: string;
}): Promise<string> {
  const fileName = `${folder}${Date.now()}_${normalizeFileName(file.name)}`;
  const arrayBuffer = await file.arrayBuffer();
  const params = {
    Bucket: bucket,
    Key: fileName,
    Body: new Uint8Array(arrayBuffer),
    ContentType: file.type,
  };
  await s3.send(new PutObjectCommand(params));
  // URL pública
  return `https://archivosminio.lacocinaquevende.com/${bucket}/${fileName}`;
} 