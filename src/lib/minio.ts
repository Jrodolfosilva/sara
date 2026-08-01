import { Client } from "minio";

const serverUrl = process.env.MINIO_SERVER_URL ?? "";
const url = serverUrl ? new URL(serverUrl) : null;

export const minioClient = new Client({
  endPoint: url?.hostname ?? "",
  port: url?.port ? Number(url.port) : url?.protocol === "http:" ? 80 : 443,
  useSSL: url?.protocol !== "http:",
  accessKey: process.env.MINIO_ROOT_USER ?? "",
  secretKey: process.env.MINIO_ROOT_PASSWORD ?? "",
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "busca-pebas";

export function minioPublicUrl(objectName: string): string {
  return `${serverUrl}/${MINIO_BUCKET}/${objectName}`;
}

let bucketPronto: Promise<void> | undefined;

// Cria o bucket e deixa leitura pública (fotos/logos precisam ser acessíveis direto por URL).
export function garantirBucket(): Promise<void> {
  if (!bucketPronto) {
    bucketPronto = (async () => {
      const existe = await minioClient.bucketExists(MINIO_BUCKET).catch(() => false);
      if (!existe) {
        await minioClient.makeBucket(MINIO_BUCKET);
      }
      await minioClient.setBucketPolicy(
        MINIO_BUCKET,
        JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
            },
          ],
        })
      );
    })();
  }
  return bucketPronto;
}
