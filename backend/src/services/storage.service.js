const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFile(file, type = "file", contentType = null) {
  if (!BUCKET_NAME || !AWS_REGION) {
    throw new Error("AWS_S3_BUCKET_NAME and AWS_REGION must be configured");
  }

  const fileBuffer = resolveFileBuffer(file);

  const resolvedContentType =
    contentType || file?.mimetype || getContentType(type);

  const extension = getExtensionFromContentType(resolvedContentType);

  const fileName = `${type}_${Date.now()}_${Math.round(
    Math.random() * 1e6
  )}.${extension}`;

  const key = `Spotify/${type}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: resolvedContentType,

    // ❌ REMOVED ACL (THIS FIXES YOUR ERROR)
  });

  await s3Client.send(command);

  return {
    url: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
}

async function uploadMultipleFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  const uploadedFiles = await Promise.all(
    files.map((file) => {
      const inferredType = inferFileType(file);
      return uploadFile(file, inferredType, file.mimetype);
    })
  );

  return uploadedFiles.map((item) => item.url);
}

function resolveFileBuffer(file) {
  if (Buffer.isBuffer(file)) return file;
  if (file && Buffer.isBuffer(file.buffer)) return file.buffer;

  throw new Error("Invalid file object (multer expected)");
}

function inferFileType(file) {
  const mimetype = file?.mimetype || "";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "music";
  return "file";
}

function getContentType(type) {
  switch (type) {
    case "image":
    case "avatar":
      return "image/jpeg";
    case "music":
      return "audio/mpeg";
    default:
      return "application/octet-stream";
  }
}

function getExtensionFromContentType(contentType) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
      return "wav";
    default:
      return "bin";
  }
}

module.exports = {
  uploadFile,
  uploadMultipleFiles,
};