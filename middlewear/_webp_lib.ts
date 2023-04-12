import decodeJpeg, {
  init as initJpegWasm,
} from "https://esm.sh/@jsquash/jpeg@1.1.5/decode";
import decodePng, {
  init as initPngWasm,
} from "https://esm.sh/@jsquash/png@2.0.0/decode";
// import encodeWebp, {
//   init as initWebpWasm,
// } from "https://esm.sh/@jsquash/webp@1.1.3/encode";
import encodeWebp, { init as initWebpWasm } from "./_webp_encode.ts";

const jpegWasm =
  "https://esm.sh/@jsquash/jpeg@1.1.5/codec/dec/mozjpeg_dec.wasm";
const pngWasm = "https://esm.sh/@jsquash/png@2.0.0/codec/squoosh_png_bg.wasm";
const webpWasm =
  "https://esm.sh/@jsquash/webp@1.1.3/codec/enc/webp_enc_simd.wasm";

async function loadWasmModule(url: string) {
  return await WebAssembly.compileStreaming(fetch(url));
}

export const jpegWasmInit = loadWasmModule(jpegWasm).then(initJpegWasm);
export const pngWasmInit = loadWasmModule(pngWasm).then(initPngWasm);
export const webpWasmInit = loadWasmModule(webpWasm).then(initWebpWasm);

globalThis.ImageData ??= class ImageData {
  colorSpace = "srgb" as const;
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(data: number, width: number);
  constructor(
    data: Uint8ClampedArray | number,
    width: number,
    height?: number,
  ) {
    if (!(data instanceof Uint8ClampedArray) || typeof height !== "number") {
      throw new Error("unimplemented");
    }
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

export async function jpegToWebp(buf: ArrayBuffer) {
  await jpegWasmInit;
  const imageData = await decodeJpeg(buf);
  await webpWasmInit;
  return await encodeWebp(imageData);
}

export async function pngToWebp(buf: ArrayBuffer) {
  await pngWasmInit;
  const imageData = await decodePng(buf);
  await webpWasmInit;
  return await encodeWebp(imageData);
}
