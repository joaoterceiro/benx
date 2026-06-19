// Sobe um arquivo local para o MinIO (S3) e imprime a URL pública.
// Usa o mesmo formato de URL do site: {S3_ENDPOINT}/{S3_BUCKET}/{chave}.
//
// Variáveis (use as de PRODUÇÃO, do EasyPanel → serviço os-minio / benx-site):
//   S3_ENDPOINT     ex.: https://minio.seu-dominio  (precisa ser o endpoint PÚBLICO)
//   S3_ACCESS_KEY
//   S3_SECRET_KEY
//   S3_BUCKET       (padrão: benx-midia)
//   S3_REGION       (padrão: us-east-1)
//   ARQUIVO         caminho do arquivo local
//   CHAVE           (opcional) nome/caminho no bucket (padrão: videos/<nome-do-arquivo>)
//
// PowerShell (rode na pasta do projeto):
//   $env:S3_ENDPOINT="https://..."; $env:S3_ACCESS_KEY="..."; $env:S3_SECRET_KEY="..."
//   $env:ARQUIVO="E:\DOWNLOADS\ArtBoulevard-corte_1.mp4"
//   node scripts/upload-arquivo.mjs

import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET || "benx-midia";
const region = process.env.S3_REGION || "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const arquivo = process.env.ARQUIVO;

const TIPOS = { ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };

if (!endpoint || !accessKeyId || !secretAccessKey || !arquivo) {
  console.error("Erro: defina S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY e ARQUIVO.");
  process.exit(1);
}

function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

const ext = extname(arquivo).toLowerCase();
const nome = slug(basename(arquivo, ext)) + ext;
const chave = process.env.CHAVE || `videos/${nome}`;
const contentType = TIPOS[ext] || "application/octet-stream";

const s3 = new S3Client({ endpoint, region, credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });

try {
  const body = readFileSync(arquivo);
  console.log(`Enviando ${(body.length / 1048576).toFixed(1)} MB para ${bucket}/${chave} ...`);
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: chave,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=2592000, immutable",
  }));
  const base = endpoint.replace(/\/+$/, "");
  const key = chave.split("/").map(encodeURIComponent).join("/");
  console.log("\nUpload concluido. URL publica:");
  console.log(`${base}/${bucket}/${key}`);
} catch (err) {
  console.error("Falha:", err.message);
  process.exit(1);
}
