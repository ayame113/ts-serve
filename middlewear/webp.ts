import { createTranspiler } from "../mod.ts";
import { jpegToWebp, pngToWebp } from "./_webp_lib.ts";

export interface WebpConverterOptions {
  /** Transpile only if the file name matches this value (format follows URLPattern). */
  targetDir?: string;
  /** If the file name matches this value, it will not be transpiled (format follows URLPattern). */
  excludeDir?: string;
}

/** Middleware to transpile images to webp. */
export function webpConverter(
  { targetDir, excludeDir }: WebpConverterOptions = {},
) {
  return createTranspiler({
    from: [".jpg", ".jpeg", ".png"],
    to: ".webp",
    type: "arrayBuffer",
    targetDir,
    excludeDir,
    async fn(content, { ctx, request }) {
      if (!request.headers.get("accept")?.includes("image/webp")) {
        throw new Error("Accept header does not contain image/webp.");
      }
      if (ctx.type === ".png") {
        return new Uint8Array(await pngToWebp(content));
      } else {
        return new Uint8Array(await jpegToWebp(content));
      }
    },
  });
}
