// 用純 Node（無相依套件）產生一個水滴 App 圖示 build/icon.png (256x256)
// electron-builder 會由此 256px PNG 自動產生 Windows 安裝程式所需的 .ico
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE = 256;

function encodePNG(width, height, rgba) {
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  }

  const crcTable = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return c ^ 0xffffffff;
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // 每行前面加 filter byte 0
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

const rgba = Buffer.alloc(SIZE * SIZE * 4);
const cx = SIZE / 2;
const r = SIZE * 0.30; // 底部圓半徑
const cyCircle = SIZE * 0.62; // 圓心
const top = SIZE * 0.12; // 水滴尖端

function insideDrop(x, y) {
  // 底部圓
  if ((x - cx) ** 2 + (y - cyCircle) ** 2 <= r * r) return true;
  // 上方錐形（尖端 → 圓心兩側）
  if (y >= top && y <= cyCircle) {
    const halfW = r * ((y - top) / (cyCircle - top));
    if (Math.abs(x - cx) <= halfW) return true;
  }
  return false;
}

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4;
    if (insideDrop(x, y)) {
      // 由上到下的藍色漸層
      const t = Math.min(Math.max((y - top) / (cyCircle + r - top), 0), 1);
      let R = lerp(0x81, 0x01, t); // 81d4fa -> 0177bd 概念
      let G = lerp(0xd4, 0x77, t);
      let B = lerp(0xfa, 0xbd, t);
      // 左上高光
      const hx = cx - r * 0.35;
      const hy = cyCircle - r * 0.35;
      const hd = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
      if (hd < r * 0.45) {
        const hl = 1 - hd / (r * 0.45);
        R = lerp(R, 255, hl * 0.8);
        G = lerp(G, 255, hl * 0.8);
        B = lerp(B, 255, hl * 0.8);
      }
      rgba[i] = R;
      rgba[i + 1] = G;
      rgba[i + 2] = B;
      rgba[i + 3] = 255;
    } else {
      rgba[i + 3] = 0; // 透明
    }
  }
}

const out = encodePNG(SIZE, SIZE, rgba);
const dest = path.join(__dirname, "icon.png");
fs.writeFileSync(dest, out);
console.log("wrote", dest, out.length, "bytes");
