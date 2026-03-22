import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const galleryDir = path.join(root, "public", "gallery");
const outFile = path.join(root, "src", "data", "galleryImages.generated.ts");

const imageExt = /\.(jpe?g|png|webp|gif|avif)$/i;

let files = [];
try {
  files = fs.readdirSync(galleryDir).filter((f) => imageExt.test(f) && !f.startsWith("."));
} catch {
  files = [];
}

files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

const urls = files.map((f) => `/gallery/${f.split(path.sep).join("/")}`);

const banner = `/* 자동 생성 파일 — 직접 수정하지 마세요.\n * public/gallery 폴더를 읽습니다. 갱신: npm run gallery:sync\n */\n`;

fs.writeFileSync(
  outFile,
  `${banner}export const galleryImageUrls: string[] = ${JSON.stringify(urls, null, 2)};\n`,
  "utf8"
);

console.log(`[gallery:sync] ${urls.length}개 → src/data/galleryImages.generated.ts`);
