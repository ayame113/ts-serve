import { createTranspiler } from "../src/app/mod.ts";
import { fourceInstantiateWasm } from "../src/utils/fource_instantiate_wasm.ts";
import { MediaType, transpile } from "../src/utils/transpile.ts";

export interface TsServeOptions {
  /** Transpile only if the file name matches this value (format follows URLPattern). */
  targetDir?: string;
  /** If the file name matches this value, it will not be transpiled (format follows URLPattern). */
  excludeDir?: string;
}

/**
 * A Promise that resolves when the wasm files used internally by this library are initialized.
 * Normally you wouldn't use this variable, but if a test gives an error that it's leaking an asynchronous resource, awaiting this promise before running this test might solve the problem.
 */
export const denoEmitWasmInitPromise = fourceInstantiateWasm();

/** Middleware that transpiles TypeScript to JavaScript. */
export function tsServe({ targetDir, excludeDir }: TsServeOptions = {}) {
  return createTranspiler({
    from: [".jsx", ".tsx", ".ts"],
    to: ".js",
    targetDir,
    excludeDir,
    fn(content, { ctx, request }) {
      const url = new URL(request.url);
      const mediaType = {
        ".ts": MediaType.TypeScript,
        ".jsx": MediaType.Jsx,
        ".tsx": MediaType.Tsx,
      }[ctx.type];
      return transpile(content, url, mediaType);
    },
  });
}
