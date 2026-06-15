// Verificação única (read-only) da credencial autorizada do MinIO de produção.
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
const prod = new S3Client({
  endpoint: "https://midia-benx.imagenou.com",
  region: "us-east-1",
  credentials: { accessKeyId: "benxminio", secretAccessKey: "XCaxHFeKtayYSflf8OObzM26Fbet" },
  forcePathStyle: true,
});
try {
  const r = await prod.send(new ListObjectsV2Command({ Bucket: "benx-midia", MaxKeys: 3 }));
  console.log("LIST OK | objetos:", r.KeyCount ?? 0, "| amostra:", (r.Contents ?? []).map((o) => o.Key).join(", ") || "(vazio)");
} catch (e) {
  console.log("LIST FALHOU:", e.name, "-", e.message);
}
