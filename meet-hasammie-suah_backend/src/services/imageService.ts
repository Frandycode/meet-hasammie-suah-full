/**
 * Meet HaSammie Suah — Backend API
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || './uploads');
export const BASE_URL    = process.env.BASE_URL || 'http://localhost:4000';

// ── Optional Cloudinary — only configured if env vars present ─────────────────
async function getCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;
  const { v2 } = await import('cloudinary');
  v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return v2;
}

export interface StoredImage {
  storageType: 'LOCAL' | 'CLOUDINARY' | 'URL';
  filePath:    string | null;
  url:         string | null;
  publicUrl:   string;
  width:       number | null;
  height:      number | null;
  fileSize:    number | null;
  mimeType:    string | null;
}

// ── Ensure uploads directory exists ──────────────────────────────────────────
export async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

// ── Save to local filesystem ──────────────────────────────────────────────────
async function saveToLocal(
  stream: NodeJS.ReadableStream,
  originalName: string,
  mimetype: string,
): Promise<StoredImage> {
  await ensureUploadsDir();
  const ext      = path.extname(originalName) || '.jpg';
  const filename = `${uuid()}${ext}`;
  const fullPath = path.join(UPLOADS_DIR, filename);

  await new Promise<void>((resolve, reject) => {
    const write = createWriteStream(fullPath);
    stream.pipe(write);
    write.on('finish', resolve);
    write.on('error',  reject);
  });

  let width: number | null    = null;
  let height: number | null   = null;
  let fileSize: number | null = null;
  let finalFilename           = filename;

  try {
    const meta = await sharp(fullPath).metadata();
    width    = meta.width    ?? null;
    height   = meta.height   ?? null;

    // Convert to webp for smaller size (skip gif)
    if (!ext.toLowerCase().includes('gif')) {
      const webpName = filename.replace(ext, '.webp');
      const webpPath = path.join(UPLOADS_DIR, webpName);
      await sharp(fullPath).webp({ quality: 85 }).toFile(webpPath);
      await fs.unlink(fullPath).catch(() => {});
      finalFilename = webpName;
      const stats = await fs.stat(webpPath);
      fileSize = stats.size;
      return {
        storageType: 'LOCAL',
        filePath:    `/uploads/${webpName}`,
        url:         null,
        publicUrl:   `${BASE_URL}/uploads/${webpName}`,
        width, height, fileSize,
        mimeType: 'image/webp',
      };
    }
  } catch { /* non-fatal */ }

  const stats = await fs.stat(fullPath).catch(() => null);
  fileSize    = stats?.size ?? null;

  return {
    storageType: 'LOCAL',
    filePath:    `/uploads/${finalFilename}`,
    url:         null,
    publicUrl:   `${BASE_URL}/uploads/${finalFilename}`,
    width, height, fileSize,
    mimeType: mimetype,
  };
}

// ── Upload to Cloudinary ──────────────────────────────────────────────────────
async function saveToCloudinary(
  stream: NodeJS.ReadableStream,
): Promise<StoredImage> {
  const cloudinary = await getCloudinary();
  if (!cloudinary) throw new Error('Cloudinary is not configured');

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'hasammie', resource_type: 'image' },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve({
          storageType: 'CLOUDINARY',
          filePath:    null,
          url:         result.secure_url,
          publicUrl:   result.secure_url,
          width:       result.width   ?? null,
          height:      result.height  ?? null,
          fileSize:    result.bytes   ?? null,
          mimeType:    `image/${result.format}`,
        });
      },
    );
    stream.pipe(uploadStream);
  });
}

// ── Main entry — picks storage based on preference ────────────────────────────
export async function storeImage(
  stream: NodeJS.ReadableStream,
  originalName: string,
  mimetype: string,
  preferCloudinary = false,
): Promise<StoredImage> {
  if (preferCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
    return saveToCloudinary(stream);
  }
  return saveToLocal(stream, originalName, mimetype);
}

// ── External URL (just record the URL, no download) ──────────────────────────
export function storeExternalUrl(url: string): StoredImage {
  return {
    storageType: 'URL',
    filePath:    null,
    url,
    publicUrl:   url,
    width:       null,
    height:      null,
    fileSize:    null,
    mimeType:    null,
  };
}

// ── Resolve public URL from DB record ────────────────────────────────────────
export function resolvePublicUrl(
  storageType: string,
  filePath: string | null,
  url: string | null,
): string | null {
  if (storageType === 'LOCAL'      && filePath) return `${BASE_URL}${filePath}`;
  if (storageType === 'CLOUDINARY' && url)      return url;
  if (storageType === 'URL'        && url)      return url;
  return null;
}

// ── Delete local file ────────────────────────────────────────────────────────
export async function deleteLocalFile(filePath: string): Promise<void> {
  const full = path.join(UPLOADS_DIR, path.basename(filePath));
  await fs.unlink(full).catch(() => {});
}
