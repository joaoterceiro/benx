// Define Cache-Control longo em TODOS os objetos do bucket benx-midia (MinIO de
// produção). Não altera o conteúdo da imagem: faz CopyObject sobre si mesmo só
// trocando o metadado (Cache-Control). Assim lightbox/plantas/galeria passam a
// cachear no browser e abrem instantâneo em revisitas.
//
// Uso: node scripts/set-cache-midia.mjs <endpoint> <access> <secret>
//   node scripts/set-cache-midia.mjs https://midia-benx.imagenou.com benxminio <senha>
import { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const [, , endpoint, accessKeyId, secretAccessKey] = process.argv;
if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error("Uso: node scripts/set-cache-midia.mjs <endpoint> <access> <secret>");
  process.exit(1);
}

const bucket = "benx-midia";
const CACHE = "public, max-age=2592000, immutable";
const s3 = new S3Client({ endpoint, region: "us-east-1", credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });

const encKey = (k) => k.split("/").map(encodeURIComponent).join("/");

let token;
let total = 0, ok = 0, fail = 0;
do {
  const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token, MaxKeys: 1000 }));
  for (const o of list.Contents ?? []) {
    total++;
    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: o.Key }));
      await s3.send(new CopyObjectCommand({
        Bucket: bucket,
        Key: o.Key,
        CopySource: `/${bucket}/${encKey(o.Key)}`,
        MetadataDirective: "REPLACE",
        CacheControl: CACHE,
        ContentType: head.ContentType || "application/octet-stream",
      }));
      ok++;
      if (ok % 100 === 0) console.log(`...${ok} ok`);
    } catch (e) {
      fail++;
      console.error("falha:", o.Key, e.message);
    }
  }
  token = list.NextContinuationToken;
} while (token);

console.log(`fim: ${ok} com Cache-Control, ${fail} falhas, de ${total} objetos.`);
