import { S3Client } from "@aws-sdk/client-s3";

// WARNING: In a production environment, never expose your Secret Access Key in the frontend code.
// Use a backend proxy or presigned URLs for security.
export const s3Client = new S3Client({
  region: "us-east-1", // MinIO defaults to this region usually
  endpoint: "https://minio.octane360.site",
  credentials: {
    accessKeyId: "admin",
    secretAccessKey: "Den159951!!",
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKET_NAME = "web";
export const MINIO_ENDPOINT = "https://minio.octane360.site";