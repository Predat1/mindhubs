import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "src/assets/brand/mindhubs-mark.svg");
const publicDir = path.join(root, "public");
const svg = fs.readFileSync(sourcePath, "utf8");

fs.mkdirSync(publicDir, { recursive: true });

for (const filename of ["favicon.svg", "favicon-32.svg", "favicon-192.svg", "favicon-512.svg"]) {
  fs.writeFileSync(path.join(publicDir, filename), svg);
}

const COLORS = {
  node: [110, 231, 255],
  link: [24, 220, 255],
};

const points = {
  top: [12, 5.25],
  left: [6.25, 16],
  right: [17.75, 16],
};

function blendPixel(buffer, width, x, y, color, alpha = 1) {
  if (x < 0 || y < 0 || x >= width || y >= width || alpha <= 0) return;
  const index = (y * width + x) * 4;
  const sourceAlpha = Math.max(0, Math.min(1, alpha));
  const destinationAlpha = buffer[index + 3] / 255;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha <= 0) return;

  for (let channel = 0; channel < 3; channel += 1) {
    const source = color[channel] * sourceAlpha;
    const destination = buffer[index + channel] * destinationAlpha * (1 - sourceAlpha);
    buffer[index + channel] = Math.round((source + destination) / outputAlpha);
  }
  buffer[index + 3] = Math.round(outputAlpha * 255);
}

function drawCircle(buffer, width, center, radius, color) {
  const minX = Math.floor((center[0] - radius - 1) * width / 24);
  const maxX = Math.ceil((center[0] + radius + 1) * width / 24);
  const minY = Math.floor((center[1] - radius - 1) * width / 24);
  const maxY = Math.ceil((center[1] + radius + 1) * width / 24);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = (x + 0.5) * 24 / width;
      const py = (y + 0.5) * 24 / width;
      const distance = Math.hypot(px - center[0], py - center[1]);
      blendPixel(buffer, width, x, y, color, Math.max(0, Math.min(1, radius + 0.55 - distance)));
    }
  }
}

function drawLine(buffer, width, from, to, strokeWidth, color) {
  const minX = Math.floor((Math.min(from[0], to[0]) - strokeWidth - 1) * width / 24);
  const maxX = Math.ceil((Math.max(from[0], to[0]) + strokeWidth + 1) * width / 24);
  const minY = Math.floor((Math.min(from[1], to[1]) - strokeWidth - 1) * width / 24);
  const maxY = Math.ceil((Math.max(from[1], to[1]) + strokeWidth + 1) * width / 24);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const lengthSquared = dx * dx + dy * dy;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = (x + 0.5) * 24 / width;
      const py = (y + 0.5) * 24 / width;
      const projection = Math.max(0, Math.min(1, ((px - from[0]) * dx + (py - from[1]) * dy) / lengthSquared));
      const nearestX = from[0] + projection * dx;
      const nearestY = from[1] + projection * dy;
      const distance = Math.hypot(px - nearestX, py - nearestY);
      blendPixel(buffer, width, x, y, color, Math.max(0, Math.min(1, strokeWidth / 2 + 0.55 - distance)));
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function renderPng(size) {
  const supersample = size < 256 ? 4 : 2;
  const highSize = size * supersample;
  const high = Buffer.alloc(highSize * highSize * 4);
  const scaled = (value) => value * supersample;
  drawLine(high, highSize, points.top, points.left, 2.2, COLORS.link);
  drawLine(high, highSize, points.top, points.right, 2.2, COLORS.link);
  drawLine(high, highSize, points.left, points.right, 2.2, COLORS.link);
  drawCircle(high, highSize, points.top, 2.15, COLORS.node);
  drawCircle(high, highSize, points.left, 2.15, COLORS.node);
  drawCircle(high, highSize, points.right, 2.15, COLORS.node);

  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (let sy = 0; sy < supersample; sy += 1) {
        for (let sx = 0; sx < supersample; sx += 1) {
          const index = ((y * supersample + sy) * highSize + x * supersample + sx) * 4;
          red += high[index];
          green += high[index + 1];
          blue += high[index + 2];
          alpha += high[index + 3];
        }
      }
      const samples = supersample * supersample;
      const index = (y * size + x) * 4;
      pixels[index] = Math.round(red / samples);
      pixels[index + 1] = Math.round(green / samples);
      pixels[index + 2] = Math.round(blue / samples);
      pixels[index + 3] = Math.round(alpha / samples);
    }
  }

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const [filename, size] of [["favicon.png", 32], ["favicon-32.png", 32], ["favicon-192.png", 192], ["favicon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  fs.writeFileSync(path.join(publicDir, filename), renderPng(size));
}

console.log("MindHubs brand assets synchronized from src/assets/brand/mindhubs-mark.svg");
