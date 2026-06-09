import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logError, logWarn } from "@/lib/log-context";

// Em produção, exige credenciais reais (evita subir com minioadmin/minioadmin).
if (process.env.NODE_ENV === "production" && (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY || !process.env.S3_ENDPOINT)) {
  throw new Error("S3_ENDPOINT/S3_ACCESS_KEY/S3_SECRET_KEY são obrigatórios em produção");
}

const endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
const region = process.env.S3_REGION ?? "us-east-1";
const bucket = process.env.S3_BUCKET ?? "benx-midia";
const accessKeyId = process.env.S3_ACCESS_KEY ?? "minioadmin";
const secretAccessKey = process.env.S3_SECRET_KEY ?? "minioadmin";

// MinIO exige path-style. O banco guarda só a CHAVE; a URL é resolvida na leitura.
export const s3 = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

export const S3_BUCKET = bucket;

// Sobe um objeto e devolve a chave guardada no banco.
export async function uploadMidia(
  chave: string,
  corpo: Uint8Array | Buffer | string,
  contentType?: string
): Promise<string> {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: chave,
        Body: corpo,
        ContentType: contentType,
      })
    );
    return chave;
  } catch (err) {
    await logError({ err, action: "s3_upload", chave, contentType }, "falha ao subir mídia no storage");
    throw err;
  }
}

// Resolve uma URL assinada (default 1h) a partir da chave. Use na leitura.
export async function getUrl(chave: string, expiraEm = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: chave }), {
    expiresIn: expiraEm,
  });
}

export async function deleteMidia(chave: string): Promise<void> {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: chave }));
  } catch (err) {
    await logError({ err, action: "s3_delete", chave }, "falha ao remover mídia do storage");
    throw err;
  }
}

// Cria o bucket se ainda não existir (idempotente). O compose já faz isso no
// boot; esta função cobre execução fora do compose.
export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err) {
    await logWarn({ err, action: "s3_ensure_bucket", bucket }, "bucket inacessível, tentando criar");
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  }
}
