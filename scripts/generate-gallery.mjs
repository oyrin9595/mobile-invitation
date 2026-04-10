import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const galleryDir = path.join(root, "public", "gallery");
const thumbDir = path.join(galleryDir, "thumb");
const fullDir = path.join(galleryDir, "full");
const outFile = path.join(root, "src", "data", "galleryImages.generated.ts");

const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;
const THUMB_WIDTH = 560;
const FULL_WIDTH = 1800;
const JPEG_QUALITY = 80;

let files = [];
try {
  files = fs
    .readdirSync(galleryDir)
    .filter((f) => imageExt.test(f) && !f.startsWith("."));
} catch {
  files = [];
}

files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

fs.mkdirSync(thumbDir, { recursive: true });
fs.mkdirSync(fullDir, { recursive: true });

const images = [];
for (const file of files) {
  const srcPath = path.join(galleryDir, file);
  const baseName = path.parse(file).name;
  const thumbName = `${baseName}.jpg`;
  const fullName = `${baseName}.jpg`;
  const thumbPath = path.join(thumbDir, thumbName);
  const fullPath = path.join(fullDir, fullName);

  await sharp(srcPath)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toFile(thumbPath);

  await sharp(srcPath)
    .rotate()
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toFile(fullPath);

  images.push({
    thumb: `/gallery/thumb/${thumbName}`,
    full: `/gallery/full/${fullName}`,
  });
}

const banner = `/* 자동 생성 파일 — 직접 수정하지 마세요.\n * public/gallery 폴더를 읽습니다. 갱신: npm run gallery:sync\n */\n`;

fs.writeFileSync(
  outFile,
  `${banner}export type GalleryImage = { thumb: string; full: string };\n` +
    `export const galleryImages: GalleryImage[] = ${JSON.stringify(images, null, 2)};\n`,
  "utf8"
);

console.log(`[gallery:sync] ${images.length}개 최적화 및 목록 갱신 완료`);
