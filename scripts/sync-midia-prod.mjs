// Sincroniza objetos do MinIO dev (localhost:9000) para o MinIO de produção.
// Uso: node scripts/sync-midia-prod.mjs <endpoint-prod> <access> <secret>
// Só copia o que falta no destino (compara chave+tamanho). Não apaga nada.
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const [endpointProd, access, secret] = process.argv.slice(2);
if (!endpointProd || !access || !secret) {
  console.error("uso: node scripts/sync-midia-prod.mjs <endpoint> <access> <secret>");
  process.exit(1);
}

const BUCKET = "benx-midia";
const dev = new S3Client({ endpoint: "http://localhost:9000", region: "us-east-1", credentials: { accessKeyId: "minioadmin", secretAccessKey: "minioadmin" }, forcePathStyle: true });
const prod = new S3Client({ endpoint: endpointProd, region: "us-east-1", credentials: { accessKeyId: access, secretAccessKey: secret }, forcePathStyle: true });

async function listar(cli) {
  const out = new Map();
  let token;
  do {
    const r = await cli.send(new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }));
    for (const o of r.Contents ?? []) out.set(o.Key, o.Size);
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return out;
}

const devObjs = await listar(dev);
const prodObjs = await listar(prod).catch(() => new Map());
console.log(`dev: ${devObjs.size} objetos | prod: ${prodObjs.size} objetos`);

let copiados = 0, pulados = 0, falhas = 0, bytes = 0;
for (const [key, size] of devObjs) {
  if (prodObjs.get(key) === size) { pulados++; continue; }
  try {
    const obj = await dev.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = Buffer.from(await obj.Body.transformToByteArray());
    await prod.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: obj.ContentType }));
    copiados++; bytes += size;
    if (copiados % 25 === 0) console.log(`  ${copiados} copiados (${(bytes / 1048576).toFixed(1)} MB)...`);
  } catch (e) {
    falhas++; console.error(`  FALHA ${key}: ${e.message}`);
  }
}
console.log(`fim: ${copiados} copiados (${(bytes / 1048576).toFixed(1)} MB), ${pulados} já existiam, ${falhas} falhas`);
process.exit(falhas > 0 ? 1 : 0);
